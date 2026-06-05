import type { DepartmentSlug } from "@/lib/types";

export interface ShootSequence {
  id: string;
  time: string;
  label: string;
  location: string;
  cast?: string[];
  // Notes techniques / contraintes (cascades, drone, effets…)
  notes?: string;
  // Texte narratif du jour-à-jour : action de la scène, dialogues clés,
  // mise en scène. Extrait du document "jour_a_jour" uploadé par l'admin.
  script?: string;
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
  // Stored once after the first OCR pass so we can re-run targeted
  // extractions (e.g. /api/extract-script on the jour-à-jour) without
  // paying for OCR again.
  ocrText?: string;
}

// ── Project customization ────────────────────────────────────────────────────
// All toggles default to "show everything to everyone" — same behaviour as
// pre-permissions versions of the app. The admin opts INTO restrictions, they
// don't apply automatically.

// Pieces of information whose visibility can be restricted. Keep this list
// minimal — only sensitive fields. The "main" content (sequences, locations,
// weather, call times) is always visible.
export type RestrictableInfo =
  | "castContacts"     // Cast phone numbers + loge details
  | "deptCallTimes"    // Per-department call time table
  | "fraisDashboard"   // Aggregate frais view (financial)
  | "auditLog"         // Full audit log of changes
  | "wrapTime"         // Predicted end time (sensible info pour certains)
  ;

// Visibility level per info piece. "everyone" = current behaviour.
export type VisibilityLevel = "everyone" | "department" | "production";

export interface ProjectCustomization {
  // Master switch: when false, all the granular permissions below are
  // ignored and everyone sees everything (= app behaviour before this
  // feature was added). Default false → app stays identical until admin
  // explicitly opts in.
  restrictionsEnabled: boolean;
  // Per-info visibility — only consulted when restrictionsEnabled is true.
  permissions: Partial<Record<RestrictableInfo, VisibilityLevel>>;
  // Custom accent colour (CSS hex). Falls back to the cyan #00E0D0 when null.
  accentColor: string | null;
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
  // Project-level customization (permissions, accent colour). Optional with
  // sensible defaults so older saved states stay compatible.
  customization?: ProjectCustomization;
  // Journées archivées via "Fin de journée" dans l'admin. Préservé lors du
  // resetFull et du endDay : seules les journées explicitement archivées y
  // figurent. Triées du plus récent au plus ancien à l'affichage.
  archivedShoots?: ArchivedShoot[];
}

// Snapshot d'une feuille de service archivée à la fin d'une journée de
// tournage. On garde tous les champs informatifs (pas uploadedDocs pour ne
// pas alourdir le storage). L'admin peut ensuite consulter la journée
// archivée depuis /history.
export interface ArchivedShoot {
  id: string;                     // uuid de l'archive
  archivedAt: string;             // ISO timestamp de l'archivage
  archivedBy?: string;            // user id de l'admin qui a cliqué "Fin de journée"
  date: string;                   // date du jour archivé (champ du shoot)
  projectTitle: string;
  series?: string;
  shootingDay: number;
  totalDays?: number;
  location: string;
  callTime: string;
  mealTime: string;
  wrapTime?: string;
  patTime?: string;
  weather?: string;
  logeLocation?: string;
  canteenLocation?: string;
  deptCallTimes?: Partial<Record<DepartmentSlug, string>>;
  sequences: ShootSequence[];
  cast: CastMember[];
  deptNotes: DeptNote[];
  places: PlacePoint[];
  alerts: ShootAlert[];
  nextDays: NextDayInfo[];
  auditLog: AuditEntry[];
  // Snapshot du menu cantine du jour (si rempli)
  canteenMenu?: {
    starter: string;
    main: string;
    dessert: string;
    special?: string;
    mealTime?: string;
    mealEndTime?: string;
  };
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
