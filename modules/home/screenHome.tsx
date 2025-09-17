import React from "react";

import Hero from "./hero";
import Navbar from "./navBar";
import ContentHero from "./contentHero";
import HeroBlur from "./heroBlur/heroBlur";
import { PricingSection } from "./PricingSection";
import HomeFooter from "@/components/organisms/HomeFooter";

const ScreenHome: React.FC = () => {
  return (
    <div className="bg-black">
      <div className="min-h-screen w-full flex bg-black relative">
        <Navbar />
        <Hero />
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