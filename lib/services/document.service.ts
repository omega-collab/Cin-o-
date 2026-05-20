// Stub: replace with real OCR (Mindee, Textract, Google Vision, or LLM vision) in production

export interface AnalysisResult {
  success: boolean;
  extractedData?: Record<string, unknown>;
  error?: string;
}

export async function analyzeDocument(
  _file: File
): Promise<AnalysisResult> {
  await new Promise((r) => setTimeout(r, 1500)); // simulate OCR latency
  // TODO: call OCR service
  return {
    success: true,
    extractedData: {
      type: "feuille_service",
      date: new Date().toISOString().split("T")[0],
      sequences: [],
      note: "Analyse automatique à implémenter",
    },
  };
}
