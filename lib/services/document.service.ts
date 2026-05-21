export interface AnalysisResult {
  success: boolean;
  extractedData?: Record<string, unknown>;
  error?: string;
}

export async function analyzeDocument(
  _file: File
): Promise<AnalysisResult> {
  return {
    success: false,
    error: "Analyse automatique non disponible — cette fonctionnalité est en cours de déploiement.",
  };
}
