import React from 'react';

interface GameControllerProps {
  className?: string;
  title?: string;
  tone?: "primary" | "secondary";
}

const GameController: React.FC<GameControllerProps> = ({ 
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
      
      {/* Controller body */}
      <path d="M6 9a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V9z" />
      
      {/* Left grip */}
      <path d="M3 12a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2z" />
      
      {/* Right grip */}
      <path d="M16 12a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-2z" />
      
      {/* D-pad */}
      <g className={tone === "secondary" ? "opacity-70 icon-secondary-ink" : "opacity-70"}>
        <rect x="7" y="11" width="2" height="2" rx="0.5" fill="currentColor" />
        <rect x="6" y="10" width="1" height="1" rx="0.25" fill="currentColor" />
        <rect x="8" y="10" width="1" height="1" rx="0.25" fill="currentColor" />
        <rect x="6" y="12" width="1" height="1" rx="0.25" fill="currentColor" />
        <rect x="8" y="12" width="1" height="1" rx="0.25" fill="currentColor" />
      </g>
      
      {/* Action buttons */}
      <circle cx="16" cy="10" r="1" fill="currentColor" />
      <circle cx="18" cy="12" r="1" fill="currentColor" />
      <circle cx="16" cy="14" r="1" fill="currentColor" />
      <circle cx="18" cy="16" r="1" fill="currentColor" />
    </svg>
  );
};

export default GameController;
