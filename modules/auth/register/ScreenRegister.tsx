import React from "react";
import Image from 'next/image';

import RegisterBox from "./RegisterBox";

const ScreenRegister: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex bg-white">
      <div className="flex-1 flex justify-center items-center bg-white">
        <RegisterBox />
      </div>

      <div
        className="flex-1 relative"
        style={{
          backgroundImage: `url('/Images/uno.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute top-4 right-4 w-12 sm:w-16 md:w-20">
          <Image 
            src="/Images/logo_blanco.png" 
            alt="Logo" 
            width={80} 
            height={80} 
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
  };
export default ScreenRegister;