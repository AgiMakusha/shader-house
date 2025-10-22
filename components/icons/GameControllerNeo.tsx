import React from 'react';

interface GameControllerNeoProps {
  className?: string;
  title?: string;
  strokeWidth?: number;
}

const GameControllerNeo: React.FC<GameControllerNeoProps> = ({ 
  className = "", 
  title,
  strokeWidth = 1.8
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
      
      <g transform="translate(0,-0.25)">
        {/* Outer body: rounded rectangle for clean proportion & symmetry */}
        <rect 
          x="2.5" 
          y="6" 
          width="19" 
          height="12" 
          rx="4" 
          ry="4" 
          strokeWidth={strokeWidth} 
        />
        
        {/* D-pad (left): plus sized to read at card scale */}
        <line x1="8" y1="10" x2="8" y2="14" strokeWidth={strokeWidth} />
        <line x1="6" y1="12" x2="10" y2="12" strokeWidth={strokeWidth} />
        
        {/* Face buttons (right): diamond of four circles */}
        <circle cx="16" cy="10.5" r="1.6" strokeWidth={strokeWidth} />
        <circle cx="18" cy="12.0" r="1.6" strokeWidth={strokeWidth} />
        <circle cx="16" cy="13.5" r="1.6" strokeWidth={strokeWidth} />
        <circle cx="14.5" cy="12.0" r="1.6" strokeWidth={strokeWidth} />
      </g>
    </svg>
  );
};

export default GameControllerNeo;
