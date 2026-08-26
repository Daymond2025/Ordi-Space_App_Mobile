"use client";

type Props = {
  value: string;
  onChange: (valeur: string) => void;
  erreur?: string;
  autoFocus?: boolean;
};

export function ChampTelephoneWhatsapp({ value, onChange, erreur, autoFocus }: Props) {
  return (
    <div>
      <div
        className={`flex h-14 items-center gap-2.5 rounded-2xl border bg-white px-4 ${
          erreur ? "border-rose-400" : "border-brand-line"
        }`}
      >
        <span className="flex h-3.5 w-5 shrink-0 overflow-hidden rounded-[3px]">
          <span className="flex-1 bg-[#FF8200]" />
          <span className="flex-1 bg-white" />
          <span className="flex-1 bg-[#009E60]" />
        </span>
        <span className="shrink-0 text-sm font-semibold text-brand-ink">+225</span>
        <span className="h-6 w-px shrink-0 bg-brand-line" />
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          autoFocus={autoFocus}
          placeholder="Numéro whatsapp"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 bg-transparent text-sm text-brand-ink outline-none placeholder:text-brand-muted"
        />
      </div>
      {erreur ? <p className="mt-1.5 text-xs text-rose-500">{erreur}</p> : null}
    </div>
  );
}
