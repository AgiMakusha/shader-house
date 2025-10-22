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
      <path d="M6 9.5a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-5z" />
      
      {/* Left grip */}
      <path d="M3 12.5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.5z" />
      
      {/* Right grip */}
      <path d="M16 12.5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1.5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1.5z" />
      
      {/* D-pad */}
      <rect x="7.5" y="11" width="2" height="2" rx="1" fill="currentColor" />
      
      {/* Action buttons */}
      <circle cx="16" cy="10" r="1" fill="currentColor" />
      <circle cx="18" cy="12" r="1" fill="currentColor" />
      <circle cx="16" cy="14" r="1" fill="currentColor" />
      <circle cx="18" cy="16" r="1" fill="currentColor" />
      
      {/* Secondary accent - connection lines */}
      <g className="icon-secondary-ink" style={{ opacity: 0.65 }}>
        <path d="M8.5 10h1" strokeWidth={1} />
        <path d="M8.5 14h1" strokeWidth={1} />
        <path d="M7.5 12h1" strokeWidth={1} />
        <path d="M9.5 12h1" strokeWidth={1} />
      </g>
    </svg>
  );
};

export default GameController;