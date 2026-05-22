import { Mistral } from "@mistralai/mistralai";
import { NextRequest, NextResponse } from "next/server";
import type { NextDayInfo } from "@/lib/types/shoot";

export const runtime = "edge";
export const maxDuration = 30;

const PDT_PROMPT = `Tu es un assistant expert en production cinématographique française.
Tu analyses un Plan de Travail (PDT) ou un planning de tournage.

Ce document liste les jours de tournage avec leurs informations : numéro de jour, date, lieu(x), horaires prévisionnels, heure de repas.

Extrais TOUS les jours de tournage présents dans le document.

Réponds UNIQUEMENT avec un objet JSON valide de cette forme exacte :
{
  "days": [
    {
      "date": "YYYY-MM-DD",
      "shootingDay": 1,
      "location": "Nom du lieu",
      "callTime": "08:00",
      "summary": "Repas 12h30"
    }
  ]
}

Règles strictes :
- date : toujours au format YYYY-MM-DD (ex: "10/06/2024" → "2024-06-10"). Si l'année n'est pas précisée, utilise 2026.
- shootingDay : numéro entier du jour de tournage (colonne "JOUR TOURN" ou "J.")
- location : lieu principal du tournage ce jour-là. Si plusieurs lieux, les séparer par " / ".
- callTime : heure de début prévue au format "HH:MM" (ex: "8H00" → "08:00", "07H30" → "07:30"). Extraire depuis la colonne "HORAIRES PRÉVISIONNELLES" ou "Convocation". Si absent, omets le champ.
- summary : toute information complémentaire utile (heure de repas, remarques, décors spéciaux). Ex: "Repas 12h00 — Décor INT".
- Inclure TOUS les jours listés, même les jours marqués "REPOS" (avec shootingDay tel quel et summary "Repos").
- Ne pas inventer de données absentes.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { pdfBase64: string; pdfMime?: string };
    const { pdfBase64, pdfMime = "application/pdf" } = body;

    if (!pdfBase64) {
      return NextResponse.json({ error: "Fichier PDF requis" }, { status: 400 });
    }

    if (!process.env.MISTRAL_API_KEY) {
      return NextResponse.json(
        { error: "Clé API manquante — configurez MISTRAL_API_KEY" },
        { status: 500 }
      );
    }

    const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

    const ocrResult = await client.ocr.process({
      model: "mistral-ocr-latest",
      document: { type: "document_url", documentUrl: `data:${pdfMime};base64,${pdfBase64}` },
    });

    const text = ocrResult.pages.map((p) => p.markdown).join("\n\n");

    if (!text.trim()) {
      return NextResponse.json({ error: "Impossible de lire le contenu du PDF" }, { status: 422 });
    }

    const chatResponse = await client.chat.complete({
      model: "mistral-small-latest",
      messages: [{ role: "user", content: `${text}\n\n${PDT_PROMPT}` }],
      responseFormat: { type: "json_object" },
    });

    const raw = (chatResponse.choices?.[0]?.message?.content ?? "").toString().trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch?.[0]) {
      return NextResponse.json({ error: "Impossible d'extraire le planning" }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]) as { days?: NextDayInfo[] };
    const days: NextDayInfo[] = Array.isArray(parsed.days) ? parsed.days : [];

    if (days.length === 0) {
      return NextResponse.json({ error: "Aucun jour de tournage détecté dans ce document" }, { status: 422 });
    }

    return NextResponse.json({ days });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[extract-pdt] error:", msg);
    const safe = msg.length < 120 && !/https?:|at \w/.test(msg) ? msg : "Erreur d'analyse — réessayez.";
    return NextResponse.json({ error: safe }, { status: 500 });
  }
}
