import React from 'react';

interface LogoProps {
  className?: string;
}

export const LogoIcon: React.FC<LogoProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    viewBox="0 0 40 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <defs>
      <linearGradient id="brandGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#14b8a6"/>
        <stop offset="1" stopColor="#3b82f6"/>
      </linearGradient>
    </defs>
    
    {/* Outer Coin/Shield Ring - Represents Trust, Security, and Finance */}
    <circle cx="20" cy="20" r="18" fill="url(#brandGrad)" fillOpacity="0.15" stroke="url(#brandGrad)" strokeWidth="2"/>
    
    {/* Inner Coin Solid - Represents the pooled funds */}
    <circle cx="20" cy="20" r="14" fill="url(#brandGrad)"/>
    
    {/* Side People - Representing the community coming together */}
    <g fill="white" fillOpacity="0.75">
      <circle cx="13" cy="18" r="2.5"/>
      <path d="M9 26 C9 23.5 11 21.5 13.5 21.5 C15 21.5 16 22.5 17 24 L17 26 Z"/>
      
      <circle cx="27" cy="18" r="2.5"/>
      <path d="M31 26 C31 23.5 29 21.5 26.5 21.5 C25 21.5 24 22.5 23 24 L23 26 Z"/>
    </g>

    {/* Center Person - Representing the group leader or unified target */}
    <g fill="white">
      <circle cx="20" cy="15" r="3"/>
      <path d="M14 26 C14 22.5 16.5 19.5 20 19.5 C23.5 19.5 26 22.5 26 26 Z"/>
    </g>
  </svg>
);
