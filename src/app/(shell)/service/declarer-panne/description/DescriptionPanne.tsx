"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import type { Achat, Pagination } from "@/lib/types";
import { ChevronDownIcon } from "@/components/icons";
import { EnTetePanne } from "../EnTetePanne";

const DEGRADE_CONTINUER = "linear-gradient(90deg, #0077FF 0%, #00BFFF 100%)";

export function DescriptionPanne() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, pret } = useAuth();
  const [achats, setAchats] = useState<Achat[] | null>(null);
  const [achatId, setAchatId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<Pagination<Achat>>("/moi/achats", { token }).then((page) => {
      setAchats(page.data);
      const depuisUrl = Number(searchParams.get("achat"));
      setAchatId(page.data.find((a) => a.id === depuisUrl)?.id ?? page.data[0]?.id ?? null);
    });
  }, [token, searchParams]);

  function continuer() {
    if (!achatId || !description.trim()) {
      setErreur("Sélectionnez un produit et décrivez la panne avant de continuer.");
      return;
    }

    setErreur(null);
    router.push(`/service/declarer-panne/rendez-vous?achat=${achatId}&description=${encodeURIComponent(description.trim())}`);
  }

  return (
    <main className="min-h-full pb-10">
      <EnTetePanne />

      <div className="relative -mt-12 rounded-t-[2rem] bg-white px-5 pb-4 pt-5 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        <h2 className="text-center text-base font-bold leading-snug text-brand-ink">
          Sélectionner le produit
          <br />
          concerné
        </h2>
      </div>

      <div className="flex flex-col gap-4 px-5 pt-6">
        {!pret || (token && achats === null) ? (
          <p className="pt-6 text-center text-sm text-brand-muted">Chargement…</p>
        ) : (
          <>
            <div className="relative">
              <select
                value={achatId ?? ""}
                onChange={(e) => setAchatId(Number(e.target.value))}
                className="h-12 w-full appearance-none rounded-2xl border border-brand-line bg-white px-4 text-sm font-medium text-brand-ink"
              >
                {achats?.map((achat) => (
                  <option key={achat.id} value={achat.id}>
                    {achat.produit.nom_produit}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez la panne"
              rows={6}
              className="w-full resize-none rounded-2xl border border-brand-line px-4 py-4 text-center text-sm text-brand-ink placeholder:text-brand-muted"
            />

            {erreur ? <p className="text-center text-sm text-rose-500">{erreur}</p> : null}

            <div className="mt-2 flex justify-center">
              <button
                type="button"
                onClick={continuer}
                className="flex h-[53px] w-[296px] items-center justify-center rounded-[26.5px] border-[3px] border-white/40 text-sm font-bold text-white shadow-md shadow-blue-200"
                style={{ backgroundImage: DEGRADE_CONTINUER }}
              >
                Continue
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
