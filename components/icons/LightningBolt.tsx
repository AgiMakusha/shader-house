import React from 'react';

interface LightningBoltProps {
  className?: string;
  title?: string;
  tone?: "primary" | "secondary";
}

const LightningBolt: React.FC<LightningBoltProps> = ({ 
  className = "", 
  title,
  tone = "primary" 
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
      
      {/* Main lightning bolt */}
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      
      {/* Secondary accent - energy sparks */}
      <g className={tone === "secondary" ? "opacity-70 icon-secondary-ink" : "opacity-70"}>
        <circle cx="6" cy="8" r="0.5" fill="currentColor" />
        <circle cx="18" cy="16" r="0.5" fill="currentColor" />
        <circle cx="10" cy="4" r="0.3" fill="currentColor" />
        <circle cx="14" cy="20" r="0.3" fill="currentColor" />
        <path d="M5 6l1 1" strokeWidth={1} />
        <path d="M19 18l-1 1" strokeWidth={1} />
      </g>
    </svg>
  );
};

export default LightningBolt;
