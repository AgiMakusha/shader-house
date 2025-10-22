import React from 'react';

interface GameHouseProps {
  className?: string;
  title?: string;
}

const GameHouse: React.FC<GameHouseProps> = ({ 
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
      
      {/* House outline */}
      <path d="M3 9.5l9-7 9 7v11.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z" />
      
      {/* Door */}
      <rect x="10.5" y="16" width="3" height="6" rx="0.5" fill="none" />
      
      {/* Window */}
      <rect x="6.5" y="12" width="2" height="2" rx="0.5" fill="none" />
      <rect x="15.5" y="12" width="2" height="2" rx="0.5" fill="none" />
    </svg>
  );
};

export default GameHouse;