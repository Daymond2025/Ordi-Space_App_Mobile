import type { ComponentType, SVGProps } from "react";
import { ShieldCheckIcon, TagIcon, TicketIcon } from "@/components/icons";
import { formaterDate, formaterPrix, type Privilege, type TypePrivilege } from "@/lib/types";

const DEGRADES_PAR_TYPE: Record<TypePrivilege, string> = {
  remise_pourcentage: "linear-gradient(90deg, #0077FF 0%, #00BFFF 100%)",
  remise_montant: "linear-gradient(272.9deg, #FF00DD 0.03%, #71004F 98.57%)",
  livraison_gratuite: "linear-gradient(272.9deg, #A6FF00 0.03%, #007126 98.57%)",
  parrainage: "linear-gradient(272.9deg, #FF9D00 0.03%, #FF7800 98.57%)",
};

const ICONES_PAR_TYPE: Record<TypePrivilege, ComponentType<SVGProps<SVGSVGElement>>> = {
  remise_pourcentage: TagIcon,
  remise_montant: TicketIcon,
  livraison_gratuite: ShieldCheckIcon,
  parrainage: TagIcon,
};

const TAGS_PAR_TYPE: Record<TypePrivilege, string> = {
  remise_pourcentage: "Sur achat",
  remise_montant: "Sur achat d'ordinateur",
  livraison_gratuite: "Sur achat d'ordinateur",
  parrainage: "Sur achat d'ordinateur",
};

export function iconePrivilege(privilege: Privilege): ComponentType<SVGProps<SVGSVGElement>> {
  return ICONES_PAR_TYPE[privilege.type_privilege];
}

export function degradePrivilege(privilege: Privilege): string {
  if (privilege.couleur_debut && privilege.couleur_fin) {
    return `linear-gradient(272.9deg, ${privilege.couleur_debut} 0.03%, ${privilege.couleur_fin} 98.57%)`;
  }
  return DEGRADES_PAR_TYPE[privilege.type_privilege];
}

export function tagPrivilege(privilege: Privilege): string {
  return privilege.sous_titre ?? TAGS_PAR_TYPE[privilege.type_privilege];
}

export function valeurAffichee(privilege: Privilege): string {
  switch (privilege.type_privilege) {
    case "remise_pourcentage":
      return `-${privilege.valeur ? parseFloat(privilege.valeur) : 0}%`;
    case "remise_montant":
      return `- ${formaterPrix(privilege.valeur ?? 0)} FCFA`;
    case "livraison_gratuite":
      return "Livraison gratuite";
    case "parrainage":
      return `${formaterPrix(privilege.valeur ?? 0)} FCFA`;
    default:
      return "";
  }
}

export function commentCaMarche(privilege: Privilege): string {
  switch (privilege.type_privilege) {
    case "remise_pourcentage":
      return `Ce code vous donne ${privilege.valeur ? parseFloat(privilege.valeur) : 0}% de réduction. Saisissez-le au moment de valider votre commande : la réduction est calculée et déduite automatiquement.`;
    case "remise_montant":
      return `Ce code vous donne ${formaterPrix(privilege.valeur ?? 0)} FCFA de réduction immédiate. Saisissez-le au moment de valider votre commande : la réduction est déduite directement du montant total à payer.`;
    case "livraison_gratuite":
      return "Aucun code à saisir : cet avantage s'applique automatiquement dès que les conditions sont remplies, vous le retrouverez indiqué directement dans le détail de votre commande.";
    case "parrainage":
      return `Partagez votre code personnel avec vos proches. Lorsqu'un de vos filleuls achète un ordinateur en indiquant ce code au moment de sa commande, vous recevez ${formaterPrix(privilege.valeur ?? 0)} FCFA sur votre portefeuille OrdiSpace dès que sa commande est livrée.`;
    default:
      return privilege.description ?? "";
  }
}

export function conditionPrivilege(privilege: Privilege): string {
  const morceaux: string[] = [];

  if (privilege.limite_utilisation_par_client) {
    morceaux.push(
      `Utilisable ${privilege.limite_utilisation_par_client} fois maximum par client.`
    );
  } else {
    morceaux.push("Aucune limite d'utilisation par client.");
  }

  if (privilege.date_fin) {
    morceaux.push(`Valable jusqu'au ${formaterDate(privilege.date_fin)}.`);
  }

  if (privilege.type_privilege === "parrainage") {
    morceaux.push("Vous ne pouvez pas utiliser votre propre code.");
  }

  return morceaux.join(" ");
}
