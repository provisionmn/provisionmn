import { Hero } from "./components/Hero";
import { Marquee } from "./components/Marquee";
import { Services } from "./components/Services";
import { Products } from "./components/Products";
import { About } from "./components/About";
import { Portfolio } from "./components/Portfolio";
import { Contact } from "./components/Contact";
import { Process } from "./components/Process";
import { Faq } from "./components/Faq";
import { Chatbot } from "./components/Chatbot";

export default function HomePage() {
  return (
    <>
      {/*
        Horizontal overflow is clamped on <body> in layout.tsx, not here.
        `overflow-x: hidden` on a normal element makes it a scroll container,
        which silently kills `position: sticky` in its subtree — that would
        take out the Products card stack and the pinned section headers. On
        <body> it propagates to the viewport instead and body keeps a used
        overflow of `visible`, so sticky still works.
      */}
      <main id="main">
        <Hero />
        <Marquee />
        <Services />
        <Products />
        <Process />
        <Portfolio />
        <About />
        <Faq />
        <Contact />
      </main>
      <Chatbot />
    </>
  );
}
