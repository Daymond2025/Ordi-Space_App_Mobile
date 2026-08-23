export type ImageProduit = {
  id: number;
  url_image: string;
  ordre_affichage: number;
};

export type Categorie = {
  id: number;
  nom_categorie: string;
  description: string | null;
};

export type Produit = {
  id: number;
  nom_produit: string;
  description: string | null;
  prix: string;
  quantite_stock: number;
  type_livraison: "physique" | "numerique";
  duree_garantie_mois: number | null;
  statut_produit: string;
  categorie: Categorie;
  images: ImageProduit[];
};

export type LignePanier = {
  id: number;
  panier_id: number;
  produit_id: number;
  quantite: number;
  produit: Produit;
};

export type Panier = {
  id: number;
  client_id: number;
  lignes: LignePanier[];
};

export type Adresse = {
  id: number;
  libelle: string | null;
  rue: string;
  ville: string;
  pays: string;
};

export type Pagination<T> = {
  data: T[];
  current_page: number;
  last_page: number;
};

export type TypeTutoriel = "tutoriel_rapide" | "formation";

export type Tutoriel = {
  id: number;
  titre: string;
  type: TypeTutoriel;
  url_video: string | null;
  id_video_youtube: string | null;
  contenu: string | null;
  image_couverture: string | null;
  date_publication: string | null;
};

export type StatutQuestion = "brouillon" | "publie";

export type QuestionFrequente = {
  id: number;
  question: string;
  reponse: string | null;
  fichier_audio: string | null;
  statut: StatutQuestion;
  ordre_affichage: number;
};

export function formaterPrix(prix: string | number): string {
  const nombre = typeof prix === "string" ? parseFloat(prix) : prix;
  return new Intl.NumberFormat("fr-FR").format(nombre);
}

export function formaterDateHeure(iso: string): string {
  const date = new Date(iso);
  const jour = new Intl.DateTimeFormat("fr-FR", { weekday: "long" }).format(date);
  const jourMois = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(date);
  const heure = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(date);
  return `Le ${jour} ${jourMois} à ${heure}`;
}

export type StatutCommande = "en_attente" | "validee" | "en_preparation" | "en_livraison" | "livree" | "annulee";

export type LigneCommande = {
  id: number;
  quantite: number;
  prix_unitaire: string;
  produit: Produit;
};

export type Livraison = {
  id: number;
  statut_livraison: string;
  date_prise_en_charge: string | null;
  date_livraison_prevue: string | null;
  date_livraison_effective: string | null;
};

export type Paiement = {
  id: number;
  statut_paiement: string;
  mode_paiement: string;
  montant: string;
  date_paiement: string | null;
};

export type Commande = {
  id: number;
  statut_commande: StatutCommande;
  montant_total: string;
  montant_remise: string;
  date_commande: string;
  date_validation: string | null;
  lignes: LigneCommande[];
  livraison: Livraison | null;
  paiement: Paiement | null;
};

export const LIBELLE_STATUT_COMMANDE: Record<StatutCommande, string> = {
  en_attente: "En attente",
  validee: "En cours",
  en_preparation: "En cours",
  en_livraison: "En cours",
  livree: "Terminée",
  annulee: "Annulée",
};

export const STYLE_STATUT_COMMANDE: Record<StatutCommande, string> = {
  en_attente: "bg-violet-100 text-violet-600",
  validee: "bg-sky-100 text-sky-600",
  en_preparation: "bg-sky-100 text-sky-600",
  en_livraison: "bg-sky-100 text-sky-600",
  livree: "bg-emerald-100 text-emerald-600",
  annulee: "bg-rose-100 text-rose-600",
};

export type GarantieInfo = {
  id: number;
  date_debut: string;
  date_fin: string;
  type_garantie: string;
};

export function garantieEstActive(garantie: GarantieInfo): boolean {
  return new Date(garantie.date_fin) >= new Date();
}

