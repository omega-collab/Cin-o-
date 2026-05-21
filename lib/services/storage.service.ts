import { supabase } from "@/lib/supabase/client";

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadDocument(file: File, path: string): Promise<UploadResult> {
  try {
    const { data, error } = await supabase.storage
      .from("documents")
      .upload(path, file, { upsert: true });

    if (error) return { success: false, error: error.message };

    const { data: publicData } = supabase.storage
      .from("documents")
      .getPublicUrl(data.path);

    return { success: true, url: publicData.publicUrl };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erreur d'upload",
    };
  }
}
