import { BottomNav } from "@/components/BottomNav";
import { ServiceSheet } from "@/components/ServiceSheet";
import { ServiceSheetProvider } from "@/context/ServiceSheetContext";
import { PanierProvider } from "@/context/PanierContext";

export default function ShellLayout({ children }: LayoutProps<"/">) {
  return (
    <PanierProvider>
      <ServiceSheetProvider>
        <div className="mx-auto flex min-h-full w-full max-w-xl flex-1 flex-col bg-background md:relative md:my-6 md:min-h-[calc(100dvh-3rem)] md:max-h-[calc(100dvh-3rem)] md:overflow-y-auto md:overflow-x-hidden md:rounded-[2rem] md:shadow-2xl md:shadow-slate-900/15 md:ring-1 md:ring-black/5 md:[transform:translateZ(0)]">
          <div className="flex-1">{children}</div>
          <BottomNav />
        </div>
        <ServiceSheet />
      </ServiceSheetProvider>
    </PanierProvider>
  );
}
