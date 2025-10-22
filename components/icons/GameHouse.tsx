import React from 'react';

interface GameHouseProps {
  className?: string;
  title?: string;
  tone?: "primary" | "secondary";
}

const GameHouse: React.FC<GameHouseProps> = ({ 
  className = "", 
  title,
  tone = "primary" 
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={!title}
    >
      {title && <title>{title}</title>}
      
      {/* Main house structure */}
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      
      {/* Roof accent */}
      <path d="M9 22V12h6v10" />
      
      {/* Door */}
      <rect x="10" y="16" width="4" height="6" rx="1" fill="currentColor" />
      
      {/* Windows */}
      <rect x="6" y="12" width="2" height="2" rx="0.5" fill="currentColor" />
      <rect x="16" y="12" width="2" height="2" rx="0.5" fill="currentColor" />
      
      {/* Secondary accent - chimney */}
      <g className={tone === "secondary" ? "opacity-70 icon-secondary-ink" : "opacity-70"}>
        <rect x="17" y="6" width="2" height="4" rx="0.5" fill="currentColor" />
      </g>
    </svg>
  );
};

export default GameHouse;
