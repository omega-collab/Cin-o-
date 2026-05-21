export type ExpenseCategory =
  | "carburant"
  | "repas"
  | "hebergement"
  | "transport"
  | "peage_parking"
  | "materiel"
  | "communication"
  | "divers";

export type PaymentMethod = "cb" | "especes" | "virement" | "autre";
export type VatRate = 0 | 5.5 | 10 | 20;

export type FlagType =
  | "duplicate"
  | "missing_receipt"
  | "high_amount"
  | "round_number"
  | "future_date"
  | "vat_mismatch"
  | "daily_limit";

export interface ExpenseFlag {
  type: FlagType;
  message: string;
  severity: "info" | "warning" | "error";
}

export interface ExpenseEntry {
  id: string;
  date: string;           // YYYY-MM-DD
  category: ExpenseCategory;
  description: string;
  amountHT: number;
  vatRate: VatRate;
  amountTTC: number;      // calculé ou saisi
  paymentMethod: PaymentMethod;
  receiptUri?: string;    // base64 compressé
  notes?: string;
  flags: ExpenseFlag[];
  createdAt: string;
}

export interface ExpensePeriodTotals {
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  count: number;
  flagCount: number;
}
