import type { Metadata } from "next";
import { QuoteRequest } from "../components/QuoteRequest";

export const metadata: Metadata = {
  title: "Оффер хүсэх",
  description:
    "Төслийнхөө шаардлагыг илгээгээд Provision.mn-ээс албан ёсны оффер аваарай.",
};

export default function QuotePage() {
  return (
    <main id="main" className="px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <QuoteRequest />
    </main>
  );
}
