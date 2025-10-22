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
        {/* Smooth ergonomic controller body with grips and center dip - LARGER */}
        <path 
          d="
            M 4.5 17.5
            C 3.5 15.5, 3.5 10.5, 5.5 9.5
            C 7.5 8.5, 9.5 8.5, 12 8.5
            C 14.5 8.5, 16.5 8.5, 18.5 9.5
            C 20.5 10.5, 20.5 15.5, 19.5 17.5
            C 18.5 19.5, 16.5 19.5, 12 18.5
            C 7.5 19.5, 5.5 19.5, 4.5 17.5
          " 
          strokeWidth={strokeWidth} 
        />
        
        {/* Rounded D-pad (left): pill-shaped segments - LARGER */}
        <rect x="5.5" y="9.5" width="2" height="4" rx="1" strokeWidth={strokeWidth} />
        <rect x="6.5" y="8.5" width="2" height="6" rx="1" strokeWidth={strokeWidth} />
        <rect x="7.5" y="9.5" width="2" height="4" rx="1" strokeWidth={strokeWidth} />
        <rect x="6.5" y="10.5" width="2" height="2" rx="1" strokeWidth={strokeWidth} />
        
        {/* Face buttons (right): four hollow circles in diamond - LARGER */}
        <circle cx="15.5" cy="9.5" r="1.8" strokeWidth={strokeWidth} />
        <circle cx="17.5" cy="11" r="1.8" strokeWidth={strokeWidth} />
        <circle cx="15.5" cy="12.5" r="1.8" strokeWidth={strokeWidth} />
        <circle cx="13.5" cy="11" r="1.8" strokeWidth={strokeWidth} />
      </g>
    </svg>
  );
};

export default GameControllerNeo;
