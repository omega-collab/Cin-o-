import type { LegalDocumentChunk } from "./legalTypes";
import { CHUNKS_2642 } from "./legalCorpus2642";
import { CHUNKS_3097 } from "./legalCorpus3097";

export type { LegalDocumentChunk };

export const LEGAL_CHUNKS: LegalDocumentChunk[] = [...CHUNKS_2642, ...CHUNKS_3097];
