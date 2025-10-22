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
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={1}
      className={className}
      aria-hidden={!title}
    >
      {title && <title>{title}</title>}
      
      {/* Rounded pill body */}
      <path d="M6 9.5a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-5z" />
      
      {/* Left d-pad (simple plus) */}
      <line x1="8.5" y1="10" x2="8.5" y2="14" />
      <line x1="7" y1="12" x2="10" y2="12" />
      
      {/* Right two small circles */}
      <circle cx="16" cy="10" r="1" fill="none" />
      <circle cx="18" cy="12" r="1" fill="none" />
    </svg>
  );
};

export default GameController;