"use client";

import Link from "next/link";
import { usePanier } from "@/context/PanierContext";
import { formaterPrix } from "@/lib/types";
import { ImageProduitCard } from "@/components/ImageProduitCard";
import { ChevronLeftIcon, MinusIcon, PlusIcon, TrashIcon } from "@/components/icons";

export default function PanierPage() {
  const { panier, modifierQuantite, retirer } = usePanier();

  const total = panier?.lignes.reduce((somme, ligne) => somme + parseFloat(ligne.produit.prix) * ligne.quantite, 0) ?? 0;

  return (
    <main className="min-h-full pb-8">
      <div className="flex items-center gap-3 px-4 pt-4">
        <Link href="/market-space" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-line">
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-bold text-brand-ink">Mon panier</h1>
      </div>

      {panier === null ? (
        <p className="px-4 pt-6 text-sm text-brand-muted">Chargement…</p>
      ) : panier.lignes.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 pt-16 text-center">
          <p className="text-sm text-brand-muted">Ton panier est vide.</p>
          <Link href="/market-space" className="mt-2 text-sm font-semibold text-[color:var(--brand-blue-end)] underline underline-offset-2">
            Découvrir le Market&apos;Space
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-col gap-3 px-4">
            {panier.lignes.map((ligne) => (
              <div key={ligne.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                  <ImageProduitCard images={ligne.produit.images} nom={ligne.produit.nom_produit} sizes="64px" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-brand-ink">{ligne.produit.nom_produit}</p>
                  <p className="text-xs text-brand-muted">{formaterPrix(ligne.produit.prix)} CFA</p>
                  <div className="mt-1.5 flex items-center gap-2 rounded-full border border-brand-line px-2 py-1 w-fit">
                    <button
                      type="button"
                      onClick={() => modifierQuantite(ligne.id, Math.max(1, ligne.quantite - 1))}
                      className="flex h-5 w-5 items-center justify-center text-brand-muted"
                      aria-label="Diminuer la quantité"
                    >
                      <MinusIcon className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-4 text-center text-xs font-semibold text-brand-ink">{ligne.quantite}</span>
                    <button
                      type="button"
                      onClick={() => modifierQuantite(ligne.id, ligne.quantite + 1)}
                      className="flex h-5 w-5 items-center justify-center text-brand-muted"
                      aria-label="Augmenter la quantité"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <button type="button" onClick={() => retirer(ligne.id)} className="flex h-8 w-8 shrink-0 items-center justify-center text-brand-muted" aria-label="Retirer">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between px-4">
            <p className="text-sm text-brand-muted">Total</p>
            <p className="text-lg font-bold text-brand-ink">{formaterPrix(total)} CFA</p>
          </div>

          <div className="mt-4 px-4">
            <Link
              href="/panier/commander"
              className="bg-gradient-brand-blue flex h-12 items-center justify-center rounded-full text-sm font-semibold text-white shadow-md shadow-blue-200"
            >
              Commander
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
