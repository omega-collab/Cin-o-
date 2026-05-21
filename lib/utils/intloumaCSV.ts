import type { MatriceData } from "@/lib/types/matrice";

function parse(s: string): number {
  return parseFloat(s.replace(",", ".")) || 0;
}

function fmt(n: number): string {
  return n.toFixed(2);
}

export function buildINTLOUMACSV(data: MatriceData): string {
  const nom = data.nom.trim().toUpperCase();
  const piece = `RDD# ${data.numero}`;
  const sep = ";";

  const actives = data.lignes.filter(
    (l) => parse(l.ttc) !== 0 || l.fournisseur.trim() || l.nature.trim()
  );

  const totalTTC = actives.reduce((s, l) => s + parse(l.ttc), 0);
  const totalTVA = actives.reduce((s, l) => s + parse(l.tva), 0);

  const rows: string[] = [
    [
      "N° de Compte",
      "Libellé écriture 35car",
      "Débit",
      "Crédit",
      "Poste",
      "Section",
      "N° de piece",
      "Récupérable",
    ].join(sep),
  ];

  // Ligne compte bénéficiaire
  const libBene = `RDD ${nom.slice(0, 20)}`.slice(0, 35);
  rows.push(
    [`540${nom.slice(0, 6)}`, libBene, "", fmt(totalTTC), "", "", piece, ""].join(sep)
  );

  // Ligne TVA (si > 0)
  if (totalTVA > 0.004) {
    rows.push(
      ["445660", libBene, fmt(totalTVA), "", "", "", piece, ""].join(sep)
    );
  }

  // Lignes dépenses
  for (const l of actives) {
    const ht = parse(l.ttc) - parse(l.tva);
    const lib = `RDD ${nom.slice(0, 7)}/${l.fournisseur}-${l.nature} ${data.departement}`.slice(0, 50);
    rows.push(
      [
        l.codeComptable,
        lib,
        ht > 0 ? fmt(ht) : "0.00",
        ht < 0 ? fmt(-ht) : "0.00",
        data.departement,
        "",
        piece,
        l.recuperable ? "OUI" : "NON",
      ].join(sep)
    );
  }

  return rows.join("\n");
}
