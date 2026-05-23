import { Mistral } from "@mistralai/mistralai";
import { NextRequest, NextResponse } from "next/server";
import type { ExtractionResult } from "@/lib/types/shoot";

export const runtime = "edge";
export const maxDuration = 30;

const EXTRACTION_PROMPT = `Tu es un assistant expert en production cinématographique et audiovisuelle française. Tu analyses un ou plusieurs documents de production pour en extraire toutes les informations utiles au tournage du jour.

TYPES DE DOCUMENTS QUE TU PEUX RECEVOIR :
1. FEUILLE DE SERVICE (FDS) — document quotidien : titre, jour J, date, horaires, convocations par département, déroulé des séquences, casting, logistique, notes par département, jours suivants.
2. CONTINUITÉ DIALOGUÉE (CDV) — découpage technique : descriptions de scènes, dialogues, actions, décors INT/EXT, personnages présents par scène.
3. PLAN DE TRAVAIL / DÉPOUILLEMENT — planning multi-jours : lieux, horaires prévisionnels, heures sup prévues.
4. IMPLANTATION — plan de masse : positions véhicules (VL/PL), cantine, loges HMC, groupe électro, distances, accès.
5. JOUR-À-JOUR — détail narratif séquence par séquence pour le jour J.

RÈGLES DE FUSION :
- La FDS est la source principale pour les horaires et informations générales.
- Fusionne les séquences sur leur numéro commun (ex : "SC 815" dans la FDS + détail dans le CDV → une entrée enrichie).
- L'implantation enrichit le champ "places" (distances, adresses, contraintes).
- En cas de conflit entre documents, retiens la valeur la plus précise.
- Une séquence = une seule entrée. Pas de doublons.

═══════════════════════════════════════════
CHAMPS À EXTRAIRE (EXPLICATIONS DÉTAILLÉES)
═══════════════════════════════════════════

▌INFORMATIONS GÉNÉRALES
• projectTitle : titre du film ou de la série (ex: "TROPIQUES CRIMINELS")
• series : saison + épisode si série (ex: "Saison 8 — Épisode 4")
• shootingDay : numéro du jour de tournage (ex: "J34" → 34)
• totalDays : total jours de tournage prévu (ex: "J34/38" → 38)
• date : date du tournage au format YYYY-MM-DD
• location : lieu principal du décor du jour (adresse ou nom du lieu)
• weather : météo prévue, incluant température, UV, précipitations, vent si disponibles

▌HORAIRES GÉNÉRAUX (CRITIQUE)
• callTime : heure de convocation GÉNÉRALE, c'est-à-dire l'heure la plus tardive parmi toutes les convocations (heure à laquelle tout le monde doit être là). Sur une FDS française c'est souvent l'heure de début de tournage pour les équipes techniques principales.
• patTime : heure du PREMIER TOUR DE MANIVELLE ou PAT (Prêt À Tourner). Cherche les libellés : "PAT", "1er tour de manivelle", "Premier tour de manivelle", "Début de prise de vue". C'est l'heure à laquelle la caméra commence à tourner.
• mealTime : heure du repas / déjeuner / dîner. Cherche : "Repas", "Déjeuner", "Dîner", "Coupure repas".
• wrapTime : heure de fin prévue. Cherche : "Fin", "Wrap", "Fin de journée", parfois exprimée comme heure de départ équipe.

▌CONVOCATIONS PAR DÉPARTEMENT (TRÈS IMPORTANT)
Sur une FDS, chaque département a sa propre heure de convocation (souvent listées dans un tableau). Extrais-les dans "deptCallTimes" en utilisant EXACTEMENT ces clés :
• "camera"    → Caméra, Image, Chef opérateur, Cadreur, Focus, Vidéo-assist, Steadicam
• "electro"   → Électricité, Électro, Gaffer, Electriciens, Groupe électrogène
• "machino"   → Machinerie, Grip, Machinistes, Chef machiniste
• "son"       → Son, Prise de son, Perchman, Ingénieur du son
• "regie"     → Régie, Régisseur, Production, 1er AD, 2e AD, Assistants mise en scène, Scripte
• "deco"      → Décoration, Déco, Direction artistique, Accessoiristes, Ensembliers, Chef déco
• "hmc"       → HMC, Habillage, Maquillage, Coiffure, Costumiers, Perruques
• "cantine"   → Cantine, Catering, Restauration, Traiteur, Café-croissants
• "direction" → Réalisateur, Réalisation, Metteur en scène

Si un département n'est pas mentionné, omets sa clé. La convocation la plus basse (la plus tôt) est souvent HMC/Maquillage.

▌LOGISTIQUE
• logeLocation : adresse complète ou description du lieu loges/HMC (ex: "Bus HMC — 50m du décor côté parking")
• canteenLocation : emplacement de la cantine (adresse, distance, ou description)

▌SÉQUENCES
Pour chaque séquence/scène de la journée :
• id : identifiant court unique (s1, s2…)
• time : heure de début de prise (HH:MM)
• label : numéro + titre de scène (ex: "Séq. 815 — L'oncle de Théo parle")
• location : type + décor + moment (ex: "INT. CABANE PÊCHEUR — JOUR")
• cast : liste des personnages ou comédiens présents dans cette scène (noms exacts)
• notes : infos spéciales pour cette séquence (cascades, effets spéciaux, drone, pyrotechnie, confidentialité, etc.)

▌CASTING GLOBAL
• cast[] : comédiens convoqués dans la journée, avec :
  - name : nom de l'acteur/actrice
  - role : nom du personnage joué
  - callTime : heure de convocation individuelle (peut différer de la convocation générale)
  - logeLocation : loge ou HMC attribué(e)

▌NOTES PAR DÉPARTEMENT (deptNotes)
Extrais TOUTES les instructions spécifiques à un département :
- Besoins en matériel spécial (grue, Technocrane, drone, steadicam, underwater…)
- Autorisations requises (drone DGAC, feu réel, armes…)
- Contraintes particulières (bruit, animaux, enfants mineurs, cascades)
- Informations de repérage (code d'accès, contact gardien…)
- Instructions de sécurité spécifiques au département
- Contacts utiles (chef de poste sécurité, médecin plateau…)
• priority "critical" : danger immédiat, obligation légale (pyrotechnie, cascades, mineurs, armes réelles)
• priority "warning" : attention requise, risque modéré (météo défavorable, accès difficile, horaire serré)
• priority "info" : information utile (rappel logistique, contact, matériel)

▌LIEUX LOGISTIQUES (places)
Extrais tous les points logistiques du lieu de tournage :
- Parking VL (véhicules légers de l'équipe)
- Parking PL (camions, semi-remorques)
- Cantine / restauration (si différent de canteenLocation)
- Loges HMC (bus/caravane, si différent de logeLocation)
- Groupe électrogène (position, accès)
- Accès décor (entrée principale, code, contact gardien)
- Toilettes / sanitaires
- Point de rendez-vous équipe

▌ALERTES (alerts)
Éléments nécessitant attention particulière :
- Autorisations de tournage (espaces publics, bâtiments classés)
- Météo critique (orage prévu, chaleur extrême, vent fort)
- Présence d'animaux, d'enfants, de cascades
- Drones (autorisation DGAC, zone NOTAM)
- Armes, pyrotechnie, feu réel
- Restrictions sonores (voisinage, horaires)
- Risques sécurité (hauteur, eau, circulation)
• severity "critical" : arrêt du tournage possible, risque physique
• severity "warning" : précaution obligatoire
• severity "info" : information à noter

▌JOURS SUIVANTS (nextDays)
J+1, J+2, J+3 mentionnés dans la FDS avec date, lieu, callTime et résumé si disponibles.

═══════════════════════════════
SCHÉMA JSON DE RÉPONSE COMPLET
═══════════════════════════════

Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ni après.
Pour chaque champ extrait, indique la confiance : "high" = trouvé explicitement, "medium" = déduit par croisement, "low" = incertain.
Omets les champs introuvables plutôt que de les inventer.

{
  "projectTitle": { "value": "string", "confidence": "high|medium|low" },
  "series": { "value": "string", "confidence": "high|medium|low" },
  "shootingDay": { "value": number, "confidence": "high|medium|low" },
  "totalDays": { "value": number, "confidence": "high|medium|low" },
  "date": { "value": "YYYY-MM-DD", "confidence": "high|medium|low" },
  "location": { "value": "string — adresse ou nom du lieu principal", "confidence": "high|medium|low" },
  "callTime": { "value": "HH:MM", "confidence": "high|medium|low" },
  "patTime": { "value": "HH:MM — heure PAT / 1er tour de manivelle", "confidence": "high|medium|low" },
  "mealTime": { "value": "HH:MM", "confidence": "high|medium|low" },
  "wrapTime": { "value": "HH:MM", "confidence": "high|medium|low" },
  "weather": { "value": "string — météo détaillée (temp, UV, vent, pluie)", "confidence": "high|medium|low" },
  "logeLocation": { "value": "string — emplacement loges/HMC", "confidence": "high|medium|low" },
  "canteenLocation": { "value": "string — emplacement cantine", "confidence": "high|medium|low" },
  "deptCallTimes": {
    "value": {
      "camera": "HH:MM",
      "electro": "HH:MM",
      "machino": "HH:MM",
      "son": "HH:MM",
      "regie": "HH:MM",
      "deco": "HH:MM",
      "hmc": "HH:MM",
      "cantine": "HH:MM",
      "direction": "HH:MM"
    },
    "confidence": "high|medium|low"
  },
  "sequences": {
    "value": [
      {
        "id": "s1",
        "time": "HH:MM",
        "label": "string — ex: Séq. 815 – L'oncle de Théo parle",
        "location": "string — INT./EXT. DÉCOR – MOMENT DE LA JOURNÉE",
        "cast": ["string — nom du personnage ou comédien"],
        "notes": "string — spécificités techniques, effets, contraintes (optionnel)"
      }
    ],
    "confidence": "high|medium|low"
  },
  "cast": {
    "value": [
      {
        "id": "c1",
        "name": "string — nom complet du comédien",
        "role": "string — nom du personnage",
        "callTime": "HH:MM",
        "logeLocation": "string — loge ou bus HMC attribué (optionnel)"
      }
    ],
    "confidence": "high|medium|low"
  },
  "deptNotes": {
    "value": [
      {
        "id": "d1",
        "department": "string — nom du département concerné (ex: Caméra, Électro, Son, Régie, HMC, Décoration, Production, Tous)",
        "content": "string — instruction complète et précise",
        "priority": "info|warning|critical"
      }
    ],
    "confidence": "high|medium|low"
  },
  "places": {
    "value": [
      {
        "id": "p1",
        "label": "string — ex: Parking VL, Cantine, Bus HMC, Groupe électro, Accès décor",
        "description": "string — adresse, repère ou description précise",
        "distance": "string — distance ou temps depuis le décor (optionnel)"
      }
    ],
    "confidence": "high|medium|low"
  },
  "alerts": {
    "value": [
      {
        "id": "a1",
        "severity": "info|warning|critical",
        "message": "string — message clair et actionnable",
        "department": "string — département concerné, ou omis si global (optionnel)"
      }
    ],
    "confidence": "high|medium|low"
  },
  "nextDays": {
    "value": [
      {
        "date": "YYYY-MM-DD",
        "shootingDay": number,
        "location": "string — lieu principal du jour suivant",
        "callTime": "HH:MM",
        "summary": "string — résumé des séquences ou notes importantes (optionnel)"
      }
    ],
    "confidence": "high|medium|low"
  }
}

RÈGLES DE FORMAT STRICTES :
- IDs courts et séquentiels : s1/s2… c1/c2… d1/d2… p1/p2… a1/a2…
- Toutes les heures en HH:MM sur 24h (ex: "8h30" → "08:30", "8H00" → "08:00", "20h30" → "20:30")
- Toutes les dates en YYYY-MM-DD
- Ne génère pas de données inventées — si une info est absente, omets le champ
- Pour deptCallTimes : n'inclus que les départements avec une heure explicitement mentionnée
- Sois exhaustif sur les deptNotes : chaque instruction de département sur la FDS mérite une entrée distincte`;

