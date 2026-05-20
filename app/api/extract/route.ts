import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import type { ExtractionResult } from "@/lib/types/shoot";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const EXTRACTION_PROMPT = `Tu es un assistant spécialisé dans l'extraction de données de feuilles de service cinématographiques françaises.

Analyse le ou les documents fournis (feuilles de service, jour-à-jour, implantation) et extrais les informations structurées.

Réponds UNIQUEMENT avec un objet JSON valide respectant exactement ce schéma. Pour chaque champ, indique une confiance : "high" (trouvé clairement), "medium" (déduit), "low" (incertain). Omets les champs introuvables.

Schéma JSON à retourner :
{
  "projectTitle": { "value": "string", "confidence": "high|medium|low" },
  "series": { "value": "string", "confidence": "high|medium|low" },
  "shootingDay": { "value": number, "confidence": "high|medium|low" },
  "totalDays": { "value": number, "confidence": "high|medium|low" },
  "date": { "value": "YYYY-MM-DD", "confidence": "high|medium|low" },
  "location": { "value": "string", "confidence": "high|medium|low" },
  "callTime": { "value": "HH:MM", "confidence": "high|medium|low" },
  "mealTime": { "value": "HH:MM", "confidence": "high|medium|low" },
  "wrapTime": { "value": "HH:MM", "confidence": "high|medium|low" },
  "weather": { "value": "string", "confidence": "high|medium|low" },
  "logeLocation": { "value": "string", "confidence": "high|medium|low" },
  "canteenLocation": { "value": "string", "confidence": "high|medium|low" },
  "sequences": {
    "value": [
      { "id": "uuid", "time": "HH:MM", "label": "string", "location": "string", "cast": ["string"], "notes": "string" }
    ],
    "confidence": "high|medium|low"
  },
  "cast": {
    "value": [
      { "id": "uuid", "name": "string", "role": "string", "callTime": "HH:MM", "logeLocation": "string" }
    ],
    "confidence": "high|medium|low"
  },
  "deptNotes": {
    "value": [
      { "id": "uuid", "department": "string", "content": "string", "priority": "info|warning|critical" }
    ],
    "confidence": "high|medium|low"
  },
  "places": {
    "value": [
      { "id": "uuid", "label": "string", "description": "string", "distance": "string" }
    ],
    "confidence": "high|medium|low"
  },
  "alerts": {
    "value": [
      { "id": "uuid", "severity": "info|warning|critical", "message": "string", "department": "string" }
    ],
    "confidence": "high|medium|low"
  },
  "nextDays": {
    "value": [
      { "date": "YYYY-MM-DD", "shootingDay": number, "location": "string", "callTime": "HH:MM", "summary": "string" }
    ],
    "confidence": "high|medium|low"
  }
}

Pour les champs "id" dans les tableaux, génère des identifiants courts uniques (ex: "s1", "c1", "d1").
Convertis les heures en format HH:MM (ex: "8h30" → "08:30").
Convertis les dates en format YYYY-MM-DD.
Pour la priorité des notes départements : "critical" si urgent/danger, "warning" si attention requise, "info" sinon.`;

interface DocInput {
  base64: string;
  mediaType: string;
  filename: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { docs: DocInput[] };
    const { docs } = body;

    if (!docs || docs.length === 0) {
      return NextResponse.json({ error: "Aucun document fourni" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "Clé API manquante" }, { status: 500 });
    }

    const contentBlocks: Anthropic.Messages.ContentBlockParam[] = [];

    for (const doc of docs) {
      if (doc.mediaType === "application/pdf") {
        contentBlocks.push({
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: doc.base64,
          },
          title: doc.filename,
        } as Anthropic.Messages.RequestDocumentBlock);
      } else if (doc.mediaType.startsWith("image/")) {
        contentBlocks.push({
          type: "image",
          source: {
            type: "base64",
            media_type: doc.mediaType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
            data: doc.base64,
          },
        });
      }
    }

    contentBlocks.push({ type: "text", text: EXTRACTION_PROMPT });

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 4096,
      messages: [{ role: "user", content: contentBlocks }],
    });

    const firstContent = message.content[0];
    if (!firstContent || firstContent.type !== "text") {
      return NextResponse.json({ error: "Réponse inattendue du modèle" }, { status: 500 });
    }

    const raw = firstContent.text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch || !jsonMatch[0]) {
      return NextResponse.json({ error: "Impossible d'extraire le JSON" }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]) as ExtractionResult;
    return NextResponse.json({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
