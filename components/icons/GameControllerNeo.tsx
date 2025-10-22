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
        {/* Smooth ergonomic controller body with grips and center dip */}
        <path 
          d="
            M 5.5 16.5
            C 4.5 14.5, 4.5 11.5, 6.5 10.5
            C 8.5 9.5, 10.5 9.5, 12 9.5
            C 13.5 9.5, 15.5 9.5, 17.5 10.5
            C 19.5 11.5, 19.5 14.5, 18.5 16.5
            C 17.5 18.5, 15.5 18.5, 12 17.5
            C 8.5 18.5, 6.5 18.5, 5.5 16.5
          " 
          strokeWidth={strokeWidth} 
        />
        
        {/* Rounded D-pad (left): pill-shaped segments */}
        <rect x="6.5" y="10.5" width="1.5" height="3" rx="0.75" strokeWidth={strokeWidth} />
        <rect x="7.5" y="9.5" width="1.5" height="5" rx="0.75" strokeWidth={strokeWidth} />
        <rect x="8.5" y="10.5" width="1.5" height="3" rx="0.75" strokeWidth={strokeWidth} />
        <rect x="7.5" y="11.5" width="1.5" height="1" rx="0.5" strokeWidth={strokeWidth} />
        
        {/* Face buttons (right): four hollow circles in diamond */}
        <circle cx="15.5" cy="10.5" r="1.4" strokeWidth={strokeWidth} />
        <circle cx="17.5" cy="12" r="1.4" strokeWidth={strokeWidth} />
        <circle cx="15.5" cy="13.5" r="1.4" strokeWidth={strokeWidth} />
        <circle cx="13.5" cy="12" r="1.4" strokeWidth={strokeWidth} />
      </g>
    </svg>
  );
};

export default GameControllerNeo;
