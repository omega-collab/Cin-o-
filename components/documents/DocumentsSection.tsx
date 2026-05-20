"use client";

import { useState, useCallback, useRef } from "react";
import { FileText, Upload } from "lucide-react";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatDateTime } from "@/lib/utils";
import { analyzeDocument } from "@/lib/services/document.service";
import type { DocumentEntry } from "@/lib/types";

const INITIAL_DOCS: DocumentEntry[] = [
  {
    id: "doc1",
    name: "Feuille_service_J14.pdf",
    type: "feuille_service",
    uploadedAt: new Date().toISOString(),
    analyzedAt: new Date().toISOString(),
    status: "analyzed",
    extractedData: { sequences: 5, location: "Paris 1er" },
  },
];

function docTypeBadge(type: DocumentEntry["type"]) {
  if (type === "feuille_service") {
    return <span className="text-xs font-semibold text-redSoft">PDF</span>;
  }
  if (type === "bon_commande" || type === "devis") {
    return <span className="text-xs font-semibold text-emerald-400">XLSX</span>;
  }
  return <span className="text-xs font-semibold text-muted">{type}</span>;
}

export function DocumentsSection() {
  const [documents, setDocuments] = useState<DocumentEntry[]>(INITIAL_DOCS);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const newDoc: DocumentEntry = {
        id: crypto.randomUUID(),
        name: file.name,
        type: "autre",
        uploadedAt: new Date().toISOString(),
        status: "pending",
      };

      setDocuments((prev) => [newDoc, ...prev]);
      setAnalyzing(newDoc.id);

      const result = await analyzeDocument(file);
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === newDoc.id
            ? {
                ...d,
                status: result.success ? "analyzed" : "error",
                analyzedAt: new Date().toISOString(),
                extractedData: result.extractedData,
              }
            : d
        )
      );
      setAnalyzing(null);
      e.target.value = "";
    },
    []
  );

  return (
    <div className="px-4 pt-6 pb-10 space-y-4">
      <h2 className="text-xl font-bold text-white mb-1">Documents</h2>

      {/* Document list */}
      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="glass-card rounded-app flex items-center gap-3 p-3"
          >
            <FileText size={20} className="text-cyan shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{doc.name}</p>
              <p className="text-xs text-muted mt-0.5">
                Importé {formatDateTime(doc.uploadedAt)}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {docTypeBadge(doc.type)}
              {analyzing === doc.id ? (
                <span className="text-xs text-muted animate-pulse">Analyse…</span>
              ) : (
                <StatusPill
                  status={
                    doc.status === "analyzed"
                      ? "analyzed"
                      : doc.status === "error"
                      ? "error"
                      : "pending"
                  }
                  label={
                    doc.status === "analyzed"
                      ? "Analysé"
                      : doc.status === "error"
                      ? "Erreur"
                      : "En attente"
                  }
                />
              )}
            </div>
          </div>
        ))}

        {documents.length === 0 && (
          <div className="glass-card rounded-app p-8 text-center">
            <p className="text-sm text-muted">Aucun document importé</p>
          </div>
        )}
      </div>

      {/* Upload button */}
      <label className="block cursor-pointer">
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
        />
        <div className="border border-dashed border-cyan rounded-app p-5 bg-cyanSoft/20 flex flex-col items-center gap-2 transition-opacity active:opacity-70">
          <Upload size={22} className="text-cyan" />
          <span className="text-sm font-semibold text-cyan">Importer un document</span>
        </div>
      </label>
    </div>
  );
}
