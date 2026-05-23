import type { DepartmentSlug } from "@/lib/types";

export interface ShootSequence {
  id: string;
  time: string;
  label: string;
  location: string;
  cast?: string[];
  notes?: string;
}

export interface CastMember {
  id: string;
  name: string;
  role: string;
  callTime?: string;
  logeLocation?: string;
}

export interface DeptNote {
  id: string;
  department: string;
  content: string;
  priority: "info" | "warning" | "critical";
}

export interface PlacePoint {
  id: string;
  label: string;
  description: string;
  distance?: string;
}

export interface ShootAlert {
  id: string;
  severity: "info" | "warning" | "critical";
  message: string;
  department?: string;
}

export interface NextDayInfo {
  date: string;
  shootingDay: number;
  location?: string;
  callTime?: string;
  wrapTime?: string;
  mealTime?: string;
  effects?: string;    // ex: "JOUR", "NUIT", "JOUR/SOIR", "JOUR/CREP", "AUBE/JOUR"
  interior?: string;   // ex: "EXT", "INT", "INT/EXT", "EXT/INT"
  sequences?: string[]; // numéros de séquences: ["304", "305", "306"]
  sets?: string;       // description DÉCORS (lieu détaillé)
  summary?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  details?: string;
  source: "upload" | "manual" | "publish";
}

export interface UploadedDoc {
  id: string;
  filename: string;
  type: "feuille_service" | "jour_a_jour" | "implantation" | "autre";
  uploadedAt: string;
  size: number;
  base64?: string;
  mediaType?: string;
}

export interface FullShoot {
  date: string;
  projectTitle: string;
  series?: string;
  shootingDay: number;
  totalDays?: number;
  location: string;
  callTime: string;
  mealTime: string;
  wrapTime?: string;
  patTime?: string;
  deptCallTimes?: Partial<Record<DepartmentSlug, string>>;
  weather?: string;
  logeLocation?: string;
  canteenLocation?: string;
  sequences: ShootSequence[];
  cast: CastMember[];
  deptNotes: DeptNote[];
  places: PlacePoint[];
  alerts: ShootAlert[];
  nextDays: NextDayInfo[];
  auditLog: AuditEntry[];
  isPublished: boolean;
  uploadedDocs: UploadedDoc[];
  extractionStatus: "idle" | "extracting" | "review" | "done" | "error";
  extractionError?: string;
  codesEnabled: boolean;
  deptCodes: Partial<Record<DepartmentSlug, string>>;
}

export type ExtractionConfidence = "high" | "medium" | "low";

export interface ExtractedField<T> {
  value: T;
  confidence: ExtractionConfidence;
}

export interface ExtractionResult {
  projectTitle?: ExtractedField<string>;
  series?: ExtractedField<string>;
  shootingDay?: ExtractedField<number>;
  totalDays?: ExtractedField<number>;
  date?: ExtractedField<string>;
  location?: ExtractedField<string>;
  callTime?: ExtractedField<string>;
  patTime?: ExtractedField<string>;
  mealTime?: ExtractedField<string>;
  wrapTime?: ExtractedField<string>;
  weather?: ExtractedField<string>;
  logeLocation?: ExtractedField<string>;
  canteenLocation?: ExtractedField<string>;
  deptCallTimes?: ExtractedField<Partial<Record<string, string>>>;
  sequences?: ExtractedField<ShootSequence[]>;
  cast?: ExtractedField<CastMember[]>;
  deptNotes?: ExtractedField<DeptNote[]>;
  places?: ExtractedField<PlacePoint[]>;
  alerts?: ExtractedField<ShootAlert[]>;
  nextDays?: ExtractedField<NextDayInfo[]>;
}
