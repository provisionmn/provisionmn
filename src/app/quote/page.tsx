import type { Metadata } from "next";
import { QuoteRequest } from "../components/QuoteRequest";

export const metadata: Metadata = {
  title: "Оффер хүсэх",
  description:
    "Төслийнхөө шаардлагыг илгээгээд Provision.mn-ээс албан ёсны оффер аваарай.",
};

export default function QuotePage() {
  return (
    <main id="main" className="pt-20 pb-12 px-4">
      <QuoteRequest />
    </main>
  );
}
