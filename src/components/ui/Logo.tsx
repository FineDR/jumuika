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
      <linearGradient id="locooGrad" x1="10" y1="6" x2="32" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#14b8a6"/> {/* Brand Secondary: Teal */}
        <stop offset="0.5" stopColor="#0d9488"/> {/* Mid Teal */}
        <stop offset="1" stopColor="#3b82f6"/> {/* Brand Info: Blue */}
      </linearGradient>
    </defs>
    
    {/* Mathematically-perfect continuous letter 'L' ribbon */}
    <path 
      d="M13.5 7C11.567 7 10 8.567 10 10.5V26.5C10 28.433 11.567 30 13.5 30H29.5C31.433 30 33 28.433 33 26.5C33 24.567 31.433 23 29.5 23H17V10.5C17 8.567 15.433 7 13.5 7Z" 
      fill="url(#locooGrad)"
    />

    {/* Glowing/pulsing modular node at the top right */}
    <circle cx="29.5" cy="10.5" r="3" fill="#14b8a6" className="animate-pulse" />
  </svg>
);
