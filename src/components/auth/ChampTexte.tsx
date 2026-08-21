"use client";

import { useId, type InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  label: string;
  value: string;
  onChange: (valeur: string) => void;
  erreur?: string;
};

export function ChampTexte({ label, value, onChange, erreur, className, ...rest }: Props) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-brand-ink">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-brand-ink outline-none transition-colors placeholder:text-brand-muted focus:border-[color:var(--brand-blue-end)] ${
          erreur ? "border-rose-400" : "border-brand-line"
        } ${className ?? ""}`}
        {...rest}
      />
      {erreur ? <p className="mt-1 text-xs text-rose-500">{erreur}</p> : null}
    </div>
  );
}
