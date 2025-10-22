import React from 'react';

interface GameControllerProps {
  className?: string;
  title?: string;
}

const GameController: React.FC<GameControllerProps> = ({ 
  className = "", 
  title
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={1}
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
      
      {/* D-pad cross */}
      <rect x="7.5" y="11" width="2" height="2" rx="0.5" fill="none" />
      <line x1="8.5" y1="10" x2="8.5" y2="14" />
      <line x1="7" y1="12" x2="10" y2="12" />
      
      {/* Action buttons */}
      <circle cx="16" cy="10" r="1" fill="none" />
      <circle cx="18" cy="12" r="1" fill="none" />
      <circle cx="16" cy="14" r="1" fill="none" />
      <circle cx="18" cy="16" r="1" fill="none" />
    </svg>
  );
};

export default GameController;