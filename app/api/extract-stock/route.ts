import { Mistral } from "@mistralai/mistralai";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const STOCK_PROMPT = `Tu es un assistant expert en gestion de matériel technique pour la production cinématographique.
Analyse ce document (feuille de stock / inventaire matériel) et extrais la liste complète des équipements.

LE DOCUMENT PEUT ÊTRE :
- Imprimé (Excel, Word, PDF tableur — listes structurées, plus facile à lire)
- Manuscrit (notes sur cahier, fiche d'inventaire remplie à la main, post-it photographiés)
- Mixte (formulaire imprimé avec ajouts manuscrits dans les marges ou entre les lignes)

GESTION DE L'ÉCRITURE MANUSCRITE :
- Lis ATTENTIVEMENT les annotations manuscrites — listes au stylo, ratures, ajouts en marge, encadrés
- Les ratures qui barrent un article = article supprimé (n'inclus pas)
- Les ajouts en marge / interlignes = nouveaux articles à inclure
- Les chiffres manuscrits côté quantité priment sur les chiffres imprimés rayés
- Une coche ou croix manuscrite peut indiquer un statut : ✓ = "ok", X / barré = "out", ? / "à vérif" = "low"
- En cas de doute sur la lecture manuscrite, choisis la lecture la plus probable et signale-le dans "notes"

Réponds UNIQUEMENT avec un objet JSON valide ayant la forme { "items": [ ... ] }.
Chaque article du tableau "items" doit avoir cette structure :
{
  "name": "Nom complet de l'équipement",
  "quantity": 1,
  "unit": "unité | set | câbles | cartes | rouleaux | packs | kg | etc.",
  "status": "ok | low | out",
  "notes": "informations complémentaires (optionnel — utile pour signaler 'lecture manuscrite incertaine')"
}

Règles :
- "status": "ok" = en bon état / disponible, "low" = stock faible / état dégradé, "out" = épuisé / hors service
- "unit" au singulier si quantity = 1, au pluriel sinon
- Inclure TOUS les équipements listés (imprimés + manuscrits), même s'ils semblent en mauvais état
- Ne JAMAIS inventer un article qui n'est pas dans le document
- Si le document n'est pas une feuille de stock, retourne { "items": [] }`;

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

    if (!base64 || typeof base64 !== "string") return NextResponse.json({ error: "Aucun document fourni" }, { status: 400 });
    if (base64.length > 27_000_000) return NextResponse.json({ error: "Document trop volumineux (max 20 Mo)" }, { status: 413 });
    if (typeof filename === "string" && !/^[\w\-. ]{1,200}$/.test(filename)) {
      return NextResponse.json({ error: "Nom de fichier invalide" }, { status: 400 });
    }
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
      maxTokens: 4096,
      temperature: 0,
    });

    const raw = (chatResponse.choices?.[0]?.message?.content ?? "").toString().trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch?.[0]) return NextResponse.json({ items: [] });

    const parsed = JSON.parse(jsonMatch[0]) as { items?: unknown };
    const items = Array.isArray(parsed.items) ? parsed.items : [];
    return NextResponse.json({ items });
  } catch (err) {
    console.error("[extract-stock] error:", err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: "Erreur lors de l'extraction du stock" }, { status: 500 });
  }
}
