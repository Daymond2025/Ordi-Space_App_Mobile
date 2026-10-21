"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { formaterPrix, LIBELLE_ETAT_PRODUIT, type Pagination, type Produit } from "@/lib/types";
import { ImageProduitCard } from "@/components/ImageProduitCard";
import { EngrenageIcon, GridIcon, HeadsetIcon, MonitorIcon, PanierIcon, SearchIcon } from "@/components/icons";
import { usePanier } from "@/context/PanierContext";

const CATEGORIES = [
  { id: "tout", label: "Tout", categorieId: null, icone: GridIcon },
  { id: "ordinateurs", label: "Ordinateurs", categorieId: 1, icone: MonitorIcon },
  { id: "accessoires", label: "Accessoires", categorieId: 2, icone: HeadsetIcon },
  { id: "logiciels", label: "Logiciels", categorieId: 3, icone: EngrenageIcon },
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
  const [recherche, setRecherche] = useState("");
  const [produits, setProduits] = useState<Produit[] | null>(null);

  const categorieActive = useMemo(() => CATEGORIES.find((c) => c.id === categorie), [categorie]);

  useEffect(() => {
    const params = categorieActive?.categorieId ? `?categorie_id=${categorieActive.categorieId}` : "";
    apiFetch<Pagination<Produit>>(`/produits${params}`).then((page) => setProduits(page.data));
  }, [categorieActive]);

  const produitsFiltres = useMemo(() => {
    if (!produits) return null;
    const terme = recherche.trim().toLowerCase();
    if (!terme) return produits;
    return produits.filter((p) => p.nom_produit.toLowerCase().includes(terme));
  }, [produits, recherche]);

  return (
    <main className="min-h-full pb-8">
      {/* Bandeau dégradé — juste le logo et le panier, l'auvent n'en fait pas
          partie : elle est posée à sa bordure (élément suivant, remonté par
          -mt pour chevaucher exactement cette limite), pas à l'intérieur. */}
      <div className="bg-gradient-brand-blue relative overflow-hidden px-5 pb-7 pt-4 text-white">
        <Image src="/images/image_header.png" alt="" fill className="object-cover opacity-20 mix-blend-soft-light" />

        <div className="relative flex items-center justify-between">
          <Image src="/images/Logo_Ordi_Space_bleu_et_blanc.png" alt="Ordi'Space" width={859} height={291} className="h-9 w-auto object-contain" priority />
          <Link href="/panier" className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white">
            <PanierIcon className="h-4.5 w-4.5 text-[color:var(--brand-blue-end)]" />
            {nombreArticles > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-semibold text-white">
                {nombreArticles}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      {/* Auvent — à la bordure du bandeau, pas dedans : remontée pour
          chevaucher la limite basse du bandeau au lieu d'être posée après. */}
      <div className="relative -mt-5 h-[63px] w-full overflow-hidden">
        <div className="absolute left-1/2 h-full w-[420px] -translate-x-1/2">
          <Image
            src="/images/Auvent_rayé.png"
            alt=""
            fill
            className="object-cover"
            style={{ objectPosition: "50% 47%" }}
            priority
          />
        </div>
      </div>

      <section className="px-2 pt-1">
        {/* Carte légèrement dégradée (bleu très clair) qui regroupe recherche
            et filtres — pas posés à nu sur le fond de page. */}
        <div
          className="rounded-[22px] p-2.5"
          style={{ background: "linear-gradient(135deg, #EAF3FF 0%, #DCEBFF 100%)" }}
        >
          {/* Barre de recherche et bouton panier fondus en un seul élément —
              le panier est inséré DANS la pilule blanche, pas à côté. */}
          <div className="flex h-11 items-center gap-2 rounded-full bg-white py-1 pl-4 pr-1 shadow-sm shadow-slate-900/5">
            <SearchIcon className="h-4.5 w-4.5 shrink-0 text-brand-muted" />
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un produit..."
              className="w-full min-w-0 bg-transparent text-sm text-brand-ink outline-none placeholder:text-brand-muted"
            />
            <Link
              href="/panier"
              aria-label="Voir le panier"
              className="bg-gradient-brand-blue flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
            >
              <PanierIcon className="h-4.5 w-4.5" />
            </Link>
          </div>

          {/* -mx-2.5/px-2.5 annulent le padding de la carte pour cette rangée
              seulement : elle a besoin de toute la largeur pour que les 4
              filtres tiennent sans couper "Logiciels". justify-between
              répartit les pilules sur toute la largeur disponible. */}
          <div className="-mx-2.5 mt-3 flex items-center justify-between gap-1 overflow-x-auto px-2.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategorie(cat.id)}
                className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] font-semibold transition-colors ${
                  categorie === cat.id
                    ? "bg-gradient-brand-blue text-white shadow-sm"
                    : "bg-white text-brand-ink shadow-sm shadow-slate-900/5"
                }`}
              >
                <cat.icone className={`h-3.5 w-3.5 shrink-0 ${categorie === cat.id ? "text-white" : "text-[color:var(--brand-blue-end)]"}`} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Rectangle blanc en arrière-plan — les produits sont posés dessus,
          plus directement sur le fond gris de la page. */}
      <section className="mt-4 px-2">
        <div className="rounded-[22px] bg-white p-2.5">
          {produitsFiltres === null ? (
            <p className="py-6 text-center text-sm text-brand-muted">Chargement…</p>
          ) : produitsFiltres.length === 0 ? (
            <p className="py-6 text-center text-sm text-brand-muted">Aucun produit dans cette catégorie.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {produitsFiltres.map((produit) => {
                const prixActuel = produit.prix_vente ?? produit.prix;
                const prixBarre = produit.prix_barre && Number(produit.prix_barre) > Number(prixActuel) ? produit.prix_barre : null;

                return (
                  <Link
                    key={produit.id}
                    href={`/produit/${produit.id}`}
                    className="overflow-hidden rounded-2xl bg-white p-2 shadow-sm"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-xl">
                      <ImageProduitCard images={produit.images} nom={produit.nom_produit} />

                      {produit.etat_produit ? (
                        <span
                          className="absolute left-2 top-2 rounded-lg px-2.5 py-1 text-[10px] font-bold text-white"
                          style={{ background: "linear-gradient(273.52deg, #FFCC00 -3.09%, #FF7800 98.47%)" }}
                        >
                          {LIBELLE_ETAT_PRODUIT[produit.etat_produit]}
                        </span>
                      ) : null}
                    </div>

                    <div className="px-1 pt-2.5 pb-1">
                      <p className="text-sm font-bold text-brand-ink">{produit.nom_produit}</p>
                      <p className="mt-0.5 truncate text-xs text-brand-muted">
                        {produit.description ?? produit.categorie.nom_categorie}
                      </p>
                      <div className="mt-1.5 flex items-baseline gap-1.5">
                        <p className="text-sm font-bold text-[color:var(--brand-blue-end)]">{formaterPrix(prixActuel)} CFA</p>
                        {prixBarre ? <p className="text-[11px] text-brand-muted line-through">{formaterPrix(prixBarre)} CFA</p> : null}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
