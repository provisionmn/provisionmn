import { Hero } from "./components/Hero";
import { Services } from "./components/Services";
import { Products } from "./components/Products";
import { About } from "./components/About";
import { Portfolio } from "./components/Portfolio";
import { Contact } from "./components/Contact";
import { Chatbot } from "./components/Chatbot";

export default function HomePage() {
  return (
    <>
      <main id="main">
        <Hero />
        <Services />
        <Products />
        <About />
        <Portfolio />
        <Contact />
      </main>
      <Chatbot />
    </>
  );
}
