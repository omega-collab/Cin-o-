export type DepartmentSlug =
  | "camera"
  | "electro"
  | "machino"
  | "son"
  | "regie"
  | "deco"
  | "hmc"
  | "production"
  | "cantine";

export interface Department {
  slug: DepartmentSlug;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  code: string;
}

export interface StockItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: "ok" | "low" | "out";
  notes?: string;
}

export interface Movement {
  id: string;
  itemId: string;
  itemName: string;
  type: "in" | "out";
  quantity: number;
  operator: string;
  timestamp: string;
  notes?: string;
}

export interface HistoryEntry {
  id: string;
  department: DepartmentSlug;
  departmentName: string;
  action: string;
  details: string;
  timestamp: string;
  operator?: string;
}

export interface ScheduleSequence {
  id: string;
  time: string;
  location: string;
  description: string;
  cast: string[];
  crew: string[];
  notes?: string;
  period: "morning" | "afternoon" | "night";
}

export interface CanteenMenu {
  date: string;
  starter: string;
  main: string;
  dessert: string;
  special?: string;
  shootingLocation?: string;
  canteenLocation?: string;
}

export interface DocumentEntry {
  id: string;
  name: string;
  type: "feuille_service" | "bon_commande" | "devis" | "autre";
  uploadedAt: string;
  analyzedAt?: string;
  status: "pending" | "analyzed" | "error";
  extractedData?: Record<string, unknown>;
}

export interface AlertItem {
  id: string;
  severity: "info" | "warning" | "critical";
  message: string;
  department?: DepartmentSlug;
  timestamp: string;
}

export interface DailySequence {
  id: string;
  time: string;
  label: string;
  location: string;
}

export interface DailyShoot {
  date: string;
  projectTitle: string;
  shootingDay: number;
  location: string;
  callTime: string;
  mealTime: string;
  sequences: DailySequence[];
  isPublished: boolean;
}
