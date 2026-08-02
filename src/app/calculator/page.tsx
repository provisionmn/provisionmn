import type { Metadata } from "next";
import { PriceCalculator } from "../components/PriceCalculator";

export const metadata: Metadata = {
  title: "Үнийн тооцоолуур",
  description:
    "Төслийн төрөл, хамрах хүрээ, хугацаагаараа ойролцоо үнийн тооцоог хормын дотор аваарай.",
};

export default function CalculatorPage() {
  return (
    <main className="pt-20 pb-12 px-4">
      <PriceCalculator />
    </main>
  );
}
