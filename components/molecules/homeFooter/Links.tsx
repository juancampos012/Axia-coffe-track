import React from 'react';

interface Link {
    href: string;
    label: string;
}

interface LinksColumnProps {
    title: string;
    links: Link[];
}

export const LinksColumn: React.FC<LinksColumnProps> = ({title, links}) => {
    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <ul>
                {links.map((link, index) => (
                <li key={index} className="mb-2">
                    <a
                        href={link.href}
                        className="text-homePrimary-200 hover:text-white transition"
                    >
                        {link.label}
                    </a>
                </li>
                ))}
            </ul>
        </div>
    );
}

