export interface ProductionDay {
  id: string;
  label: string;
  date: string;
  location: string;
  scenes: string[];
  startTime: string;
  endTime: string;
  period: "day" | "night";
  status: "confirmed" | "pending" | "cancelled";
}

export const PRODUCTION_DAYS: ProductionDay[] = [];
