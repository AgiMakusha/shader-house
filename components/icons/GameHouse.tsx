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
      <path d="M3 9.5l9-7 9 7v11.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z" />
      
      {/* Roof accent */}
      <path d="M9.5 22V12.5h5v9.5" />
      
      {/* Door */}
      <rect x="10.5" y="16" width="3" height="6" rx="1.5" fill="currentColor" />
      
      {/* Windows */}
      <rect x="6.5" y="12" width="2" height="2" rx="1" fill="currentColor" />
      <rect x="15.5" y="12" width="2" height="2" rx="1" fill="currentColor" />
      
      {/* Secondary accent - chimney */}
      <g className="icon-secondary-ink" style={{ opacity: 0.65 }}>
        <rect x="17" y="6" width="2" height="4" rx="1" fill="currentColor" />
      </g>
    </svg>
  );
};

export default GameHouse;