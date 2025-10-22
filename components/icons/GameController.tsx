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
      className={className}
      aria-hidden={!title}
    >
      {title && <title>{title}</title>}
      
      {/* Body: rounded rectangle 16×10 centered on canvas */}
      <rect x="4" y="7" width="16" height="10" rx="3" ry="3" />
      
      {/* D-pad (left): centered at 8.5, 12 */}
      <line x1="8.5" y1="10" x2="8.5" y2="14" />
      <line x1="6.5" y1="12" x2="10.5" y2="12" />
      
      {/* Face buttons (right): two circles radius 1.25 */}
      <circle cx="15.5" cy="11" r="1.25" />
      <circle cx="17.5" cy="13" r="1.25" />
    </svg>
  );
};

export default GameController;