interface TextInput {
  text: string;
  filename: string;
  type: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { texts: TextInput[] };
    const { texts } = body;

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: "Aucun texte fourni" }, { status: 400 });
    }
    if (texts.length > 5) {
      return NextResponse.json({ error: "Maximum 5 documents par extraction" }, { status: 400 });
    }

    if (!process.env.MISTRAL_API_KEY) {
      return NextResponse.json(
        { error: "Clé API manquante — configurez MISTRAL_API_KEY dans les variables d'environnement Netlify" },
        { status: 500 }
      );
    }

    const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

    const combinedText = texts
      .map((t) => `=== ${t.filename} (${t.type}) ===\n${t.text}`)
      .join("\n\n");

    const chatResponse = await client.chat.complete({
      model: "mistral-small-latest",
      messages: [
        {
          role: "user",
          content: `${combinedText}\n\n${EXTRACTION_PROMPT}`,
        },
      ],
      responseFormat: { type: "json_object" },
      maxTokens: 8192,
      temperature: 0,
    });

    const raw = (chatResponse.choices?.[0]?.message?.content ?? "").toString().trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch?.[0]) {
      return NextResponse.json({ error: "Impossible d'extraire le JSON de la réponse IA" }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]) as ExtractionResult;
    return NextResponse.json({ result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[extract] error:", msg);
    const safe = msg.length < 120 && !/https?:|at \w/.test(msg) ? msg : "Erreur serveur — réessayez dans quelques instants.";
    return NextResponse.json({ error: safe }, { status: 500 });
  }
}
