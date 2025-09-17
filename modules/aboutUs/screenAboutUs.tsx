import React from "react";

import MisionVision from "@/modules/aboutUs/misionVision";
import HomeFooter from "@/components/organisms/HomeFooter";
import AboutUs from "@/modules/aboutUs/aboutUs";
import Navbar from "../home/navBar";

const ScreenAboutUS: React.FC = () => {
  return (
    <div className="w-full bg-black">
        <Navbar/>   
        <MisionVision/>
        <AboutUs/>
        <HomeFooter
          style="bg-black text-white "
        />
    </div>
  );
};

export default ScreenAboutUS;