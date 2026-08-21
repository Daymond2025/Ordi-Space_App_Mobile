"use client";

import { useId, useState } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/icons";

type Props = {
  label: string;
  value: string;
  onChange: (valeur: string) => void;
  erreur?: string;
  autoComplete?: string;
};

export function ChampMotDePasse({ label, value, onChange, erreur, autoComplete }: Props) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-brand-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className={`w-full rounded-2xl border bg-white px-4 py-3 pr-11 text-sm text-brand-ink outline-none transition-colors focus:border-[color:var(--brand-blue-end)] ${
            erreur ? "border-rose-400" : "border-brand-line"
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-brand-muted"
        >
          {visible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </button>
      </div>
      {erreur ? <p className="mt-1 text-xs text-rose-500">{erreur}</p> : null}
    </div>
  );
}
