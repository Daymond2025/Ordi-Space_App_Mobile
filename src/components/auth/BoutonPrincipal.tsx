"use client";

import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  chargement?: boolean;
  texteChargement?: string;
};

export function BoutonPrincipal({
  chargement,
  texteChargement = "Veuillez patienter…",
  children,
  disabled,
  className,
  ...rest
}: Props) {
  return (
    <button
      type="submit"
      disabled={disabled || chargement}
      className={`bg-gradient-brand-blue flex h-[52px] w-full items-center justify-center rounded-full text-sm font-semibold text-white shadow-md shadow-blue-200 transition-opacity disabled:opacity-60 ${className ?? ""}`}
      {...rest}
    >
      {chargement ? texteChargement : children}
    </button>
  );
}
