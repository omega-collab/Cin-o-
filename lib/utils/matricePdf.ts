import type { FraisEntry } from "@/lib/supabase/types";
import type { MatriceData } from "@/lib/types/matrice";
import { escHtml } from "@/lib/utils";
import { PRODUCTION } from "@/lib/data/production";

export function printReleve(
  entries: FraisEntry[],
  data: MatriceData,
  totalTTC: number,
  effectiveDept: string,
  effectiveEmploi: string
) {
  const win = window.open("", "_blank");
  if (!win) return;

  const rows = entries
    .filter((e) => (e.montant_ttc ?? 0) > 0 || e.fournisseur)
    .map((e, i) => `<tr>
      <td>${i + 1}</td>
      <td>${escHtml(e.date ?? "")}</td>
      <td>${escHtml(e.fournisseur ?? "")}</td>
      <td>${escHtml(e.nature ?? "")}</td>
      <td style="text-align:right">${(e.montant_ttc ?? 0).toFixed(2)}</td>
      <td>${escHtml(e.plaque_immat ?? "—")}</td>
    </tr>`)
    .join("");

  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
  <title>Note de frais — ${escHtml(data.nom ?? "")}</title>
  <style>
    body{font-family:Arial,sans-serif;font-size:10px;padding:16px;color:#111}
    h2{font-size:13px;margin:4px 0}
    .meta{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:10px 0;font-size:10px}
    table{width:100%;border-collapse:collapse;margin-bottom:10px}
    th,td{padding:4px 6px;border:1px solid #bbb;vertical-align:top}
    th{background:#eee;font-weight:bold}
    tfoot td{font-weight:bold;background:#f5f5f5}
    .company{font-size:10px;font-weight:bold;margin-bottom:2px}
    .sign{margin-top:16px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;font-size:10px}
    .sign div{border-top:1px solid #999;padding-top:4px}
    .note{color:#c00;font-size:9px;margin-top:12px;font-style:italic}
    @media print{@page{margin:12mm}}
  </style></head><body>
  <div class="company">${escHtml(PRODUCTION.company)} — ${escHtml(PRODUCTION.address)} — SIRET ${escHtml(PRODUCTION.siret)}</div>
  <h2>NOTE DE FRAIS — ${escHtml(PRODUCTION.title)}</h2>
  <div class="meta">
    <div>N° : <strong>${escHtml(data.numero ?? "")}</strong> &nbsp; Date : <strong>${escHtml(data.dateReleve ?? "")}</strong></div>
    <div>Région : <strong>${escHtml(data.regionGlobale ?? "")}</strong></div>
    <div>NOM &amp; PRÉNOM : <strong>${escHtml(data.nom ?? "")}</strong></div>
    <div>Département : <strong>${escHtml(effectiveDept)}</strong> &nbsp; Emploi : <strong>${escHtml(effectiveEmploi)}</strong></div>
  </div>
  <table>
    <thead><tr><th>N°</th><th>Date</th><th>Fournisseur</th><th>Nature dépense</th><th>TTC (€)</th><th>Plaque</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr>
      <td colspan="4" style="text-align:right"><strong>TOTAL TTC EN EUROS</strong></td>
      <td style="text-align:right"><strong>${totalTTC.toFixed(2)} €</strong></td>
      <td></td>
    </tr></tfoot>
  </table>
  <p style="font-size:9px;font-style:italic">Je certifie que les dépenses ci-dessus représentent des fonds déboursés uniquement pour les affaires de la société et que les justificatifs sont joints.</p>
  <div class="sign">
    <div>Bénéficiaire<br><br>${escHtml(data.nom ?? "")}</div>
    <div>Visa chef département<br><br>&nbsp;</div>
    <div>Direction de production<br><br>&nbsp;</div>
  </div>
  <p class="note">Envoyer par email à Administration : ${escHtml(PRODUCTION.adminEmail)} avec les justificatifs numérotés. Remboursement par virement après validation.</p>
  </body></html>`);
  win.document.close();
  win.print();
}
