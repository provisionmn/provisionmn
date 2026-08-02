import type { Metadata } from "next";
import { ServicesDetail } from "../components/ServicesDetail";

export const metadata: Metadata = {
  title: "Үйлчилгээ",
  description:
    "Fullstack, mobile, AI, DevOps, Odoo, UX/UI болон RPA үйлчилгээний дэлгэрэнгүй — үе шат, хугацаа, багц.",
};

export default function ServicesPage() {
  return (
    <main>
      <ServicesDetail />
    </main>
  );
}
