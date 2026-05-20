import type { DepartmentSlug } from "@/lib/types";

export const DEPT_ROLES: Record<DepartmentSlug, string[]> = {
  camera:     ["Chef opérateur", "1er AC", "2e AC", "3e AC"],
  electro:    ["Chef électricien", "Gaffer", "Électricien"],
  machino:    ["Chef machiniste", "Machiniste"],
  son:        ["Ingénieur du son", "Perchman", "Assistant son"],
  regie:      ["Régisseur général", "1er Ass. régie", "2e Ass. régie"],
  deco:       ["Chef décorateur", "Accessoiriste", "Régisseur plateau"],
  hmc:        ["Chef maquilleur", "Maquilleur", "Coiffeur"],
  production: ["Directeur de prod.", "Secrétaire de prod.", "Stagiaire"],
  cantine:    ["Cuisinier", "Aide-cuisinier"],
};
