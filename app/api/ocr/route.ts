import { Mistral } from "@mistralai/mistralai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
export const maxDuration = 30;

type AllowedMime = "application/pdf" | "image/jpeg" | "image/png" | "image/gif" | "image/webp";

function normalizeMime(raw: string): AllowedMime | null {
  const t = raw.trim().toLowerCase();
  if (t === "application/pdf" || t === "application/x-pdf") return "application/pdf";
  if (t === "image/jpeg" || t === "image/jpg") return "image/jpeg";
  if (t === "image/png") return "image/png";
  if (t === "image/gif") return "image/gif";
  if (t === "image/webp") return "image/webp";
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { base64: string; mediaType: string; filename: string };
    const { base64, mediaType: rawMime, filename } = body;

    if (!process.env.MISTRAL_API_KEY) {
      return NextResponse.json(
        { error: "Clé API manquante — configurez MISTRAL_API_KEY dans les variables d'environnement Netlify" },
        { status: 500 }
      );
    }

    const mime = normalizeMime(rawMime);
    if (!mime) {
      return NextResponse.json({ error: `Format non supporté: ${rawMime}` }, { status: 400 });
    }

    const data = base64.replace(/[^A-Za-z0-9+/=]/g, "");
    if (!data) {
      return NextResponse.json({ error: "Données vides" }, { status: 400 });
    }

    const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
    const dataUrl = `data:${mime};base64,${data}`;
    const isImage = mime !== "application/pdf";

    const result = await client.ocr.process({
      model: "mistral-ocr-latest",
      document: isImage
        ? { type: "image_url", imageUrl: dataUrl }
        : { type: "document_url", documentUrl: dataUrl },
    });

    const text = result.pages.map((p) => p.markdown).join("\n\n---\n\n");
    return NextResponse.json({ text, filename });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[ocr] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
