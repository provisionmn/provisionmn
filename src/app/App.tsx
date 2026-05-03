import { useState } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Services } from "./components/Services";
import { ServicesDetail } from "./components/ServicesDetail";
import { Products } from "./components/Products";
import { About } from "./components/About";
import { Portfolio } from "./components/Portfolio";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { PriceCalculator } from "./components/PriceCalculator";
import { QuoteRequest } from "./components/QuoteRequest";
import { Chatbot } from "./components/Chatbot";

type ViewType = 'main' | 'services-detail' | 'price-calculator' | 'quote-request';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('main');
  const [quoteData, setQuoteData] = useState<any>(null);

  const handleShowServicesDetail = () => {
    setCurrentView('services-detail');
    window.scrollTo(0, 0);
  };

  const handleShowPriceCalculator = () => {
    setCurrentView('price-calculator');
    window.scrollTo(0, 0);
  };

  const handleShowQuoteRequest = (data?: any) => {
    setQuoteData(data);
    setCurrentView('quote-request');
    window.scrollTo(0, 0);
  };

  const handleBackToMain = () => {
    setCurrentView('main');
    setQuoteData(null);
    window.scrollTo(0, 0);
  };

  const handlePriceCalculatorSubmit = (data: any) => {
    handleShowQuoteRequest(data);
  };

  const handleQuoteSubmit = () => {
    setTimeout(() => {
      handleBackToMain();
    }, 3000);
  };

  const handleChatbotQuoteRequest = (data: any) => {
    handleShowQuoteRequest(data);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'services-detail':
        return (
          <div className="min-h-screen">
            <Header />
            <ServicesDetail onBack={handleBackToMain} />
            <Footer />
          </div>
        );

      case 'price-calculator':
        return (
          <div className="min-h-screen">
            <Header />
            <div className="pt-20 pb-12 px-4">
              <PriceCalculator onSubmit={handlePriceCalculatorSubmit} />
            </div>
            <Footer />
          </div>
        );

      case 'quote-request':
        return (
          <div className="min-h-screen">
            <Header />
            <div className="pt-20 pb-12 px-4">
              <QuoteRequest
                initialData={quoteData}
                onSubmit={handleQuoteSubmit}
                onBack={quoteData ? handleShowPriceCalculator : handleBackToMain}
              />
            </div>
            <Footer />
          </div>
        );

      default:
        return (
          <div className="min-h-screen">
            <Header />
            <main>
              <Hero onGetQuote={handleShowPriceCalculator} />
              <Services onShowDetail={handleShowServicesDetail} />
              <Products />
              <About />
              <Portfolio />
              <Contact />
            </main>
            <Footer />
            <Chatbot onQuoteRequest={handleChatbotQuoteRequest} />
          </div>
        );
    }
  };

  return renderCurrentView();
}
