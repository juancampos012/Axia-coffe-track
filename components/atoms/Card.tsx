import React from 'react'

type CardInput = {
    color: string; 
    title: string; 
    description: string; 
    icon?: React.ElementType;
    iconColor?: string;
};

export default function Card({
    color, 
    title, 
    description, 
    icon: IconComponent,
    iconColor, 
}: CardInput) {
    return (
        <div className={`${color} text-white p-4 rounded-lg shadow-sm`}>
            
            {IconComponent && <IconComponent className="w-5 h-5" color={iconColor} />}
            <div className="flex-1 text-right">
                <h5 className="text-lg font-medium ">{description}</h5>
                <h3 className="text-xl font-semibold">{title}</h3>
            </div>
            
        </div>  
    );
}