export function formaterDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso));
}

export type CommandeResume = {
  id: number;
  statut_commande: StatutCommande;
  montant_total: string;
  date_commande: string;
  paiement?: Paiement | null;
};

export type Achat = {
  id: number;
  quantite: number;
  produit: Produit;
  commande: CommandeResume;
  garantie: GarantieInfo;
};

export type PrestationGarantix = {
  id: number;
  libelle: string;
  ordre_affichage: number;
};

export type FormuleGarantix = {
  id: number;
  nom: string;
  libelle_complet: string;
  libelle_badge: string | null;
  prix_annuel: string;
  frequence_interventions: number;
  description: string | null;
  ordre_affichage: number;
  actif: boolean;
  prestations: PrestationGarantix[];
};

export type ExclusionGarantix = {
  id: number;
  libelle: string;
  ordre_affichage: number;
};

export type AbonnementGarantix = {
  id: number;
  statut: string;
  date_debut: string;
  date_fin: string;
  mode_paiement: string;
  formule: FormuleGarantix;
};

export type AchatDetail = {
  ligne: Achat & { abonnements_garantix: AbonnementGarantix[] };
  abonnement_garantix_actif: AbonnementGarantix | null;
  abonnement_garantix_en_attente: AbonnementGarantix | null;
  accessoires_compatibles: Produit[];
};

// --- Réclamations ---------------------------------------------------------

export type StatutReclamation = "nouvelle" | "en_cours" | "resolue" | "rejetee";

export const LIBELLE_STATUT_RECLAMATION: Record<StatutReclamation, string> = {
  nouvelle: "Nouvelle",
  en_cours: "En cours",
  resolue: "Résolue",
  rejetee: "Rejetée",
};

export const STYLE_STATUT_RECLAMATION: Record<StatutReclamation, string> = {
  nouvelle: "bg-rose-100 text-rose-600",
  en_cours: "bg-sky-100 text-sky-600",
  resolue: "bg-emerald-100 text-emerald-600",
  rejetee: "bg-brand-line text-brand-muted",
};

export type Reclamation = {
  id: number;
  sujet: string;
  description: string;
  statut: StatutReclamation;
  reponse_admin: string | null;
  date_reclamation: string;
  date_traitement: string | null;
  commande: CommandeResume | null;
};

// --- Notifications ---------------------------------------------------------

export type NotificationOrdispace = {
  id: number;
  type_notification: string;
  contenu: string;
  lu: boolean;
  date_envoi: string;
};

// --- Assistant IA "Ellah" ---------------------------------------------------

export type RoleMessageIa = "client" | "assistant";

export type MessageAssistantIa = {
  id: number;
  role: RoleMessageIa;
  contenu: string;
  date_envoi: string;
};

// --- Privilège Space ---------------------------------------------------------

export type TypePrivilege = "remise_pourcentage" | "remise_montant" | "livraison_gratuite" | "parrainage";

export type Privilege = {
  id: number;
  titre: string;
  sous_titre: string | null;
  description: string | null;
  type_privilege: TypePrivilege;
  valeur: string | null;
  code_promo: string | null;
  limite_utilisation_par_client: number | null;
  date_debut: string | null;
  date_fin: string | null;
  actif: boolean;
  ordre_affichage: number;
  couleur_debut: string | null;
  couleur_fin: string | null;
};

export type UtilisationPrivilege = {
  id: number;
  montant_remise: string;
  date_utilisation: string;
  privilege: Privilege;
};

// --- Portefeuille ------------------------------------------------------------

export type TypeTransactionPortefeuille = "credit" | "debit";

export type TransactionPortefeuille = {
  id: number;
  type: TypeTransactionPortefeuille;
  montant: string;
  motif: string;
  solde_apres: string;
  date_transaction: string;
};

export type Portefeuille = {
  solde: string;
  code_parrainage: string;
  transactions: Pagination<TransactionPortefeuille>;
};
