/**
 * Script d'ingestion des conventions collectives IDCC 2642 et IDCC 3097.
 *
 * Usage : npx tsx scripts/ingestLegalConventions.ts
 *
 * Sorties :
 *   src/data/legal/legalCorpus.generated.json  — corpus complet
 *
 * Prérequis :
 *   MISTRAL_API_KEY env var (OCR + extraction via Mistral)
 *
 * Architecture :
 *   1. Télécharge les PDFs via les sources prioritaires (Légifrance → SPI → ATCAC/AFAR)
 *   2. Passe chaque PDF en OCR (Mistral)
 *   3. Découpe par article/section
 *   4. Détecte les salaires et intitulés de postes
 *   5. Tague avec LegalTag[]
 *   6. Écrit le JSON final
 *
 * Note : Légifrance et la plupart des sources professionnelles retournent 403.
 * En pratique, les PDFs doivent être téléchargés manuellement et placés dans
 * scripts/sources/ avant de lancer ce script.
 */

import fs from "fs";
import path from "path";

// ── types locaux (indépendants du build Next.js) ──────────────────────────────

interface SalaryData {
  jobTitle: string;
  sector: string;
  idcc: "2642" | "3097";
  amountGross: number;
  currency: "EUR";
  period: string;
  effectiveDate?: string;
  notes?: string;
}

interface LegalDocumentChunk {
  id: string;
  sourceId: string;
  idcc: "2642" | "3097" | "commun";
  sector: string;
  title: string;
  article?: string;
  section?: string;
  chunkText: string;
  plainText: string;
  keywords: string[];
  legalTags: string[];
  jobTitles?: string[];
  salaryData?: SalaryData[];
  sourceUrl: string;
  effectiveDate?: string;
  extensionStatus?: string;
  lastCheckedAt: string;
}

// ── job title detection ───────────────────────────────────────────────────────

const JOB_PATTERNS: Array<{ pattern: RegExp; canonical: string }> = [
  { pattern: /chef.op[eé]rateur|directeur.de.la.photographie|dop\b/gi, canonical: "chef opérateur" },
  { pattern: /cadreur|op[eé]rateur.de.prises.de.vues|opv\b/gi, canonical: "cadreur" },
  { pattern: /1er.assistant.cam[eé]ra|premier.assistant.cam[eé]ra|first.ac\b/gi, canonical: "premier assistant caméra" },
  { pattern: /2[eè].{0,4}assistant.cam[eé]ra|deuxi[eè]me.assistant.cam[eé]ra|second.ac\b/gi, canonical: "deuxième assistant caméra" },
  { pattern: /3[eè].{0,4}assistant.cam[eé]ra|troisi[eè]me.assistant.cam[eé]ra/gi, canonical: "troisième assistant caméra" },
  { pattern: /vid[eé]o.assist|retour.image|technicien.retour.image/gi, canonical: "vidéo assist" },
];

function detectJobTitles(text: string): string[] {
  const found = new Set<string>();
  for (const { pattern, canonical } of JOB_PATTERNS) {
    if (pattern.test(text)) found.add(canonical);
    pattern.lastIndex = 0;
  }
  return Array.from(found);
}

// ── salary detection ──────────────────────────────────────────────────────────

const SALARY_PATTERN =
  /(\d{1,2}[\s ]?\d{3}(?:[,\.]\d{2})?)\s*[€EeUuRr]{1,3}\s*(?:\/?\s*(semaine|mois|heure|jour|h\b|sem\b|mensuel))?/gi;

function detectSalaries(text: string, idcc: "2642" | "3097"): SalaryData[] {
  const results: SalaryData[] = [];
  let m: RegExpExecArray | null;
  SALARY_PATTERN.lastIndex = 0;

  while ((m = SALARY_PATTERN.exec(text)) !== null) {
    const raw = (m[1] ?? "").replace(/[\s ]/g, "").replace(",", ".");
    const amount = parseFloat(raw);
    if (isNaN(amount) || amount < 5 || amount > 50000) continue;

    const periodRaw = (m[2] ?? "").toLowerCase();
    let period: SalaryData["period"] = "week_39h";
    if (periodRaw.includes("mois") || periodRaw.includes("mensuel")) period = "month_39h";
    else if (periodRaw.includes("heure") || periodRaw === "h") period = "hour";
    else if (periodRaw.includes("jour")) period = "day_8h";

    results.push({
      jobTitle: "À identifier",
      sector: idcc === "2642" ? "audiovisuel" : "cinema",
      idcc,
      amountGross: amount,
      currency: "EUR",
      period,
    });
  }
  SALARY_PATTERN.lastIndex = 0;
  return results;
}

