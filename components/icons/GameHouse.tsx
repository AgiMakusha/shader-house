import React from 'react';
import { ICON_STROKE, ICON_CAP, ICON_JOIN, ICON_MITER } from './spec';

interface GameHouseProps {
  className?: string;
  title?: string;
}

const GameHouse: React.FC<GameHouseProps> = ({ 
  className, 
  title
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap={ICON_CAP}
      strokeLinejoin={ICON_JOIN}
      strokeMiterlimit={ICON_MITER}
      className={className}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      
      {/* Triangle roof + square body */}
      <path 
        d="M3 9.5l9-7 9 7v11.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z" 
        strokeWidth={ICON_STROKE}
        vectorEffect="non-scaling-stroke"
      />
      
      {/* Small centered door */}
      <rect 
        x="10.5" 
        y="16" 
        width="3" 
        height="6" 
        rx="0.5" 
        fill="none" 
        strokeWidth={ICON_STROKE}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

export default GameHouse;