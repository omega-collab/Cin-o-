// Stub: replace with Supabase Storage in production

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadDocument(
  _file: File,
  _path: string
): Promise<UploadResult> {
  await new Promise((r) => setTimeout(r, 500));
  // TODO: upload to Supabase Storage
  return {
    success: true,
    url: "/placeholder-document-url",
  };
}
