import React from 'react';

interface BuildToolsProps {
  className?: string;
  title?: string;
  tone?: "primary" | "secondary";
}

const BuildTools: React.FC<BuildToolsProps> = ({ 
  className = "", 
  title,
  tone = "primary" 
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={!title}
    >
      {title && <title>{title}</title>}
      
      {/* Main wrench body */}
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      
      {/* Secondary accent - screwdriver tip */}
      <g className={tone === "secondary" ? "opacity-70 icon-secondary-ink" : "opacity-70"}>
        <path d="M5 16l5 5" />
        <circle cx="4" cy="17" r="1" fill="currentColor" />
      </g>
      
      {/* Hammer head */}
      <rect x="18" y="2" width="3" height="2" rx="0.5" fill="currentColor" />
      <path d="M19 4v4" />
    </svg>
  );
};

export default BuildTools;
