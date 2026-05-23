import { Mistral } from "@mistralai/mistralai";
import { NextRequest, NextResponse } from "next/server";
import type { NextDayInfo } from "@/lib/types/shoot";

export const runtime = "nodejs";
export const maxDuration = 60;

const PDT_PROMPT = `Tu es un assistant expert en production cinématographique française.
Tu reçois le contenu OCR d'un Plan de Travail (PDT) ou d'un planning de tournage français.

Ces documents se présentent souvent sous forme de tableau avec des colonnes :
- Numéro de jour de tournage (JOUR TOURN, J., n°, etc.)
- Date (JJ/MM/AAAA ou JJ/MM ou LUNDI 10 JUIN…)
- Lieu(x) / Décor(s)
- Horaires prévisionnels, Convocation (HH:MM ou HhMM)
- Heure de repas, Notes

Ton objectif : extraire CHAQUE ligne du tableau comme un objet "day".

Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ni après :
{
  "days": [
    {
      "date": "YYYY-MM-DD",
      "shootingDay": 1,
      "location": "Nom du lieu",
      "callTime": "08:00",
      "summary": "Repas 12h30 — INT. BUREAU"
    }
  ]
}

Règles strictes :
- date : toujours YYYY-MM-DD. "10/06/2024" → "2024-06-10". "LUNDI 10 JUIN" → "2026-06-10". Si année absente, utilise 2026.
- shootingDay : numéro entier (ex: "J.5", "05", "JOUR 5" → 5). Si non numéroté, déduis-le de l'ordre.
- location : lieu principal. Plusieurs lieux → séparés par " / ".
- callTime : heure de début au format HH:MM sur 24h. "8H00"→"08:00", "07h30"→"07:30", "7H"→"07:00". Si absent, omets.
- summary : heure de repas + notes utiles. Ex: "Repas 12h30 — Décor INT BUREAU — EXT JARDIN".
- Inclure TOUS les jours, même REPOS ou jours sans tournage (summary: "Repos").
- Si le document contient plusieurs productions ou semaines, extraire tous les jours.
- Ne jamais inventer de données absentes du document.`;

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

    const cleanBase64 = pdfBase64.replace(/[^A-Za-z0-9+/=]/g, "");
    if (!cleanBase64) {
      return NextResponse.json({ error: "Fichier PDF invalide" }, { status: 400 });
    }

    const mime = pdfMime === "application/pdf" || pdfMime === "application/x-pdf"
      ? "application/pdf"
      : "application/pdf";

    const ocrResult = await client.ocr.process({
      model: "mistral-ocr-latest",
      document: { type: "document_url", documentUrl: `data:${mime};base64,${cleanBase64}` },
    });

    const text = ocrResult.pages.map((p) => p.markdown).join("\n\n---\n\n");

    if (!text.trim()) {
      return NextResponse.json({ error: "Impossible de lire le contenu du PDF" }, { status: 422 });
    }

    const chatResponse = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [
        { role: "system", content: PDT_PROMPT },
        { role: "user", content: `Voici le contenu OCR du Plan de Travail à analyser :\n\n${text}` },
      ],
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
