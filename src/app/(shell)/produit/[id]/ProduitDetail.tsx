"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { formaterPrix, type Produit } from "@/lib/types";
import { ImageProduitCard } from "@/components/ImageProduitCard";
import { ChevronLeftIcon, MinusIcon, PlusIcon, ShieldCheckIcon } from "@/components/icons";
import { useAuth } from "@/context/AuthContext";
import { usePanier } from "@/context/PanierContext";

export function ProduitDetail({ id }: { id: string }) {
  const router = useRouter();
  const { token } = useAuth();
  const { ajouter } = usePanier();
  const [produit, setProduit] = useState<Produit | null | undefined>(undefined);
  const [quantite, setQuantite] = useState(1);
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

  async function onAjouterAuPanier() {
    if (!produit) return;

    if (!token) {
      router.push(`/connexion?next=${encodeURIComponent(`/produit/${id}`)}`);
      return;
    }
    setAjoutEnCours(true);
    try {
      await ajouter(produit.id, quantite);
      setAjoute(true);
      setTimeout(() => setAjoute(false), 2000);
    } finally {
      setAjoutEnCours(false);
    }
  }

  return (
    <main className="min-h-full pb-40">
      <div className="relative aspect-square w-full bg-[#EEF1F6]">
        <ImageProduitCard images={produit.images} nom={produit.nom_produit} sizes="100vw" />
        <Link
          href="/market-space"
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
      </div>

      <div className="px-4 pt-4">
        <span className="inline-block rounded-full bg-[#EEF1F6] px-3 py-1 text-[11px] font-medium text-brand-muted">
          {produit.categorie.nom_categorie}
        </span>

        <h1 className="mt-2 text-xl font-bold text-brand-ink">{produit.nom_produit}</h1>
        <p className="mt-1 text-2xl font-extrabold text-brand-ink">{formaterPrix(produit.prix)} CFA</p>

        <p className={`mt-2 text-sm font-medium ${enStock ? (stockFaible ? "text-amber-600" : "text-emerald-600") : "text-rose-500"}`}>
          {enStock ? (stockFaible ? `Plus que ${produit.quantite_stock} en stock` : "En stock") : "Rupture de stock"}
        </p>

        {produit.duree_garantie_mois ? (
          <p className="mt-3 flex items-center gap-2 rounded-2xl bg-[#EEF1F6] px-4 py-3 text-xs text-brand-ink">
            <ShieldCheckIcon className="h-4 w-4 shrink-0 text-emerald-600" />
            Garantie {produit.duree_garantie_mois} mois incluse à l&apos;achat
          </p>
        ) : null}

        {produit.description ? (
          <div className="mt-5">
            <p className="text-sm font-semibold text-brand-ink">Description</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-brand-muted">{produit.description}</p>
          </div>
        ) : null}
      </div>

      {enStock ? (
        <div className="fixed inset-x-0 bottom-[64px] z-20 mx-auto flex w-full max-w-xl flex-col gap-2 border-t border-brand-line bg-white px-4 pt-3 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-full border border-brand-line px-3 py-2">
              <button
                type="button"
                onClick={() => setQuantite((q) => Math.max(1, q - 1))}
                className="flex h-6 w-6 items-center justify-center text-brand-muted"
                aria-label="Diminuer la quantité"
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              <span className="w-5 text-center text-sm font-semibold text-brand-ink">{quantite}</span>
              <button
                type="button"
                onClick={() => setQuantite((q) => Math.min(produit.quantite_stock, q + 1))}
                className="flex h-6 w-6 items-center justify-center text-brand-muted"
                aria-label="Augmenter la quantité"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>

            <Link
              href={`/produit/${produit.id}/commander?quantite=${quantite}`}
              className="bg-gradient-brand-blue flex h-12 flex-1 items-center justify-center rounded-full text-sm font-semibold text-white shadow-md shadow-blue-200"
            >
              Commander
            </Link>
          </div>

          <button
            type="button"
            onClick={onAjouterAuPanier}
            disabled={ajoutEnCours}
            className="mx-auto flex h-11 items-center justify-center rounded-full border border-[color:var(--brand-blue-end)] px-8 text-sm font-semibold text-[color:var(--brand-blue-end)] disabled:opacity-60"
          >
            {ajoute ? "Ajouté au panier ✓" : ajoutEnCours ? "Ajout…" : "Ajouter au panier"}
          </button>
        </div>
      ) : null}
    </main>
  );
}
