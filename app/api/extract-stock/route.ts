import { Mistral } from "@mistralai/mistralai";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const STOCK_PROMPT = `Tu es un assistant expert en gestion de matériel technique pour la production cinématographique.
Analyse ce document (feuille de stock / inventaire matériel) et extrais la liste complète des équipements.

Réponds UNIQUEMENT avec un tableau JSON valide. Chaque article doit avoir cette structure :
[
  {
    "name": "Nom complet de l'équipement",
    "quantity": 1,
    "unit": "unité | set | câbles | cartes | rouleaux | packs | kg | etc.",
    "status": "ok | low | out",
    "notes": "informations complémentaires (optionnel)"
  }
]

Règles :
- "status": "ok" = en bon état / disponible, "low" = stock faible / état dégradé, "out" = épuisé / hors service
- "unit" au singulier si quantity = 1, au pluriel sinon
- Inclure TOUS les équipements listés, même s'ils semblent en mauvais état
- Si le document n'est pas une feuille de stock, retourne []`;

function normalizeMediaType(raw: string): "application/pdf" | "image/jpeg" | "image/png" | "image/gif" | "image/webp" | null {
  const t = raw.trim().toLowerCase();
  if (t === "application/pdf" || t === "application/x-pdf") return "application/pdf";
  if (t === "image/jpeg" || t === "image/jpg") return "image/jpeg";
  if (t === "image/png") return "image/png";
  if (t === "image/gif") return "image/gif";
  if (t === "image/webp") return "image/webp";
  return null;
}

function sanitizeBase64(data: string): string {
  return data.replace(/[^A-Za-z0-9+/=]/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { base64: string; mediaType: string; filename: string };
    const { base64, mediaType, filename } = body;

    if (!base64) return NextResponse.json({ error: "Aucun document fourni" }, { status: 400 });
    if (!process.env.MISTRAL_API_KEY) return NextResponse.json({ error: "Clé API manquante — vérifiez MISTRAL_API_KEY dans Netlify" }, { status: 500 });

    const mimeType = normalizeMediaType(mediaType);
    if (!mimeType) return NextResponse.json({ error: `Format non supporté: ${mediaType}` }, { status: 400 });

    const data = sanitizeBase64(base64);
    if (!data) return NextResponse.json({ error: "Document vide ou corrompu" }, { status: 400 });

    const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
    const dataUrl = `data:${mimeType};base64,${data}`;
    const isImage = mimeType !== "application/pdf";

    const ocrResult = await client.ocr.process({
      model: "mistral-ocr-latest",
      document: isImage
        ? { type: "image_url", imageUrl: dataUrl }
        : { type: "document_url", documentUrl: dataUrl },
    });

    const docText = ocrResult.pages.map((p) => p.markdown).join("\n\n---\n\n");

    const chatResponse = await client.chat.complete({
      model: "mistral-small-latest",
      messages: [{ role: "user", content: `=== ${filename} ===\n${docText}\n\n${STOCK_PROMPT}` }],
      responseFormat: { type: "json_object" },
    });

    const raw = (chatResponse.choices?.[0]?.message?.content ?? "").toString().trim();
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch?.[0]) return NextResponse.json({ items: [] });

    const items = JSON.parse(jsonMatch[0]) as unknown[];
    return NextResponse.json({ items });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[extract-stock] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
