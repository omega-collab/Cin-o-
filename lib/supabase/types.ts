export interface Profile {
  id: string;
  display_name: string;
  initials: string;
  created_at: string;
  department?: string | null;
  role?: string | null;
  avatar_id?: string | null;
}

export interface Project {
  id: string;
  name: string;
  invite_code: string;
  owner_id: string;
  created_at: string;
}

export interface ProjectMember {
  project_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  joined_at: string;
  profiles?: Profile;
}

export interface ProjectData {
  project_id: string;
  shoot_store: Record<string, unknown>;
  department_store: Record<string, unknown>;
  updated_at: string;
  updated_by: string | null;
}

export interface FraisEntry {
  id: string;
  user_id: string;
  project_id: string | null;
  date: string;           // ISO date YYYY-MM-DD
  fournisseur: string;
  nature: string;
  montant_ttc: number;
  plaque_immat: string | null;
  releve_numero: string | null;
  created_at: string;
  updated_at: string;
}

export type FraisEntryInsert = Omit<FraisEntry, "id" | "user_id" | "created_at" | "updated_at">;
