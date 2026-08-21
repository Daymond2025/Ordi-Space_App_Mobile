"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, ApiRequestError } from "@/lib/api";
import {
  formaterDate,
  formaterPrix,
  type Achat,
  type AchatDetail,
  type ExclusionGarantix,
  type FormuleGarantix,
  type Pagination,
} from "@/lib/types";
import { CheckCircleIcon, ChevronDownIcon, ChevronLeftIcon, MedalStarIcon } from "@/components/icons";

const COULEUR_BOUTON_ACTIF = "rgba(0, 224, 101, 0.86)";

const DEGRADES_FORMULE = [
  "linear-gradient(90deg, #0077FF 0%, #00BFFF 100%)",
  "linear-gradient(274.19deg, #23E755 3.13%, #008421 98.13%)",
  "linear-gradient(273.52deg, #FFCC00 -3.09%, #FF7800 98.47%)",
];

const DEGRADE_EXCLUSIONS = "linear-gradient(274.19deg, #CDCDCD 3.13%, #001305 98.13%)";

const LIBELLE_MODE_PAIEMENT: Record<string, string> = {
  mobile_money: "Mobile Money",
  especes: "Espèces",
};

export default function GarantixPage() {
  const router = useRouter();
  const { token, pret } = useAuth();

  const [achats, setAchats] = useState<Achat[] | null>(null);
  const [achatId, setAchatId] = useState<number | null>(null);
  const [detailAchat, setDetailAchat] = useState<AchatDetail | null>(null);

  const [formules, setFormules] = useState<FormuleGarantix[] | null>(null);
  const [exclusions, setExclusions] = useState<ExclusionGarantix[] | null>(null);

  const [formuleActivationId, setFormuleActivationId] = useState<number | null>(null);
  const [modePaiement, setModePaiement] = useState<"mobile_money" | "especes">("mobile_money");
  const [chargementActivation, setChargementActivation] = useState(false);
  const [erreurActivation, setErreurActivation] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<Pagination<Achat>>("/moi/achats", { token }).then((page) => {
      const eligibles = page.data.filter((achat) => achat.produit.type_livraison === "physique");
      setAchats(eligibles);
      setAchatId(eligibles[0]?.id ?? null);
    });
    apiFetch<FormuleGarantix[]>("/garantix/formules", { token }).then(setFormules);
    apiFetch<ExclusionGarantix[]>("/garantix/exclusions", { token }).then(setExclusions);
  }, [token]);

  useEffect(() => {
    if (!token || !achatId) {
      setDetailAchat(null);
      return;
    }
    apiFetch<AchatDetail>(`/moi/achats/${achatId}`, { token }).then(setDetailAchat);
  }, [token, achatId]);

  function ouvrirActivation(formuleId: number) {
    setErreurActivation(null);
    setFormuleActivationId(formuleId);
  }

  async function confirmerActivation() {
    if (!token || !achatId || !formuleActivationId) return;

    setErreurActivation(null);
    setChargementActivation(true);

    try {
      await apiFetch("/garantix/abonnements", {
        method: "POST",
        token,
        body: {
          ligne_commande_id: achatId,
          formule_garantix_id: formuleActivationId,
          mode_paiement: modePaiement,
        },
      });

      const rafraichi = await apiFetch<AchatDetail>(`/moi/achats/${achatId}`, { token });
      setDetailAchat(rafraichi);
      setFormuleActivationId(null);
    } catch (e) {
      setErreurActivation(e instanceof ApiRequestError ? e.message : "Impossible d'activer cette formule GarantiX.");
    } finally {
      setChargementActivation(false);
    }
  }

  const abonnementActif = detailAchat?.abonnement_garantix_actif ?? null;

  return (
    <main className="min-h-full pb-10">
      <div className="bg-gradient-brand-blue relative flex items-center gap-3 rounded-b-[2rem] px-4 pb-10 pt-4 text-white">
        <button type="button" onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <h1 className="absolute inset-x-0 text-center text-base font-bold">GarantiX</h1>
      </div>

      {!pret ? (
        <p className="px-4 pt-6 text-center text-sm text-brand-muted">Chargement…</p>
      ) : !token ? (
        <p className="px-4 pt-6 text-center text-sm text-brand-muted">Connectez-vous pour activer GarantiX.</p>
      ) : (
        <>
          <div className="relative -mt-6 px-4">
            <div className="rounded-3xl bg-white p-5 shadow-lg shadow-blue-100">
              {achats && achats.length > 1 ? (
                <div className="relative mb-4">
                  <select
                    value={achatId ?? ""}
                    onChange={(e) => setAchatId(Number(e.target.value))}
                    className="h-11 w-full appearance-none rounded-2xl border border-brand-line bg-white px-4 text-xs font-semibold text-brand-ink"
                  >
                    {achats.map((achat) => (
                      <option key={achat.id} value={achat.id}>
                        {achat.produit.nom_produit}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                </div>
              ) : null}

              {achats && achats.length === 0 ? (
                <p className="text-sm text-brand-muted">
                  GarantiX s&apos;active sur un ordinateur déjà acheté. Vous n&apos;avez pas encore d&apos;ordinateur éligible.
                </p>
              ) : abonnementActif ? (
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-[color:var(--brand-blue-end)]">Statut actuel</p>
                    <p className="mt-1 text-xl font-extrabold text-[color:var(--brand-blue-end)]">
                      {abonnementActif.formule.libelle_complet}
                    </p>
                    <p className="mt-3 text-[11px] text-brand-muted">Date de début : {formaterDate(abonnementActif.date_debut)}</p>
                    <p className="text-[11px] text-brand-muted">Date de fin : {formaterDate(abonnementActif.date_fin)}</p>
                  </div>
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[color:var(--brand-blue-end)]">
                    <MedalStarIcon className="h-10 w-10" />
                  </span>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-brand-muted">Statut actuel</p>
                    <p className="mt-1 text-lg font-bold text-brand-ink">Aucun abonnement actif</p>
                    <p className="mt-2 text-[11px] text-brand-muted">Activez une formule ci-dessous pour protéger cet ordinateur.</p>
                  </div>
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-line text-brand-muted">
                    <MedalStarIcon className="h-10 w-10" />
                  </span>
                </div>
              )}

              {abonnementActif ? (
                <div className="mt-3 flex justify-end">
                  <span className="rounded-full px-4 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor: COULEUR_BOUTON_ACTIF }}>
                    Actif
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-8 px-4">
            {formules === null ? (
              <p className="pt-4 text-center text-sm text-brand-muted">Chargement des formules…</p>
            ) : (
              formules.map((formule, index) => {
                const degrade = DEGRADES_FORMULE[index % DEGRADES_FORMULE.length];
                const activationOuverte = formuleActivationId === formule.id;
                const dejaActive = abonnementActif?.formule.id === formule.id;

                return (
                  <div key={formule.id} className="relative">
                    <div className="absolute inset-x-2 inset-y-0 translate-y-2.5 rounded-3xl" style={{ backgroundImage: degrade }} />

                    <div className="relative rounded-3xl bg-white p-4 pb-6 shadow-lg shadow-black/10">
                      <div className="rounded-2xl p-4 text-white" style={{ backgroundImage: degrade }}>
                        <div className="flex items-start justify-between gap-3">
                          <p className="whitespace-pre-line text-base font-bold leading-snug">{formule.libelle_complet}</p>
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/25">
                            <MedalStarIcon className="h-6 w-6" />
                          </span>
                        </div>

                        <p className="mt-3 text-3xl font-extrabold">
                          {formaterPrix(formule.prix_annuel)} <span className="text-base font-semibold">Fr /AN</span>
                        </p>
                      </div>

                      <p className="mt-3 px-1 text-xs font-medium text-brand-muted">Fréquence : {formule.frequence_interventions} fois</p>
                      {formule.description ? (
                        <p className="mt-2 px-1 text-xs leading-relaxed text-brand-muted">{formule.description}</p>
                      ) : null}

                      <div className="mt-4 px-1">
                        <p className="text-sm font-bold text-brand-ink">Prise en charge</p>

                        <ul className="mt-2 flex flex-col gap-1.5">
                          {formule.prestations.map((prestation) => (
                            <li key={prestation.id} className="flex items-start gap-2 text-xs text-brand-ink">
                              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-ink" />
                              {prestation.libelle}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {dejaActive ? (
                        <div className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-50 text-sm font-bold text-emerald-600">
                          <CheckCircleIcon className="h-5 w-5" />
                          Formule active sur cet ordinateur
                        </div>
                      ) : activationOuverte ? (
                        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-brand-line p-3">
                          <p className="text-center text-xs font-semibold text-brand-ink">
                            Aucun paiement en ligne : réglez en espèces ou par Mobile Money auprès de notre équipe.
                          </p>

                          <div className="flex gap-2">
                            {(["mobile_money", "especes"] as const).map((mode) => (
                              <button
                                key={mode}
                                type="button"
                                onClick={() => setModePaiement(mode)}
                                className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold ${
                                  modePaiement === mode ? "bg-brand-ink text-white" : "bg-brand-line text-brand-muted"
                                }`}
                              >
                                {LIBELLE_MODE_PAIEMENT[mode]}
                              </button>
                            ))}
                          </div>

                          {erreurActivation ? <p className="text-center text-xs text-rose-500">{erreurActivation}</p> : null}

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setFormuleActivationId(null)}
                              className="flex-1 rounded-full bg-brand-line px-3 py-2.5 text-xs font-semibold text-brand-muted"
                            >
                              Annuler
                            </button>
                            <button
                              type="button"
                              onClick={confirmerActivation}
                              disabled={chargementActivation}
                              className="flex-1 rounded-full px-3 py-2.5 text-xs font-bold text-white disabled:opacity-60"
                              style={{ backgroundImage: degrade }}
                            >
                              {chargementActivation ? "Activation…" : "Confirmer"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => ouvrirActivation(formule.id)}
                          disabled={!achatId}
                          className="mt-5 flex h-12 w-full items-center justify-center rounded-full text-sm font-bold text-white shadow-lg shadow-black/20 disabled:opacity-50"
                          style={{ backgroundImage: degrade }}
                        >
                          Activer maintenant
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {exclusions && exclusions.length > 0 ? (
              <div className="relative">
                <div className="absolute inset-x-2 inset-y-0 translate-y-2.5 rounded-3xl" style={{ backgroundImage: DEGRADE_EXCLUSIONS }} />

                <div className="relative rounded-3xl bg-white p-4 pb-6 shadow-lg shadow-black/10">
                  <div className="rounded-2xl p-4 text-white" style={{ backgroundImage: DEGRADE_EXCLUSIONS }}>
                    <p className="text-lg font-extrabold">Exclusions</p>
                  </div>

                  <p className="mt-4 px-1 text-sm font-bold text-brand-ink">Prise en charge</p>

                  <ul className="mt-3 flex flex-col gap-1.5 px-1">
                    {exclusions.map((exclusion) => (
                      <li key={exclusion.id} className="flex items-start gap-2 text-xs text-brand-muted">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-muted" />
                        {exclusion.libelle}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        </>
      )}
    </main>
  );
}
