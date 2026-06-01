import React from "react";

import Hero from "./hero";
import Navbar from "./navBar";
import ContentHero from "./contentHero";
import HeroBlur from "./heroBlur/heroBlur";
import { PricingSection } from "./PricingSection";
import HomeFooter from "@/components/organisms/HomeFooter";
import CoffeePriceTicker from "@/components/molecules/CoffeePriceTicker";

const ScreenHome: React.FC = () => {
  return (
    <div className="bg-black">
      <div className="min-h-screen w-full bg-black ">
        <Navbar />
        <Hero />
      </div>

      {/* Ticker precio café — justo debajo del hero */}
      <div className="relative z-10 px-6 md:px-12 lg:px-20 -mt-6 pb-8" style={{ background: '#04060f' }}>
        <div className="max-w-4xl mx-auto">
          <CoffeePriceTicker variant="home" />
        </div>
      </div>

      <div className="mt-1">
        <HeroBlur />
      </div>

      <div className="mt-1"> 
        <ContentHero />
      </div>

      <div className="mt-1"> 
        <PricingSection />
      </div>

      <div className="mt-1"> 
        <HomeFooter 
          style="bg-black text-white "
        /> 
      </div>
    </div>
  );
};

export default ScreenHome;