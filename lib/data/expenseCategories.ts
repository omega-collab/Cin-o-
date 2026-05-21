import type { ExpenseCategory } from "@/lib/types/expense";

export interface CategoryDef {
  id: ExpenseCategory;
  label: string;
  emoji: string;
  color: string; // Tailwind text color
}

export const EXPENSE_CATEGORIES: CategoryDef[] = [
  { id: "carburant",      label: "Carburant",       emoji: "⛽", color: "text-orange-400" },
  { id: "repas",          label: "Repas",            emoji: "🍽️", color: "text-yellow-400" },
  { id: "hebergement",    label: "Hébergement",      emoji: "🏨", color: "text-blue-400"   },
  { id: "transport",      label: "Transport",        emoji: "🚗", color: "text-purple-400" },
  { id: "peage_parking",  label: "Péage / Parking",  emoji: "🅿️", color: "text-pink-400"   },
  { id: "materiel",       label: "Matériel",         emoji: "🔧", color: "text-cyan-400"   },
  { id: "communication",  label: "Communication",    emoji: "📱", color: "text-green-400"  },
  { id: "divers",         label: "Divers",           emoji: "📦", color: "text-muted"      },
];

export function getCategoryDef(id: ExpenseCategory): CategoryDef {
  return EXPENSE_CATEGORIES.find((c) => c.id === id) ?? EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1]!;
}

export const VAT_RATES = [
  { value: 20,  label: "TVA 20 %"  },
  { value: 10,  label: "TVA 10 %"  },
  { value: 5.5, label: "TVA 5,5 %" },
  { value: 0,   label: "Exonéré"   },
] as const;

export const PAYMENT_METHODS = [
  { value: "cb",       label: "Carte bancaire" },
  { value: "especes",  label: "Espèces"        },
  { value: "virement", label: "Virement"       },
  { value: "autre",    label: "Autre"          },
] as const;
