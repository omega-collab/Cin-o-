import type { LegalDocumentChunk, LegalTag } from "./legalTypes";
import { expandQuery } from "./legalTypes";
import { LEGAL_CHUNKS } from "./legalCorpus";

export interface SearchOptions {
  idcc?: "2642" | "3097" | "commun";
  tags?: LegalTag[];
  limit?: number;
}

export interface SearchResult {
  chunk: LegalDocumentChunk;
  score: number;
  matchedTerms: string[];
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();
}

function scoreChunk(chunk: LegalDocumentChunk, terms: string[]): { score: number; matched: string[] } {
  if (terms.length === 0) return { score: 0, matched: [] };

  const nTitle = normalize(chunk.title);
  const nText = normalize(chunk.chunkText);
  const nKeywords = chunk.keywords.map(normalize);
  const nJobTitles = (chunk.jobTitles ?? []).map(normalize);
  const nArticle = normalize(chunk.article ?? "");

  let score = 0;
  const matched: string[] = [];

  for (const term of terms) {
    let hit = false;

    // Exact match in keywords (highest weight)
    if (nKeywords.some((k) => k.includes(term))) {
      score += 5;
      hit = true;
    }
    // Job title match
    if (nJobTitles.some((j) => j.includes(term))) {
      score += 4;
      hit = true;
    }
    // Title match
    if (nTitle.includes(term)) {
      score += 3;
      hit = true;
    }
    // Article reference
    if (nArticle.includes(term)) {
      score += 2;
      hit = true;
    }
    // Full text match
    if (nText.includes(term)) {
      score += 1;
      hit = true;
    }

    if (hit) matched.push(term);
  }

  // Bonus: chunk has salary data relevant to query
  if (chunk.salaryData && chunk.salaryData.length > 0 && matched.length > 0) {
    score += 2;
  }

  return { score, matched };
}

export function searchLegal(query: string, options: SearchOptions = {}): SearchResult[] {
  const { idcc, tags, limit = 10 } = options;
  const expandedTerms = expandQuery(query);

  const results: SearchResult[] = [];

  for (const chunk of LEGAL_CHUNKS) {
    // Filter by IDCC if specified
    if (idcc && chunk.idcc !== idcc && chunk.idcc !== "commun") continue;

    // Filter by tags if specified
    if (tags && tags.length > 0) {
      const hasTag = tags.some((t) => chunk.legalTags.includes(t));
      if (!hasTag) continue;
    }

    const { score, matched } = scoreChunk(chunk, expandedTerms);
    if (score > 0) {
      results.push({ chunk, score, matchedTerms: matched });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getChunksByIdcc(idcc: "2642" | "3097"): LegalDocumentChunk[] {
  return LEGAL_CHUNKS.filter((c) => c.idcc === idcc);
}

export function getChunksByTag(tag: LegalTag): LegalDocumentChunk[] {
  return LEGAL_CHUNKS.filter((c) => c.legalTags.includes(tag));
}

export function getSalaryChunks(idcc?: "2642" | "3097"): LegalDocumentChunk[] {
  return LEGAL_CHUNKS.filter(
    (c) => c.salaryData && c.salaryData.length > 0 && (!idcc || c.idcc === idcc)
  );
}
