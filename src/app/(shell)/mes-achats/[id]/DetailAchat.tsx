"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, ApiRequestError } from "@/lib/api";
import {
  formaterDate,
  formaterPrix,
  garantieEstActive,
  type AchatDetail,
  type FormuleGarantix,
} from "@/lib/types";
import { ImageProduitCard } from "@/components/ImageProduitCard";
import { BoutonPrincipal } from "@/components/auth/BoutonPrincipal";
import {
  ChevronLeftIcon,
  ReceiptIcon,
  RibbonIcon,
  ShieldCheckIcon,
} from "@/components/icons";

const LIBELLE_MODE_PAIEMENT: Record<string, string> = {
  mobile_money: "Mobile Money",
  especes: "Espèces",
};

export function DetailAchat({ id }: { id: string }) {
  const { token, pret } = useAuth();
  const [detail, setDetail] = useState<AchatDetail | null | undefined>(undefined);
  const [formules, setFormules] = useState<FormuleGarantix[] | null>(null);
  const [formuleSelectionneeId, setFormuleSelectionneeId] = useState<number | null>(null);
  const [modePaiementGarantix, setModePaiementGarantix] = useState<"mobile_money" | "especes">("mobile_money");
  const [soucriptionOuverte, setSouscriptionOuverte] = useState(false);
  const [chargementSouscription, setChargementSouscription] = useState(false);
  const [erreurSouscription, setErreurSouscription] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<AchatDetail>(`/moi/achats/${id}`, { token })
      .then(setDetail)
      .catch(() => setDetail(null));
  }, [id, token]);

  function ouvrirSouscription() {
    setSouscriptionOuverte(true);
    if (!formules && token) {
      apiFetch<FormuleGarantix[]>("/garantix/formules", { token }).then((liste) => {
        setFormules(liste);
        setFormuleSelectionneeId(liste[0]?.id ?? null);
      });
    }
  }

  async function confirmerSouscription() {
    if (!token || !formuleSelectionneeId) return;

    setErreurSouscription(null);
    setChargementSouscription(true);

    try {
      await apiFetch("/garantix/abonnements", {
        method: "POST",
        token,
        body: {
          ligne_commande_id: Number(id),
          formule_garantix_id: formuleSelectionneeId,
          mode_paiement: modePaiementGarantix,
        },
      });

      const rafraichi = await apiFetch<AchatDetail>(`/moi/achats/${id}`, { token });
      setDetail(rafraichi);
      setSouscriptionOuverte(false);
    } catch (e) {
      setErreurSouscription(e instanceof ApiRequestError ? e.message : "Impossible de souscrire à GarantiX.");
    } finally {
      setChargementSouscription(false);
    }
  }

  if (!pret || (token && detail === undefined)) {
    return <p className="px-4 py-6 text-sm text-brand-muted">Chargement…</p>;
  }

  if (!token || !detail) {
    return (
      <main className="min-h-full">
        <div className="flex items-center gap-3 px-4 pt-4">
          <Link href="/mes-achats" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-line">
            <ChevronLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-bold text-brand-ink">Mes achats</h1>
        </div>
        <p className="px-4 pt-6 text-sm text-brand-muted">Cet achat est introuvable.</p>
      </main>
    );
  }

  const { ligne, abonnement_garantix_actif: abonnementActif, accessoires_compatibles: accessoires } = detail;
  const garantieActive = garantieEstActive(ligne.garantie);
  const paiement = ligne.commande.paiement;

  return (
    <main className="min-h-full pb-10">
      <div className="bg-gradient-brand-blue relative overflow-hidden rounded-b-[2.5rem] px-5 pb-12 pt-4 text-white">
        <div className="flex items-center gap-3">
          <Link href="/mes-achats" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
            <ChevronLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-bold">Mes achats</h1>
        </div>
      </div>

      <div className="relative -mt-8 px-5">
        <div className="flex items-center gap-3 rounded-3xl bg-white p-3 shadow-lg shadow-blue-100">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
            <ImageProduitCard images={ligne.produit.images} nom={ligne.produit.nom_produit} sizes="80px" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-brand-ink">{ligne.produit.nom_produit}</p>
            <p className="mt-0.5 truncate text-xs text-brand-muted">
              {ligne.produit.description ?? ligne.produit.categorie.nom_categorie}
            </p>
            <span
              className={`mt-2 inline-block rounded-full px-3 py-1 text-[11px] font-semibold ${
                garantieActive ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
              }`}
            >
              {garantieActive ? "Garantie en cours" : "Garantie expirée"}
            </span>
            <p className="mt-1.5 text-[10px] font-medium uppercase tracking-wide text-brand-muted">
              Date d&apos;achat : {formaterDate(ligne.commande.date_commande)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 px-5">
        <section className="rounded-2xl border-l-4 border-[color:var(--brand-blue-end)] bg-white p-4 shadow-sm">
          <p className="text-sm font-bold text-brand-ink">Valeur estimée de reprise</p>
          <p className="mt-1 text-xs text-brand-muted">
            Cette fonctionnalité arrive bientôt : nous vous proposerons une estimation de reprise pour cet ordinateur.
          </p>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              disabled
              className="rounded-full bg-brand-line px-5 py-2.5 text-xs font-semibold text-brand-muted"
            >
              Changer mon ordinateur — bientôt disponible
            </button>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-bold text-brand-ink">
            <ReceiptIcon className="h-4 w-4 text-brand-muted" />
            Facture
          </p>

          {paiement ? (
            <div className="mt-3 flex flex-col gap-1.5 text-xs text-brand-muted">
              <p className="flex justify-between">
                <span>Montant réglé</span>
                <span className="font-semibold text-brand-ink">{formaterPrix(paiement.montant)} CFA</span>
              </p>
              <p className="flex justify-between">
                <span>Mode de paiement</span>
                <span className="font-medium text-brand-ink">{LIBELLE_MODE_PAIEMENT[paiement.mode_paiement] ?? paiement.mode_paiement}</span>
              </p>
              <p className="flex justify-between">
                <span>Date de règlement</span>
                <span className="font-medium text-brand-ink">{paiement.date_paiement ? formaterDate(paiement.date_paiement) : "—"}</span>
              </p>
            </div>
          ) : (
            <p className="mt-2 text-xs text-brand-muted">Paiement pas encore enregistré pour cet achat.</p>
          )}
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-bold text-brand-ink">
            <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />
            Garantie
          </p>

          <div className="mt-3 flex flex-col gap-1.5 text-xs text-brand-muted">
            <p className="flex justify-between">
              <span>Type</span>
              <span className="font-medium text-brand-ink">Garantie OrdiSpace</span>
            </p>
            <p className="flex justify-between">
              <span>Début</span>
              <span className="font-medium text-brand-ink">{formaterDate(ligne.garantie.date_debut)}</span>
            </p>
            <p className="flex justify-between">
              <span>Fin</span>
              <span className="font-medium text-brand-ink">{formaterDate(ligne.garantie.date_fin)}</span>
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-bold text-brand-ink">
            <RibbonIcon className="h-4 w-4 text-[color:var(--brand-blue-end)]" />
            Assurance GarantiX
          </p>

          {abonnementActif ? (
            <div className="mt-3 flex flex-col gap-1.5 text-xs text-brand-muted">
              <p className="flex justify-between">
                <span>Formule</span>
                <span className="font-semibold text-brand-ink">{abonnementActif.formule.libelle_complet}</span>
              </p>
              <p className="flex justify-between">
                <span>Active jusqu&apos;au</span>
                <span className="font-medium text-brand-ink">{formaterDate(abonnementActif.date_fin)}</span>
              </p>
            </div>
          ) : soucriptionOuverte ? (
            <div className="mt-3 flex flex-col gap-3">
              {formules === null ? (
                <p className="text-xs text-brand-muted">Chargement des formules…</p>
              ) : (
                formules.map((formule) => (
                  <button
                    key={formule.id}
                    type="button"
                    onClick={() => setFormuleSelectionneeId(formule.id)}
                    className={`rounded-2xl border px-4 py-3 text-left ${
                      formuleSelectionneeId === formule.id ? "border-[color:var(--brand-blue-end)] bg-blue-50" : "border-brand-line bg-white"
                    }`}
                  >
                    <p className="text-sm font-semibold text-brand-ink">{formule.libelle_complet}</p>
                    <p className="mt-0.5 text-xs text-brand-muted">{formaterPrix(formule.prix_annuel)} CFA / an</p>
                  </button>
                ))
              )}

              <div className="flex gap-2">
                {(["mobile_money", "especes"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setModePaiementGarantix(mode)}
                    className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold ${
                      modePaiementGarantix === mode ? "bg-brand-ink text-white" : "bg-brand-line text-brand-muted"
                    }`}
                  >
                    {LIBELLE_MODE_PAIEMENT[mode]}
                  </button>
                ))}
              </div>

              {erreurSouscription ? <p className="text-xs text-rose-500">{erreurSouscription}</p> : null}

              <BoutonPrincipal
                type="button"
                onClick={confirmerSouscription}
                chargement={chargementSouscription}
                disabled={!formuleSelectionneeId}
                texteChargement="Souscription…"
                className="h-11"
              >
                Confirmer la souscription
              </BoutonPrincipal>
            </div>
          ) : (
            <>
              <p className="mt-2 text-xs text-brand-muted">Aucune assurance GarantiX active sur cet ordinateur.</p>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={ouvrirSouscription}
                  className="bg-gradient-brand-blue rounded-full px-5 py-2.5 text-xs font-semibold text-white"
                >
                  Souscrire à GarantiX
                </button>
              </div>
            </>
          )}
        </section>

        <section>
          <p className="text-sm font-bold text-brand-ink">Accessoires compatibles</p>

          {accessoires.length === 0 ? (
            <p className="mt-2 text-xs text-brand-muted">Aucun accessoire disponible pour le moment.</p>
          ) : (
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
              {accessoires.map((accessoire) => (
                <Link
                  key={accessoire.id}
                  href={`/produit/${accessoire.id}`}
                  className="w-28 shrink-0 overflow-hidden rounded-2xl bg-white p-2 shadow-sm"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl">
                    <ImageProduitCard images={accessoire.images} nom={accessoire.nom_produit} sizes="112px" />
                  </div>
                  <p className="mt-2 truncate text-xs font-semibold text-brand-ink">{accessoire.nom_produit}</p>
                  <p className="text-[11px] text-brand-muted">{formaterPrix(accessoire.prix)} CFA</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
