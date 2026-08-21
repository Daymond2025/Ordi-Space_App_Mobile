// Données statiques en attendant l'espace Admin/Maintenancier : les points de
// maintenance seront alimentés par de vrais maintenanciers inscrits plus
// tard. Pour l'instant, pages client uniquement, contenu du mockup en dur.

export type PointMaintenance = {
  id: number;
  nom: string;
  localisation: string;
  distanceKm: string;
  services: string[];
  couleurIcone: string;
};

export const POINTS_MAINTENANCE: PointMaintenance[] = [
  {
    id: 1,
    nom: "EDI MAINTENANCE",
    localisation: "Cocody, 2 plateau au carrefour d'ancient marché",
    distanceKm: "2,39",
    services: ["Reparation", "Instalation de logiciel", "Conseil"],
    couleurIcone: "#FBE1E9",
  },
  {
    id: 2,
    nom: "EDI MAINTENANCE",
    localisation: "Cocody, 2 plateau au carrefour d'ancient marché",
    distanceKm: "2,39",
    services: ["Reparation", "Instalation de logiciel", "Conseil"],
    couleurIcone: "#DCEEFB",
  },
  {
    id: 3,
    nom: "EDI MAINTENANCE",
    localisation: "Cocody, 2 plateau au carrefour d'ancient marché",
    distanceKm: "2,39",
    services: ["Reparation", "Instalation de logiciel", "Conseil"],
    couleurIcone: "#DFF5E9",
  },
];

export const STYLE_TAG_SERVICE: Record<string, string> = {
  Reparation: "bg-rose-100 text-rose-600",
  "Instalation de logiciel": "bg-sky-100 text-sky-600",
  Conseil: "bg-violet-100 text-violet-600",
};
