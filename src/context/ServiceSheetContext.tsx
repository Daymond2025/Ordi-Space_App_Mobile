"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type ServiceSheetContextValue = {
  ouvert: boolean;
  ouvrir: () => void;
  fermer: () => void;
};

const ServiceSheetContext = createContext<ServiceSheetContextValue | null>(null);

export function ServiceSheetProvider({ children }: { children: ReactNode }) {
  const [ouvert, setOuvert] = useState(false);

  return (
    <ServiceSheetContext.Provider value={{ ouvert, ouvrir: () => setOuvert(true), fermer: () => setOuvert(false) }}>
      {children}
    </ServiceSheetContext.Provider>
  );
}

export function useServiceSheet(): ServiceSheetContextValue {
  const contexte = useContext(ServiceSheetContext);

  if (!contexte) {
    throw new Error("useServiceSheet doit être utilisé sous ServiceSheetProvider");
  }

  return contexte;
}