// ── tag detection ─────────────────────────────────────────────────────────────

const TAG_RULES: Array<{ keywords: RegExp; tag: string }> = [
  { keywords: /salaire|minima|r[eé]mun[eé]ration|cachet|plancher/gi, tag: "salaire" },
  { keywords: /grille.salaire|minima.conventionnels/gi, tag: "grille_salaire" },
  { keywords: /classification|groupe|cat[eé]gorie/gi, tag: "classification" },
  { keywords: /cam[eé]ra|cam[eé]raman|assistant.cam/gi, tag: "camera" },
  { keywords: /image|photographie|cadrage/gi, tag: "image" },
  { keywords: /cddu|contrat.d.usage|interm/gi, tag: "cddu" },
  { keywords: /heures.suppl[eé]mentaires|d[eé]passement/gi, tag: "heures_sup" },
  { keywords: /travail.de.nuit|heures.de.nuit/gi, tag: "nuit" },
  { keywords: /repos|amplitude/gi, tag: "repos" },
  { keywords: /repas|casse-cro[uû]te|panier/gi, tag: "repas" },
  { keywords: /transport|d[eé]placement|kilom[eé]trique/gi, tag: "transport" },
  { keywords: /vhss|harc[eè]lement|sexisme/gi, tag: "vhss" },
  { keywords: /mineur|enfant|autorisation.pr[eé]fectorale/gi, tag: "mineurs" },
  { keywords: /pr[eé]voyance|mutuelle|audiens/gi, tag: "prevoyance" },
  { keywords: /sant[eé]|m[eé]decine/gi, tag: "sante" },
  { keywords: /fiction/gi, tag: "fiction" },
  { keywords: /flux|[eé]mission|magazine/gi, tag: "flux" },
  { keywords: /documentaire/gi, tag: "documentaire" },
  { keywords: /anim[ea]tion/gi, tag: "animation" },
  { keywords: /publicit[eé]/gi, tag: "publicite" },
  { keywords: /captation/gi, tag: "captation" },
];

function detectTags(text: string): string[] {
  const tags = new Set<string>();
  for (const { keywords, tag } of TAG_RULES) {
    if (keywords.test(text)) tags.add(tag);
    keywords.lastIndex = 0;
  }
  return Array.from(tags);
}

// ── article chunker ───────────────────────────────────────────────────────────

interface RawArticle {
  article: string;
  title: string;
  text: string;
}

function chunkByArticle(fullText: string): RawArticle[] {
  const articlePattern = /(?:^|\n)(Art(?:icle)?\.?\s*[\dIVXLCM]+[-\.\s].*?)(?=\n(?:Art(?:icle)?\.?\s*[\dIVXLCM]+|$))/gi;
  const chunks: RawArticle[] = [];
  let m: RegExpExecArray | null;

  while ((m = articlePattern.exec(fullText)) !== null) {
    const block = (m[1] ?? "").trim();
    const lines = block.split("\n");
    const titleLine = (lines[0] ?? "").trim();
    const body = lines.slice(1).join("\n").trim();
    if (body.length > 100) {
      chunks.push({
        article: titleLine.match(/Art(?:icle)?\.?\s*([\dIVXLCM]+)/i)?.[1] ?? "?",
        title: titleLine,
        text: body.slice(0, 2000),
      });
    }
  }

  return chunks;
}

// ── main ingestion ────────────────────────────────────────────────────────────

interface SourceDef {
  id: string;
  idcc: "2642" | "3097";
  sector: string;
  sourceUrl: string;
  localFile: string;
  effectiveDate?: string;
  extensionStatus?: string;
}

