import React from 'react';

interface GameControllerNeoProps {
  className?: string;
  title?: string;
  strokeWidth?: number;
}

const GameControllerNeo: React.FC<GameControllerNeoProps> = ({ 
  className = "", 
  title,
  strokeWidth = 1.75
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={1}
      className={className}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      
      {/* Outer silhouette: ergonomic curve with grips and top dip */}
      <path 
        d="
          M 5.0 16.0
          C 4.2 14.2, 4.2 10.8, 6.8 9.8
          C 9.4 8.9, 12.0 9.7, 12.0 9.7
          C 12.0 9.7, 14.6 8.9, 17.2 9.8
          C 19.8 10.8, 19.8 14.2, 19.0 16.0
          C 17.6 18.6, 14.7 18.6, 12.0 17.1
          C 9.3 18.6, 6.4 18.6, 5.0 16.0
        " 
        strokeWidth={strokeWidth} 
      />
      
      {/* D-pad (left): minimal plus centered at (8.0, 12.0) */}
      <path d="M 8.0 10.5 L 8.0 13.5" strokeWidth={strokeWidth} />
      <path d="M 6.5 12.0 L 9.5 12.0" strokeWidth={strokeWidth} />
      
      {/* Face buttons (right): four hollow circles */}
      <circle cx="15.5" cy="10.6" r="1.2" strokeWidth={strokeWidth} />
      <circle cx="17.5" cy="11.9" r="1.2" strokeWidth={strokeWidth} />
      <circle cx="15.5" cy="13.2" r="1.2" strokeWidth={strokeWidth} />
      <circle cx="13.9" cy="11.9" r="1.2" strokeWidth={strokeWidth} />
    </svg>
  );
};

export default GameControllerNeo;
