import Image from "next/image";

export function EnTeteAuth({ titre, sousTitre }: { titre: string; sousTitre: string }) {
  return (
    <section className="bg-gradient-brand-blue relative overflow-hidden rounded-b-[2.5rem] px-6 pb-10 pt-10 text-white">
      <Image
        src="/images/mascotte.png"
        alt=""
        width={110}
        height={109}
        className="pointer-events-none absolute -right-4 -top-2 h-[125px] w-[126px] object-contain opacity-95"
      />
      <p className="max-w-[70%] text-2xl font-bold leading-snug">{titre}</p>
      <p className="mt-2 max-w-[72%] text-sm text-white/85">{sousTitre}</p>
    </section>
  );
}