const SOURCES: SourceDef[] = [
  {
    id: "ccn-pav-2642-legifrance",
    idcc: "2642",
    sector: "audiovisuel",
    sourceUrl: "https://www.legifrance.gouv.fr/conv_coll/id/KALICONT000018828041",
    localFile: "scripts/sources/ccn-2642.pdf",
  },
  {
    id: "ccn-cinema-3097-legifrance",
    idcc: "3097",
    sector: "cinema",
    sourceUrl: "https://www.legifrance.gouv.fr/conv_coll/id/KALICONT000028059838",
    localFile: "scripts/sources/ccn-3097.pdf",
  },
  {
    id: "ccn-cinema-3097-consolidee-spi-2024",
    idcc: "3097",
    sector: "cinema",
    sourceUrl: "https://lespi.org/wp-content/uploads/2024/07/CCN-Production-cinema-consolidee-juin-24.pdf",
    localFile: "scripts/sources/ccn-3097-spi-2024.pdf",
    effectiveDate: "2024-06-01",
    extensionStatus: "etendu",
  },
  {
    id: "pav-2642-grilles-spiac-cgt",
    idcc: "2642",
    sector: "audiovisuel",
    sourceUrl: "https://spiac-cgt.org/salaires-conventions-collectives/salaires/salaires-production-audiovisuelle/",
    localFile: "scripts/sources/grilles-2642-spiac.pdf",
    effectiveDate: "2024-06-01",
  },
];

async function ingest(): Promise<void> {
  const chunks: LegalDocumentChunk[] = [];
  const today = new Date().toISOString().slice(0, 10);

  const mistralKey = process.env.MISTRAL_API_KEY;
  if (!mistralKey) {
    console.error("MISTRAL_API_KEY manquant — définissez la variable d'environnement.");
    process.exit(1);
  }

  for (const source of SOURCES) {
    if (!fs.existsSync(source.localFile)) {
      console.warn(`[skip] ${source.localFile} absent — téléchargez manuellement depuis ${source.sourceUrl}`);
      continue;
    }

    console.log(`[ingest] Traitement : ${source.localFile}`);

    // OCR via Mistral
    const pdfBuffer = fs.readFileSync(source.localFile);
    const base64 = pdfBuffer.toString("base64");

    const ocrResp = await fetch("https://api.mistral.ai/v1/ocr", {
      method: "POST",
      headers: { Authorization: `Bearer ${mistralKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral-ocr-latest",
        document: { type: "document_url", documentUrl: `data:application/pdf;base64,${base64}` },
      }),
    });

    if (!ocrResp.ok) {
      console.error(`[ocr error] ${source.id}: ${ocrResp.status}`);
      continue;
    }

    const ocrData = (await ocrResp.json()) as { pages: Array<{ markdown: string }> };
    const fullText = ocrData.pages.map((p) => p.markdown).join("\n\n");

    const articles = chunkByArticle(fullText);
    console.log(`  → ${articles.length} articles détectés`);

    for (const art of articles) {
      const id = `${source.id}-art-${art.article.replace(/\s+/g, "-").toLowerCase()}`;
      const combined = `${art.title}\n${art.text}`;
      const jobTitles = detectJobTitles(combined);
      const salaryData = detectSalaries(combined, source.idcc);
      const legalTags = detectTags(combined);

      chunks.push({
        id,
        sourceId: source.id,
        idcc: source.idcc,
        sector: source.sector,
        title: art.title,
        article: art.article,
        chunkText: art.text,
        plainText: art.text
          .toLowerCase()
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .replace(/\s+/g, " ")
          .trim(),
        keywords: [],
        legalTags,
        jobTitles: jobTitles.length > 0 ? jobTitles : undefined,
        salaryData: salaryData.length > 0 ? salaryData : undefined,
        sourceUrl: source.sourceUrl,
        effectiveDate: source.effectiveDate,
        extensionStatus: source.extensionStatus,
        lastCheckedAt: today,
      });
    }
  }

  const outDir = path.join(process.cwd(), "src/data/legal");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "legalCorpus.generated.json");
  fs.writeFileSync(outFile, JSON.stringify(chunks, null, 2), "utf-8");

  console.log(`\n✓ ${chunks.length} chunks générés → ${outFile}`);
}

ingest().catch((err) => {
  console.error("[fatal]", err);
  process.exit(1);
});
