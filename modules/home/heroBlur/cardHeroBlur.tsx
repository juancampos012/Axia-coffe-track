import React from 'react';

interface CardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const CardHeroBlur: React.FC<CardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-black rounded-xl p-6 flex flex-col gap-4 border border-gray-700 shadow-lg">
      <div className="text-homePrimary">
        {icon}
      </div>

      <div className="space-y-3">
        <h3 className="text-white text-xl font-semibold text-left">
          {title}
        </h3>
        
        <p className="text-gray-400 text-left">
          {description}
        </p>
      </div>
    </div>
  );
};

export default CardHeroBlur;