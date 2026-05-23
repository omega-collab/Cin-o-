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

const EXPENSE_PROMPT = `Tu es un assistant comptable pour une production audiovisuelle française.
Tu reçois le texte OCR d'un ticket/facture de tournage.

Réponds UNIQUEMENT avec un objet JSON valide (aucun texte autour) :

{
  "date": "YYYY-MM-DD",
  "fournisseur": "NOM DU COMMERCE EN MAJUSCULES",
  "nature": "Carburant | Repas équipe | Hôtel | Péage | Matériel | Fournitures | Transport | Autre",
  "montantTTC": number,
  "plaqueImmat": "XX 000 XX ou null"
}

Règles strictes :
- date en YYYY-MM-DD (ex : "20/01/2024" → "2024-01-20")
- fournisseur : nom exact du commerce/station (ex: "STATION CAP TAUPINIERE", "HOTEL MERIDIEN")
- nature : choisir parmi les valeurs listées uniquement
- montantTTC : montant TOTAL payé en euros, nombre décimal (ex: "20 €" → 20.0)
- plaqueImmat : immatriculation du véhicule si présente dans le document (format ex: "HA 010 EP", "AB-123-CD"), sinon null
- Omets un champ si vraiment introuvable (sauf plaqueImmat qui vaut null si absent)`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      ticketBase64: string;
      ticketMime: string;
      factureBase64?: string;
      factureMime?: string;
    };
    const { ticketBase64, ticketMime, factureBase64, factureMime } = body;

    if (!ticketBase64 || typeof ticketBase64 !== "string") {
      return NextResponse.json({ error: "Photo du ticket requise" }, { status: 400 });
    }
    if (ticketBase64.length > 27_000_000) {
      return NextResponse.json({ error: "Photo trop volumineuse (max 20 Mo)" }, { status: 413 });
    }
    if (factureBase64 && factureBase64.length > 27_000_000) {
      return NextResponse.json({ error: "Facture trop volumineuse (max 20 Mo)" }, { status: 413 });
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
