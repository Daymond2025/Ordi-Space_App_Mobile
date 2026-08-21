"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { formaterPrix, type Pagination, type Produit } from "@/lib/types";
import { ImageProduitCard } from "@/components/ImageProduitCard";
import { PanierIcon } from "@/components/icons";
import { usePanier } from "@/context/PanierContext";

const CATEGORIES = [
  { id: "tout", label: "Tout", categorieId: null },
  { id: "ordinateurs", label: "Ordinateurs", categorieId: 1 },
  { id: "accessoires", label: "Accessoires", categorieId: 2 },
  { id: "logiciels", label: "Logiciels", categorieId: 3 },
] as const;

export default function MarketSpacePage() {
  return (
    <Suspense>
      <MarketSpaceContenu />
    </Suspense>
  );
}

function MarketSpaceContenu() {
  const searchParams = useSearchParams();
  const { nombreArticles } = usePanier();
  const categorieInitiale = CATEGORIES.some((c) => c.id === searchParams.get("categorie"))
    ? (searchParams.get("categorie") as (typeof CATEGORIES)[number]["id"])
    : "tout";

  const [categorie, setCategorie] = useState<(typeof CATEGORIES)[number]["id"]>(categorieInitiale);
  const [produits, setProduits] = useState<Produit[] | null>(null);

  const categorieActive = useMemo(() => CATEGORIES.find((c) => c.id === categorie), [categorie]);

  useEffect(() => {
    const params = categorieActive?.categorieId ? `?categorie_id=${categorieActive.categorieId}` : "";
    apiFetch<Pagination<Produit>>(`/produits${params}`).then((page) => setProduits(page.data));
  }, [categorieActive]);

  return (
    <main className="min-h-full pb-8">
      {/* Bâche décorative — légèrement plus large que l'écran pour rester
          pleine largeur, mais assez réduite pour laisser voir ses côtés. */}
      <div className="relative h-[87px] w-full overflow-hidden">
        <div className="absolute left-1/2 h-full w-[420px] -translate-x-1/2">
          <Image
            src="/images/bache-marketspace.png"
            alt=""
            fill
            className="object-cover"
            style={{ objectPosition: "50% 35%" }}
            priority
          />
        </div>
      </div>

      <section className="bg-gradient-brand-blue relative -mt-5 mx-3 overflow-hidden rounded-[15px] px-5 pb-6 pt-5 text-white">
        {/* Rectangle avec image de fond derrière le titre — photo à intégrer
            (non fournie dans le dossier images), dégradé sombre en attendant. */}
        <div className="relative flex h-16 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900">
          <h1 className="text-center text-lg font-bold">Market&apos;Space</h1>
          <Link href="/panier" className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white">
            <PanierIcon className="h-4.5 w-4.5 text-[color:var(--brand-blue-end)]" />
            {nombreArticles > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-semibold text-white">
                {nombreArticles}
              </span>
            ) : null}
          </Link>
        </div>

        <div className="mt-4 flex justify-between gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategorie(cat.id)}
              style={{ width: 83, height: 28, borderWidth: 3, borderRadius: 14 }}
              className={`flex shrink-0 items-center justify-center border text-[11px] font-semibold transition-colors ${
                categorie === cat.id ? "border-white bg-white text-[color:var(--brand-blue-end)]" : "border-white/30 bg-white/10 text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3 px-4">
        {produits === null ? (
          <p className="col-span-2 text-center text-sm text-brand-muted">Chargement…</p>
        ) : produits.length === 0 ? (
          <p className="col-span-2 text-center text-sm text-brand-muted">Aucun produit dans cette catégorie.</p>
        ) : (
          produits.map((produit) => (
            <Link
              key={produit.id}
              href={`/produit/${produit.id}`}
              className="overflow-hidden rounded-2xl bg-white p-2 shadow-sm"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl">
                <ImageProduitCard images={produit.images} nom={produit.nom_produit} />
              </div>
              <div className="px-1 pt-2.5 pb-1">
                <p className="text-sm font-bold text-brand-ink">{produit.nom_produit}</p>
                <p className="mt-0.5 truncate text-xs text-brand-muted">
                  {produit.description ?? produit.categorie.nom_categorie}
                </p>
                <p className="mt-1.5 text-sm font-bold text-brand-ink">{formaterPrix(produit.prix)} CFA</p>
              </div>
            </Link>
          ))
        )}
      </section>
    </main>
  );
}
