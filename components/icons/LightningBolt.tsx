import React from 'react';

interface LightningBoltProps {
  className?: string;
  title?: string;
}

const LightningBolt: React.FC<LightningBoltProps> = ({ 
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
      
      {/* Main lightning bolt */}
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      
      {/* Energy sparks */}
      <g style={{ opacity: 0.65 }}>
        <circle cx="6" cy="8" r="0.5" fill="none" />
        <circle cx="18" cy="16" r="0.5" fill="none" />
        <circle cx="10" cy="4" r="0.3" fill="none" />
        <circle cx="14" cy="20" r="0.3" fill="none" />
        <path d="M5 6l1 1" />
        <path d="M19 18l-1 1" />
      </g>
    </svg>
  );
};

export default LightningBolt;