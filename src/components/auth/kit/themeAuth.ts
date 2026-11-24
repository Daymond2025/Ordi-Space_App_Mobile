// Thème des écrans de connexion/inscription de cette app (kit
// d'authentification : CadreAuth, MascotteVivante, DecorAuth…). Chaque app a
// le sien : couleurs, décor animé, accessoire de la mascotte et répliques.

export type ThemeAuth = {
  espace: string;
  slogan: string;
  degrade: string;
  halos: [string, string, string];
  accent: string;
  accentFin: string;
  accentHalo: string;
  accentOmbre: string;
  decor: "constellation" | "etincelles" | "colis" | "route" | "etiquettes" | "engrenages" | "bulles" | "radar";
  posture: "flotte" | "roule";
  accessoire: "aucun" | "engrenage" | "logo" | "radar" | "etoile" | "coeur" | "colis" | "casque";
  logo?: string;
  confettis: string[];
  badge: string;
  repliques: {
    salut: string;
    repos: string;
    telephone: string;
    telephoneOk: string;
    email: string;
    emailOk: string;
    mdp: string;
    erreur: string;
    code: string;
    succes: string;
    nom: string;
  };
};

export const THEME_AUTH: ThemeAuth = {
  "espace": "Client",
  "slogan": "Tes achats, tes garanties et ton SAV au même endroit.",
  "degrade": "linear-gradient(160deg,#0062e6 0%,#4fa6fe 55%,#ff8fc4 125%)",
  "halos": [
    "rgba(255,143,196,0.35)",
    "rgba(125,211,252,0.35)",
    "rgba(255,255,255,0.2)"
  ],
  "accent": "#1d63e0",
  "accentFin": "#4fa6fe",
  "accentHalo": "rgba(29,99,224,0.16)",
  "accentOmbre": "rgba(29,99,224,0.38)",
  "decor": "bulles",
  "posture": "flotte",
  "accessoire": "coeur",
  "confettis": [
    "#1d63e0",
    "#4fa6fe",
    "#ff8fc4",
    "#ffffff",
    "#fde047"
  ],
  "badge": "Connexion sécurisée · code WhatsApp",
  "repliques": {
    "telephone": "Ton numéro WhatsApp 📱",
    "telephoneOk": "Parfait, je t'envoie le code 🚀",
    "email": "Ton adresse e-mail 📧",
    "emailOk": "Cet e-mail me va ✅",
    "mdp": "Je ne regarde pas 🙈",
    "code": "Regarde WhatsApp 💬",
    "salut": "Bienvenue chez Ordi'Space 💙",
    "repos": "On se connecte ? 💙",
    "erreur": "Oups… on réessaie 😅",
    "succes": "Ravi de te voir ! 💙",
    "nom": "Comment tu t'appelles ? ✍️"
  }
};
