"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ComponentType, SVGProps } from "react";
import { apiFetch } from "@/lib/api";
import { formaterPrix, LIBELLE_ETAT_PRODUIT, type Produit } from "@/lib/types";
import {
  CarteGraphiqueIcon,
  ChevronLeftIcon,
  DisqueIcon,
  EcranIcon,
  EngrenageIcon,
  FenetresIcon,
  ImageIcon,
  MemoireIcon,
  PanierIcon,
  ProcesseurIcon,
  ShareIcon,
  ShieldCheckIcon,
} from "@/components/icons";
import { VisionneuseImages } from "@/components/VisionneuseImages";
import { useAuth } from "@/context/AuthContext";
import { usePanier } from "@/context/PanierContext";

const ONGLETS = [
  { id: "cadeaux", label: "Les cadeaux" },
  { id: "description", label: "Description" },
  { id: "pack", label: "Pack complet" },
] as const;

type IconeSpec = ComponentType<SVGProps<SVGSVGElement>>;
const OMBRE_CARTE = "0px 1px 2px 0px rgba(0, 0, 0, 0.05)";
const DEGRADE_ORANGE = "linear-gradient(273.52deg, #FFCC00 -3.09%, #FF7800 98.47%)";

export function ProduitDetail({ id }: { id: string }) {
  const router = useRouter();
  const { token } = useAuth();
  const { ajouter, nombreArticles } = usePanier();
  const [produit, setProduit] = useState<Produit | null | undefined>(undefined);
  const [imageActive, setImageActive] = useState(0);
  const [ongletActif, setOngletActif] = useState<(typeof ONGLETS)[number]["id"]>("cadeaux");
  const [visionneuseOuverte, setVisionneuseOuverte] = useState(false);
  const [ajoutEnCours, setAjoutEnCours] = useState(false);
  const [ajoute, setAjoute] = useState(false);

  useEffect(() => {
    apiFetch<Produit>(`/produits/${id}`)
      .then(setProduit)
      .catch(() => setProduit(null));
  }, [id]);

  if (produit === undefined) {
    return <p className="px-4 py-6 text-sm text-brand-muted">Chargement…</p>;
  }

  if (produit === null) {
    return (
      <main className="min-h-full">
        <div className="flex items-center gap-3 px-4 pt-4">
          <Link href="/market-space" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-line">
            <ChevronLeftIcon className="h-5 w-5" />
          </Link>
        </div>
        <p className="px-4 pt-6 text-sm text-brand-muted">Ce produit n&apos;est plus disponible.</p>
      </main>
    );
  }

  const enStock = produit.quantite_stock > 0;
  const stockFaible = enStock && produit.quantite_stock <= 5;
  const prixActuel = produit.prix_vente ?? produit.prix;
  const prixBarre = produit.prix_barre && Number(produit.prix_barre) > Number(prixActuel) ? produit.prix_barre : null;

  const specsResume = [produit.processeur, produit.memoire_ram, produit.stockage].filter((v): v is string => Boolean(v));
  const specsDetail = (
    [
      { label: "Processeur", valeur: produit.processeur, Icone: ProcesseurIcon },
      { label: "Disque dur", valeur: produit.stockage, Icone: DisqueIcon },
      { label: "Ram", valeur: produit.memoire_ram, Icone: MemoireIcon },
      { label: "Carte graphique", valeur: produit.carte_graphique, Icone: CarteGraphiqueIcon },
      { label: "Taille d'écran", valeur: produit.taille, Icone: EcranIcon },
      { label: "Système installé", valeur: produit.systeme_exploitation, Icone: FenetresIcon },
    ] as { label: string; valeur: string | null; Icone: IconeSpec }[]
  ).filter((s): s is { label: string; valeur: string; Icone: IconeSpec } => Boolean(s.valeur));

  const contenuOnglet: Record<(typeof ONGLETS)[number]["id"], string> = {
    description: produit.description ?? "Aucune description fournie pour ce produit.",
    cadeaux: produit.cadeaux && produit.cadeaux.length > 0 ? produit.cadeaux.join(", ") : "Aucun cadeau inclus avec ce produit.",
    pack: produit.contenu_pack ?? "Aucun pack complet pour ce produit.",
  };

  const fraisLivraisonMin =
    produit.frais_livraison.length > 0 ? Math.min(...produit.frais_livraison.map((f) => Number(f.montant))) : null;

  async function onAjouterAuPanier() {
    if (!produit) return;
    if (!token) {
      router.push(`/connexion?next=${encodeURIComponent(`/produit/${id}`)}`);
      return;
    }
    setAjoutEnCours(true);
    try {
      await ajouter(produit.id, 1);
      setAjoute(true);
      setTimeout(() => setAjoute(false), 2000);
    } finally {
      setAjoutEnCours(false);
    }
  }

  async function onPartager() {
    if (!produit) return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: produit.nom_produit, url });
      } catch {
        // Partage annulé par l'utilisateur — rien à faire.
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    }
  }

  return (
    <main className="min-h-full bg-[#f2f5fa] pb-40">
      <div className="flex shrink-0 items-center gap-2 bg-white px-4 py-3">
        <Link href="/market-space" aria-label="Retour" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F2F5FA] text-brand-ink">
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <p className="flex-1 text-center text-base font-extrabold text-brand-ink">Détails</p>
        <button
          type="button"
          onClick={onPartager}
          aria-label="Partager"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
          style={{ background: DEGRADE_ORANGE }}
        >
          <ShareIcon className="h-4.5 w-4.5" />
        </button>
        <Link
          href="/panier"
          aria-label="Voir le panier"
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
          style={{ background: DEGRADE_ORANGE }}
        >
          <PanierIcon className="h-4.5 w-4.5" />
          {nombreArticles > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-semibold text-white">
              {nombreArticles}
            </span>
          ) : null}
        </Link>
      </div>

      <div className="mx-3 mt-3 shrink-0 overflow-hidden rounded-2xl border border-brand-line bg-white">
        <div className="relative h-[320px] w-full">
          {produit.images[imageActive] ? (
            <button
              type="button"
              onClick={() => setVisionneuseOuverte(true)}
              aria-label="Voir la photo en grand"
              className="block h-full w-full cursor-zoom-in"
            >
              <Image src={produit.images[imageActive].url_image} alt="" fill className="object-cover" sizes="100vw" priority />
            </button>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-brand-muted">
              <ImageIcon className="h-10 w-10" />
            </div>
          )}
          {produit.etat_produit ? (
            <span
              className="absolute left-[13px] top-[15px] flex h-[22px] items-center rounded-lg px-2 text-xs font-bold leading-[14px] text-white"
              style={{ background: DEGRADE_ORANGE, boxShadow: OMBRE_CARTE }}
            >
              {LIBELLE_ETAT_PRODUIT[produit.etat_produit]}
            </span>
          ) : null}
          {produit.pourcentage_reduction ? (
            <span
              className="absolute right-3 top-[15px] flex h-[22px] items-center rounded px-2 text-xs font-bold leading-[14px] text-white"
              style={{ background: "linear-gradient(115.13deg, #FF9700 0%, #FFB800 100%)" }}
            >
              -{produit.pourcentage_reduction}%
            </span>
          ) : null}
        </div>
      </div>

      {produit.images.length > 1 ? (
        <div className="flex shrink-0 gap-2 overflow-x-auto px-3 pb-[14px] pt-[9px]">
          {produit.images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setImageActive(index)}
              className="relative h-[70px] w-[90px] shrink-0 overflow-hidden rounded-[5px] border-2 bg-white"
              style={{ borderColor: index === imageActive ? "rgba(38, 128, 235, 1)" : "transparent" }}
            >
              <Image src={image.url_image} alt="" fill className="object-cover" sizes="90px" />
            </button>
          ))}
        </div>
      ) : (
        <div className="h-3.5 shrink-0" />
      )}

      <div className="mx-3 flex shrink-0 flex-col gap-1 rounded-xl bg-white p-4" style={{ boxShadow: OMBRE_CARTE }}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-black px-2 py-1 text-[10px] font-extrabold text-white">
            {produit.nom_produit.split(" ")[0].toUpperCase()}
          </span>
          {enStock ? (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {produit.quantite_stock} pièces disponibles
            </span>
          ) : null}
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${enStock ? "bg-[#F2F5FA] text-brand-muted" : "bg-rose-50 text-rose-500"}`}>
            {enStock ? (stockFaible ? `Plus que ${produit.quantite_stock}` : "En stock") : "Rupture"}
          </span>
        </div>

        <p className="text-xl font-extrabold text-brand-ink">{produit.nom_produit}</p>
        {specsResume.length > 0 ? <p className="text-xs text-brand-muted">{specsResume.join(" • ")}</p> : null}

        <div
          className="mt-2 flex min-h-[58px] flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-lg px-3 py-2"
          style={{ background: "rgba(242, 243, 255, 0.6)" }}
        >
          <div className="shrink-0">
            <p className="whitespace-nowrap text-[10px] text-brand-muted">Prix</p>
            <div className="mt-0.5 flex items-baseline gap-2 whitespace-nowrap">
              <p className="text-[17px] font-extrabold text-[color:var(--brand-blue-end)]">{formaterPrix(prixActuel)}&nbsp;CFA</p>
              {prixBarre ? <p className="text-[11px] text-brand-muted line-through">{formaterPrix(prixBarre)}&nbsp;CFA</p> : null}
            </div>
          </div>
          {prixBarre ? (
            <span className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-orange-100 px-2 py-1 text-[10px] font-bold text-orange-600">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" /> Économie&nbsp;
              {formaterPrix(Number(prixBarre) - Number(prixActuel))}&nbsp;F
            </span>
          ) : null}
        </div>
      </div>

      <div className="mx-3 mt-3.5 shrink-0 rounded-[13px] bg-white p-4" style={{ boxShadow: "0px 1px 1px 0px rgba(0, 0, 0, 0.25)" }}>
        {specsDetail.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {specsDetail.map((spec) => (
              <div key={spec.label} className="flex items-center gap-1.5 rounded-xl bg-[#F7F8FF] px-2 py-2.5">
                <spec.Icone className="h-5 w-5 shrink-0 text-[color:var(--brand-blue-end)]" />
                <div className="min-w-0">
                  <p className="truncate text-[9px] text-brand-muted">{spec.label}</p>
                  <p className="text-[10px] font-extrabold leading-tight text-brand-ink">{spec.valeur}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-3 flex gap-1 rounded-full bg-white p-1" style={{ boxShadow: "0px 1px 1px 0px rgba(0, 0, 0, 0.25)" }}>
          {ONGLETS.map((onglet) => (
            <button
              key={onglet.id}
              type="button"
              onClick={() => setOngletActif(onglet.id)}
              className={`flex-1 rounded-full py-2 text-[11px] font-extrabold transition-colors ${
                ongletActif === onglet.id ? "text-white" : "text-brand-muted"
              }`}
              style={ongletActif === onglet.id ? { background: DEGRADE_ORANGE } : undefined}
            >
              {onglet.label}
            </button>
          ))}
        </div>

        <div className="mt-3 whitespace-pre-line rounded-[13px] p-4 text-xs leading-relaxed text-brand-muted" style={{ background: "rgba(247, 248, 255, 1)" }}>
          {contenuOnglet[ongletActif]}
        </div>
      </div>

      {fraisLivraisonMin !== null || produit.duree_garantie_mois ? (
        <div className="mx-3 mb-6 mt-3.5 flex shrink-0 flex-col gap-3 rounded-xl bg-white p-4" style={{ boxShadow: OMBRE_CARTE }}>
          {fraisLivraisonMin !== null ? (
            <div className="flex min-h-[44px] items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF1F6] text-[color:var(--brand-blue-end)]">
                <EngrenageIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-brand-ink">Livraison</p>
                <p className="mt-0.5 text-xs text-brand-muted">À partir de {formaterPrix(fraisLivraisonMin)}&nbsp;FCFA — selon ta localité</p>
              </div>
            </div>
          ) : null}
          {produit.duree_garantie_mois ? (
            <div className="flex min-h-[56px] items-center gap-3 rounded-xl bg-[#EEF1F6] px-4 py-1.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600">
                <ShieldCheckIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-brand-ink">Garantie</p>
                <p className="text-xs text-brand-muted">{produit.duree_garantie_mois} mois incluse à l&apos;achat</p>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="h-3.5 shrink-0" />
      )}

      {enStock ? (
        <div className="fixed inset-x-0 bottom-0 z-20 mx-auto flex w-full max-w-xl items-center gap-3 border-t border-brand-line bg-white px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onAjouterAuPanier}
            disabled={ajoutEnCours}
            className="flex h-12 flex-1 items-center justify-center rounded-full border-2 px-2 text-sm font-semibold disabled:opacity-60"
            style={{ borderColor: "#FF7800", color: "#FF7800" }}
          >
            {ajoute ? "Ajouté ✓" : ajoutEnCours ? "Ajout…" : "Ajouter au panier"}
          </button>

          <Link
            href={`/produit/${produit.id}/commander?quantite=1`}
            className="flex h-12 flex-1 items-center justify-center rounded-full text-sm font-semibold text-white shadow-md"
            style={{ background: DEGRADE_ORANGE }}
          >
            Commander
          </Link>
        </div>
      ) : null}

      {visionneuseOuverte ? (
        <VisionneuseImages
          images={produit.images.map((image) => image.url_image)}
          indexInitial={imageActive}
          onFermer={() => setVisionneuseOuverte(false)}
        />
      ) : null}
    </main>
  );
}
