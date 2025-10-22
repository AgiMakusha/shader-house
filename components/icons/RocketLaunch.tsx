import React from 'react';

interface RocketLaunchProps {
  className?: string;
  title?: string;
  tone?: "primary" | "secondary";
}

const RocketLaunch: React.FC<RocketLaunchProps> = ({ 
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
      
      {/* Rocket body */}
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      
      {/* Rocket nose */}
      <path d="M9 12H4s.5-3 3-3" />
      
      {/* Secondary accent - stars */}
      <g className={tone === "secondary" ? "opacity-70 icon-secondary-ink" : "opacity-70"}>
        <path d="M2 2l2 2" strokeWidth={1} />
        <path d="M20 2l-2 2" strokeWidth={1} />
        <path d="M11 2l1 1" strokeWidth={1} />
        <circle cx="8" cy="6" r="0.5" fill="currentColor" />
        <circle cx="16" cy="4" r="0.5" fill="currentColor" />
      </g>
    </svg>
  );
};

export default RocketLaunch;
