"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

/**
 * Carries the PriceCalculator result across the /calculator -> /quote
 * navigation. Deliberately in-memory only: a hard reload of /quote drops the
 * prefill and renders a blank form, which is the same behaviour the old
 * single-page version had on refresh.
 */
// Option fields carry stable IDs, never translated display labels.
export interface QuoteData {
  projectType?: string;
  complexity?: string;
  features?: string[];
  timeline?: string;
  teamSize?: string;
  description?: string;
  estimatedPrice?: number;
  estimatedHours?: number;
  estimatedWeeks?: number;
  createdAt?: string;
}

interface QuoteCtx {
  quote: QuoteData | null;
  setQuote: (data: QuoteData) => void;
  clearQuote: () => void;
}

const Context = createContext<QuoteCtx | null>(null);

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [quote, setQuote] = useState<QuoteData | null>(null);

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
