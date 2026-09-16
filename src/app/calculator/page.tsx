import type { Metadata } from "next";
import { PriceCalculator } from "../components/PriceCalculator";

export const metadata: Metadata = {
  title: "Үнийн тооцоолуур",
  description:
    "Төслийн төрөл, хамрах хүрээ, хугацаагаараа ойролцоо үнийн тооцоог хормын дотор аваарай.",
};

export default function CalculatorPage() {
  return (
    <main id="main" className="px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pb-24">
      <PriceCalculator />
    </main>
  );
}
