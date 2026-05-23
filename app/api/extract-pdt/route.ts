import { Mistral } from "@mistralai/mistralai";
import { NextRequest, NextResponse } from "next/server";
import type { NextDayInfo } from "@/lib/types/shoot";

export const runtime = "nodejs";
export const maxDuration = 60;

const PDT_PROMPT = `Tu es un assistant expert en production cinématographique française.
Tu reçois le contenu OCR d'un Plan de Travail (PDT) de tournage français.

STRUCTURE DU DOCUMENT :
Le PDT est un tableau orienté colonnes — chaque COLONNE représente un jour de tournage.
Les LIGNES (labels en marge gauche) sont des champs fixes pour chaque jour :
- JOUR TOURN. / J. → numéro du jour de tournage
- DATE → date du tournage
- ÉPHÉMÉRIDES → lever/coucher du soleil (optionnel)
- LIEUX → lieu principal (zone géographique)
- HORAIRES PRÉVISIONNELLES / HORAIRES → plage horaire "8H00-17H00"
- REPAS → heure du repas "12H00"
- EFFETS → ligne 1 : ambiance lumière (JOUR, NUIT, JOUR/SOIR, JOUR/CREP, AUBE/JOUR, JOUR/NUIT)
- EFFETS → ligne 2 : décor (EXT, INT, INT/EXT, EXT/INT)
- DÉCORS → description détaillée du décor (souvent texte vertical dans le PDF, OCR peut le donner horizontal)
- SÉQUENCES → numéros de scènes tournées ce jour (liste de nombres)

EXEMPLE d'extraction pour une colonne "J.1 — 4-juin" :
{
  "shootingDay": 1,
  "date": "2026-06-04",
  "location": "LA POTERIE",
  "callTime": "08:00",
  "wrapTime": "17:00",
  "mealTime": "12:00",
  "effects": "JOUR",
  "interior": "EXT",
  "sets": "MAISON MIGUEL MAJOR / TERRAIN BOISÉ / FORÊT-CHEMIN",
  "sequences": ["304", "305", "306", "307", "308", "309"]
}

Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ni après :
{
  "days": [ { ...un objet par colonne jour... } ]
}

RÈGLES STRICTES :
- date : YYYY-MM-DD. "4-juin" ou "4 juin" → "2026-06-04". "10/06/2024" → "2024-06-10". Année absente → 2026.
- shootingDay : entier. "J.5", "05", "JOUR 5" → 5.
- location : zone géographique principale (LIEUX). Plusieurs zones → "ZONE1 / ZONE2".
- callTime : première heure dans HORAIRES. "8H00-17H00" → "08:00". "14H00-23H00" → "14:00". Format HH:MM 24h.
- wrapTime : deuxième heure dans HORAIRES. "8H00-17H00" → "17:00". "14H00-23H00" → "23:00".
- mealTime : heure de REPAS au format HH:MM. "12H00" → "12:00", "18H00" → "18:00".
- effects : valeur de la ligne EFFETS ambiance. Exemples : "JOUR", "NUIT", "JOUR/SOIR", "JOUR/CREP", "AUBE/JOUR", "JOUR/NUIT".
- interior : valeur de la ligne EFFETS décor. Exemples : "EXT", "INT", "INT/EXT", "EXT/INT".
- sets : texte DÉCORS du jour (peut être long, garder complet). Si le texte est coupé ou mélangé par l'OCR, reconstitue le mieux possible.
- sequences : tableau de chaînes — chaque numéro de scène du jour. "304", "301B", "≠" (changement décor) → inclure les numéros uniquement, exclure les "≠".
- summary : si des notes supplémentaires existent (H.Supp, remarques), les mettre ici.
- Inclure TOUS les jours du PDT, même les jours REPOS (effects: "REPOS", sequences: []).
- Ne jamais inventer de données.`;

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
