import { Mistral } from "@mistralai/mistralai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
export const maxDuration = 30;

type AllowedMime = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

function normalizeMime(raw: string): AllowedMime {
  const t = raw.trim().toLowerCase();
  if (t === "image/png")  return "image/png";
  if (t === "image/gif")  return "image/gif";
  if (t === "image/webp") return "image/webp";
  return "image/jpeg";
}

const EXPENSE_PROMPT = `Tu es un assistant comptable expert en production audiovisuelle française.
Tu reçois le texte OCR d'un ticket de caisse CB et/ou d'une facture.

Extrais les informations et réponds UNIQUEMENT avec un objet JSON valide (aucun texte autour) :

{
  "date": "YYYY-MM-DD",
  "fournisseur": "string (nom du commerçant en majuscules)",
  "montantTTC": number,
  "montantTVA": number,
  "nature": "string (parmi : Carburant / Repas équipe / Hôtel / Péage / Fournitures / Matériel / Transport / Autre)",
  "lieu": "string (ville)",
  "codePCG": "string (606300=carburant, 625700=repas, 625100=hôtel, 613000=péage, 606100=fournitures, 602100=matériel, 625600=transport)"
}

Règles :
- date en YYYY-MM-DD (ex : "21/05/2026" → "2026-05-21")
- montantTTC et montantTVA sont des nombres décimaux (ex : "45,00 €" → 45.0)
- Si TVA non visible : montantTVA = 0
- Omets un champ si introuvable`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      ticketBase64: string;
      ticketMime: string;
      factureBase64?: string;
      factureMime?: string;
    };
    const { ticketBase64, ticketMime, factureBase64, factureMime } = body;

    if (!ticketBase64) {
      return NextResponse.json({ error: "Photo du ticket requise" }, { status: 400 });
    }

    if (!process.env.MISTRAL_API_KEY) {
      return NextResponse.json(
        { error: "Clé API manquante — configurez MISTRAL_API_KEY dans Netlify" },
        { status: 500 }
      );
    }

    const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

    const tMime = normalizeMime(ticketMime);
    const ticketOCR = await client.ocr.process({
      model: "mistral-ocr-latest",
      document: { type: "image_url", imageUrl: `data:${tMime};base64,${ticketBase64}` },
    });
    let combinedText = "=== TICKET CB ===\n" + ticketOCR.pages.map((p) => p.markdown).join("\n");

    if (factureBase64 && factureMime) {
      const fMime = normalizeMime(factureMime);
      const factureOCR = await client.ocr.process({
        model: "mistral-ocr-latest",
        document: { type: "image_url", imageUrl: `data:${fMime};base64,${factureBase64}` },
      });
      combinedText += "\n\n=== FACTURE ===\n" + factureOCR.pages.map((p) => p.markdown).join("\n");
    }

    const chatResponse = await client.chat.complete({
      model: "mistral-small-latest",
      messages: [{ role: "user", content: `${combinedText}\n\n${EXPENSE_PROMPT}` }],
      responseFormat: { type: "json_object" },
    });

    const raw = (chatResponse.choices?.[0]?.message?.content ?? "").toString().trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch?.[0]) {
      return NextResponse.json({ error: "Impossible d'extraire les données du document" }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[extract-frais] error:", msg);
    const safe = msg.length < 120 && !/https?:|at \w/.test(msg) ? msg : "Erreur d'analyse — réessayez.";
    return NextResponse.json({ error: safe }, { status: 500 });
  }
}
