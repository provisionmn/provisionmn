"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

/**
 * Carries the PriceCalculator result across the /calculator -> /quote
 * navigation. Deliberately in-memory only: a hard reload of /quote drops the
 * prefill and renders a blank form, which is the same behaviour the old
 * single-page version had on refresh.
 */
interface QuoteCtx {
  quote: any;
  setQuote: (data: any) => void;
  clearQuote: () => void;
}

const Context = createContext<QuoteCtx | null>(null);

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [quote, setQuote] = useState<any>(null);

  return (
    <Context.Provider
      value={{ quote, setQuote, clearQuote: () => setQuote(null) }}
    >
      {children}
    </Context.Provider>
  );
}

export function useQuote() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useQuote must be used within QuoteProvider");
  return ctx;
}
