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
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      
      {/* Outer body: 18×11 rounded rectangle for optical presence matching wrench */}
      <rect x="3" y="6.5" width="18" height="11" rx="3.5" ry="3.5" />
      
      {/* D-pad (left): centered at 8, 12 with 4-unit spans */}
      <line x1="8" y1="10" x2="8" y2="14" />
      <line x1="6" y1="12" x2="10" y2="12" />
      
      {/* Face buttons (right): two circles r=1.5 for balance */}
      <circle cx="16" cy="11" r="1.5" />
      <circle cx="18" cy="13" r="1.5" />
    </svg>
  );
};

export default GameController;