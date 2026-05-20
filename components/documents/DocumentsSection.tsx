"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
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

export function DocumentsSection() {
  const [documents, setDocuments] = useState<DocumentEntry[]>(INITIAL_DOCS);
  const [analyzing, setAnalyzing] = useState<string | null>(null);

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Documents</h2>
        <label className="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-1 focus-within:ring-purple-500 bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 gap-2 cursor-pointer">
          <input
            type="file"
            className="sr-only"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
          />
          ＋ Importer
        </label>
      </div>

      <div className="grid gap-3">
        {documents.map((doc) => (
          <Card key={doc.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <span className="text-2xl shrink-0">
                  {doc.type === "feuille_service" ? "📋" : "📄"}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">
                    {doc.name}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Importé {formatDateTime(doc.uploadedAt)}
                  </p>
                  {doc.extractedData && (
                    <p className="text-slate-500 text-xs mt-1">
                      {Object.entries(doc.extractedData)
                        .filter(([k]) => k !== "note")
                        .map(([k, v]) => `${k}: ${String(v)}`)
                        .join(" · ")}
                    </p>
                  )}
                </div>
              </div>
              <div className="shrink-0">
                {analyzing === doc.id ? (
                  <span className="text-xs text-slate-400 animate-pulse">
                    Analyse…
                  </span>
                ) : (
                  <StatusPill
                    status={
                      doc.status === "analyzed"
                        ? "ok"
                        : doc.status === "error"
                        ? "critical"
                        : "info"
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
          </Card>
        ))}

        {documents.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-slate-400 text-sm">Aucun document importé</p>
          </Card>
        )}
      </div>
    </div>
  );
}
