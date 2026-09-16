import type { Metadata } from "next";
import { NotFound } from "./components/NotFound";

export const metadata: Metadata = {
  title: "Хуудас олдсонгүй",
};

export default function NotFoundPage() {
  return (
    <main id="main">
      <NotFound />
    </main>
  );
}
