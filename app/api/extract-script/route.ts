import { Mistral } from "@mistralai/mistralai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
export const maxDuration = 60;

interface SeqRef {
  id: string;
  label: string;
  time?: string;
}

interface ScriptResult {
  id: string;
  script: string;
}

const SCRIPT_PROMPT = `Tu es un assistant expert en production cinématographique.
Tu reçois le contenu OCR d'un document JOUR-À-JOUR (narratif scène par scène) et une liste de séquences à enrichir.

OBJECTIF
Pour CHAQUE séquence de la liste, retrouve dans le jour-à-jour le bloc de texte qui décrit cette scène et extrais-le INTÉGRALEMENT.

MATCHING
Une séquence est identifiée par son label (ex: "Séq. 815 — L'oncle de Théo parle") qui contient typiquement le numéro de scène (815). Cherche ce numéro dans le jour-à-jour pour retrouver le bloc correspondant. Le label peut aussi mentionner un titre — utilise-le comme indice secondaire.

CONTENU À EXTRAIRE
- Description de l'action : ce qui se passe, mouvements des personnages, mise en scène
- Dialogues clés s'ils sont mentionnés (entre guillemets)
- Plans / valeurs de cadre si précisés (gros plan, plan large, traveling…)
- Conserver la structure en paragraphes si elle existe (séparer par \\n\\n)
- Inclure TOUT ce qui concerne cette séquence dans le jour-à-jour, même s'il y a plusieurs paragraphes

NE PAS INCLURE
- Notes purement techniques qui appartiennent à d'autres champs (cascades, drone, effets) — on a déjà un champ \`notes\` ailleurs
- Texte d'autres séquences

RÉPONSE
Réponds UNIQUEMENT avec un objet JSON valide de la forme :
{ "scripts": [ { "id": "<id de la séquence>", "script": "<texte narratif>" } ] }

Si une séquence n'apparaît pas dans le jour-à-jour, omets-la du tableau. N'invente JAMAIS de contenu.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { sequences: SeqRef[]; dayToDayText: string };
    const { sequences, dayToDayText } = body;

    if (!Array.isArray(sequences) || sequences.length === 0) {
      return NextResponse.json({ error: "Aucune séquence fournie" }, { status: 400 });
    }
    if (!dayToDayText || typeof dayToDayText !== "string" || dayToDayText.trim().length === 0) {
      return NextResponse.json({ error: "Texte du jour-à-jour vide" }, { status: 400 });
    }
    if (dayToDayText.length > 200_000) {
      return NextResponse.json({ error: "Document jour-à-jour trop volumineux" }, { status: 413 });
    }
    if (sequences.length > 50) {
      return NextResponse.json({ error: "Trop de séquences (max 50)" }, { status: 400 });
    }

    if (!process.env.MISTRAL_API_KEY) {
      return NextResponse.json(
        { error: "Clé API manquante — configurez MISTRAL_API_KEY" },
        { status: 500 }
      );
    }

    const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

    const seqList = sequences
      .map((s) => `- id="${s.id}" — ${s.label}${s.time ? ` (${s.time})` : ""}`)
      .join("\n");

    const userContent = `LISTE DES SÉQUENCES À ENRICHIR :\n${seqList}\n\n=== JOUR-À-JOUR ===\n${dayToDayText}\n\n${SCRIPT_PROMPT}`;

    const chatResponse = await client.chat.complete({
      model: "mistral-small-latest",
      messages: [{ role: "user", content: userContent }],
      responseFormat: { type: "json_object" },
      maxTokens: 16384,
      temperature: 0,
    });

    const raw = (chatResponse.choices?.[0]?.message?.content ?? "").toString().trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch?.[0]) {
      return NextResponse.json({ error: "Impossible d'extraire le texte du jour-à-jour" }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]) as { scripts?: ScriptResult[] };
    const scripts = Array.isArray(parsed.scripts) ? parsed.scripts : [];

    return NextResponse.json({ scripts });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[extract-script] error:", msg);
    const safe = msg.length < 120 && !/https?:|at \w/.test(msg) ? msg : "Erreur d'analyse — réessayez.";
    return NextResponse.json({ error: safe }, { status: 500 });
  }
}
