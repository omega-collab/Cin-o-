"use client";

import { useState, useRef } from "react";
import { Camera, Upload, X, Check } from "lucide-react";
import { useExpenseStore } from "@/lib/store/useExpenseStore";
import { EXPENSE_CATEGORIES, VAT_RATES, PAYMENT_METHODS } from "@/lib/data/expenseCategories";
import type { ExpenseCategory, PaymentMethod, VatRate } from "@/lib/types/expense";

const INPUT = "w-full bg-white/5 border border-stroke rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan/40 placeholder:text-muted";

async function compressImage(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 900;
      const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.src = dataUrl;
  });
}

interface Props { onClose: () => void }

export function ExpenseForm({ onClose }: Props) {
  const addEntry = useExpenseStore((s) => s.addEntry);
  const today = new Date().toISOString().split("T")[0]!;

  const [date, setDate] = useState(today);
  const [category, setCategory] = useState<ExpenseCategory>("divers");
  const [description, setDescription] = useState("");
  const [amountHT, setAmountHT] = useState("");
  const [vatRate, setVatRate] = useState<VatRate>(20);
  const [amountTTC, setAmountTTC] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cb");
  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const htNum = parseFloat(amountHT.replace(",", ".")) || 0;
  const ttcNum = parseFloat(amountTTC.replace(",", ".")) || 0;

  // Calcul automatique TTC depuis HT quand on quitte le champ HT
  function onHTBlur() {
    if (htNum > 0) {
      const computed = Math.round(htNum * (1 + vatRate / 100) * 100) / 100;
      setAmountTTC(String(computed));
    }
  }

  function onVatChange(v: VatRate) {
    setVatRate(v);
    if (htNum > 0) {
      const computed = Math.round(htNum * (1 + v / 100) * 100) / 100;
      setAmountTTC(String(computed));
    }
  }

  async function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const compressed = await compressImage(e.target!.result as string);
      setReceiptUri(compressed);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit() {
    if (!description || !amountTTC) return;
    setSaving(true);
    addEntry({
      date,
      category,
      description,
      amountHT: htNum,
      vatRate,
      amountTTC: ttcNum || htNum * (1 + vatRate / 100),
      paymentMethod,
      receiptUri: receiptUri ?? undefined,
      notes: notes || undefined,
    });
    setSaving(false);
    onClose();
  }

  const canSubmit = description.trim().length > 0 && (amountTTC || amountHT);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Nouvelle dépense</h3>
        <button onClick={onClose} className="text-muted hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Date */}
      <div>
        <label className="text-xs text-muted block mb-1">Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={INPUT} />
      </div>

      {/* Catégorie */}
      <div>
        <label className="text-xs text-muted block mb-2">Catégorie</label>
        <div className="grid grid-cols-4 gap-1.5">
          {EXPENSE_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`flex flex-col items-center gap-1 py-2 rounded-xl text-[10px] font-medium transition-all ${
                category === c.id ? "active-pill" : "glass-card text-muted"
              }`}
            >
              <span className="text-base leading-none">{c.emoji}</span>
              <span className="truncate w-full text-center px-0.5">{c.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs text-muted block mb-1">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex : Plein d'essence — station Total A8"
          className={INPUT}
        />
      </div>

      {/* Montants */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted block mb-1">Montant HT (€)</label>
          <input
            type="text"
            inputMode="decimal"
            value={amountHT}
            onChange={(e) => setAmountHT(e.target.value)}
            onBlur={onHTBlur}
            placeholder="0,00"
            className={INPUT}
          />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Montant TTC (€)</label>
          <input
            type="text"
            inputMode="decimal"
            value={amountTTC}
            onChange={(e) => setAmountTTC(e.target.value)}
            placeholder="0,00"
            className={INPUT}
          />
        </div>
      </div>

      {/* TVA */}
      <div>
        <label className="text-xs text-muted block mb-1">Taux de TVA</label>
        <div className="flex gap-1.5">
          {VAT_RATES.map((v) => (
            <button
              key={v.value}
              onClick={() => onVatChange(v.value as VatRate)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-all ${
                vatRate === v.value ? "active-pill" : "glass-card text-muted"
              }`}
            >
              {v.label.replace("TVA ", "")}
            </button>
          ))}
        </div>
      </div>

      {/* Mode de paiement */}
      <div>
        <label className="text-xs text-muted block mb-1">Règlement</label>
        <div className="flex gap-1.5">
          {PAYMENT_METHODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPaymentMethod(p.value as PaymentMethod)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-all ${
                paymentMethod === p.value ? "active-pill" : "glass-card text-muted"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Justificatif */}
      <div>
        <label className="text-xs text-muted block mb-1.5">Justificatif</label>
        {receiptUri ? (
          <div className="relative">
            <img src={receiptUri} alt="Justificatif" className="w-full max-h-40 object-cover rounded-xl" />
            <button
              onClick={() => setReceiptUri(null)}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => { fileRef.current!.accept = "image/*"; fileRef.current!.capture = "environment"; fileRef.current!.click(); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 glass-card rounded-xl text-xs text-muted"
            >
              <Camera className="w-4 h-4" /> Photographier
            </button>
            <button
              onClick={() => { fileRef.current!.accept = "image/*,application/pdf"; fileRef.current!.removeAttribute("capture"); fileRef.current!.click(); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 glass-card rounded-xl text-xs text-muted"
            >
              <Upload className="w-4 h-4" /> Importer
            </button>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs text-muted block mb-1">Notes (optionnel)</label>
        <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Contexte, référence…" className={INPUT} />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || saving}
        className="active-pill w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-30"
      >
        <Check className="w-4 h-4" /> Enregistrer la dépense
      </button>
    </div>
  );
}
