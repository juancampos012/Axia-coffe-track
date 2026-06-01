import React from "react";

import ContactUs from "@/modules/contacUs/contactUs";
import Navbar from "../home/navBar";
import HomeFooter from "@/components/organisms/HomeFooter";

const ScreenContactUS: React.FC = () => {
  return (
    <div className="w-full" style={{ background: '#04060f' }}>
        <Navbar/>
        <ContactUs/>
        <HomeFooter
          style="bg-black text-white "
        />
    </div>
  );
};

export default ScreenContactUS;