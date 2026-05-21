import { Mistral } from "@mistralai/mistralai";
import { NextRequest, NextResponse } from "next/server";
import type { ExtractionResult } from "@/lib/types/shoot";

export const runtime = "edge";
export const maxDuration = 30;

const EXTRACTION_PROMPT = `Tu es un assistant expert en production cinématographique française. Tu reçois le contenu OCR de plusieurs documents complémentaires pour une même journée de tournage :

1. FEUILLE DE SERVICE — document principal : titre, dates, horaires généraux (call time, repas, fin), lieu principal, météo, informations logistiques (loges, cantine, parking), liste des séquences avec horaires approximatifs, notes par département.
2. JOUR-À-JOUR — détail séquence par séquence : description narrative de chaque scène, liste précise des comédiens par séquence, dialogues ou action clé, durée estimée, décors intérieurs/extérieurs.
3. IMPLANTATION — plan des lieux : positions des véhicules (VL, PL), cantine, loges (HMC), groupe électro, distances, accès, contraintes de stationnement.

INSTRUCTIONS DE FUSION :
- Prends la feuille de service comme base pour les informations générales (titre, jour, date, horaires, lieu, météo).
- Enrichis chaque séquence avec les détails du jour-à-jour : fusionne les deux sur le numéro/label de séquence commun (ex : "Séq 802" apparaît dans les deux docs → une seule entrée enrichie).
- Extrais tous les lieux/distances de l'implantation dans le champ "places".
- Si une information apparaît dans plusieurs docs, privilégie la plus précise.
- Ne crée pas de doublons : une séquence = une entrée dans "sequences".
- Le casting global va dans "cast", le casting par séquence va dans "sequences[].cast".
- Les notes logistiques par département vont dans "deptNotes".
- Les contraintes météo, drone, sécurité vont dans "alerts".
- Les jours suivants (J+1, J+2) mentionnés dans la feuille de service vont dans "nextDays".

Réponds UNIQUEMENT avec un objet JSON valide. Pour chaque champ, indique la confiance : "high" (trouvé clairement), "medium" (déduit/croisé), "low" (incertain). Omets les champs introuvables.

Schéma JSON :
{
  "projectTitle": { "value": "string", "confidence": "high|medium|low" },
  "series": { "value": "string", "confidence": "high|medium|low" },
  "shootingDay": { "value": number, "confidence": "high|medium|low" },
  "totalDays": { "value": number, "confidence": "high|medium|low" },
  "date": { "value": "YYYY-MM-DD", "confidence": "high|medium|low" },
  "location": { "value": "string — lieu principal du tournage", "confidence": "high|medium|low" },
  "callTime": { "value": "HH:MM", "confidence": "high|medium|low" },
  "mealTime": { "value": "HH:MM", "confidence": "high|medium|low" },
  "wrapTime": { "value": "HH:MM", "confidence": "high|medium|low" },
  "weather": { "value": "string", "confidence": "high|medium|low" },
  "logeLocation": { "value": "string — adresse ou nom du lieu loges/HMC", "confidence": "high|medium|low" },
  "canteenLocation": { "value": "string — emplacement de la cantine", "confidence": "high|medium|low" },
  "sequences": {
    "value": [
      {
        "id": "s1",
        "time": "HH:MM",
        "label": "string — ex: Séq. 802 – Découverte du corps",
        "location": "string — INT./EXT. DÉCOR – MOMENT",
        "cast": ["string — prénom ou nom du personnage"],
        "notes": "string — infos spécifiques à cette séquence (optionnel)"
      }
    ],
    "confidence": "high|medium|low"
  },
  "cast": {
    "value": [
      {
        "id": "c1",
        "name": "string — nom du comédien",
        "role": "string — nom du personnage",
        "callTime": "HH:MM",
        "logeLocation": "string — loge attribuée (optionnel)"
      }
    ],
    "confidence": "high|medium|low"
  },
  "deptNotes": {
    "value": [
      {
        "id": "d1",
        "department": "string — ex: Électro, Son, Régie, HMC, Caméra",
        "content": "string — instruction ou info pour ce département",
        "priority": "info|warning|critical"
      }
    ],
    "confidence": "high|medium|low"
  },
  "places": {
    "value": [
      {
        "id": "p1",
        "label": "string — ex: Parking VL, Cantine, HMC, Groupe électro",
        "description": "string — adresse ou description précise",
        "distance": "string — distance par rapport au décor (optionnel)"
      }
    ],
    "confidence": "high|medium|low"
  },
  "alerts": {
    "value": [
      {
        "id": "a1",
        "severity": "info|warning|critical",
        "message": "string — message court et clair",
        "department": "string — département concerné (optionnel)"
      }
    ],
    "confidence": "high|medium|low"
  },
  "nextDays": {
    "value": [
      {
        "date": "YYYY-MM-DD",
        "shootingDay": number,
        "location": "string",
        "callTime": "HH:MM",
        "summary": "string — résumé du jour suivant (optionnel)"
      }
    ],
    "confidence": "high|medium|low"
  }
}

Règles de format :
- IDs courts et uniques : s1/s2… c1/c2… d1/d2… p1/p2… a1/a2…
- Heures en HH:MM (ex: "8h30" → "08:30", "8H00" → "08:00")
- Dates en YYYY-MM-DD
- priority "critical" = danger/urgence, "warning" = attention requise, "info" = information générale`;

interface TextInput {
  text: string;
  filename: string;
  type: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { texts: TextInput[] };
    const { texts } = body;

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: "Aucun texte fourni" }, { status: 400 });
    }

    if (!process.env.MISTRAL_API_KEY) {
      return NextResponse.json(
        { error: "Clé API manquante — configurez MISTRAL_API_KEY dans les variables d'environnement Netlify" },
        { status: 500 }
      );
    }

    const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

    const combinedText = texts
      .map((t) => `=== ${t.filename} (${t.type}) ===\n${t.text}`)
      .join("\n\n");

    const chatResponse = await client.chat.complete({
      model: "mistral-small-latest",
      messages: [
        {
          role: "user",
          content: `${combinedText}\n\n${EXTRACTION_PROMPT}`,
        },
      ],
      responseFormat: { type: "json_object" },
    });

    const raw = (chatResponse.choices?.[0]?.message?.content ?? "").toString().trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch?.[0]) {
      return NextResponse.json({ error: "Impossible d'extraire le JSON de la réponse IA" }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]) as ExtractionResult;
    return NextResponse.json({ result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[extract] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
