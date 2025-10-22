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
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={!title}
    >
      {title && <title>{title}</title>}
      
      {/* Main wrench */}
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      
      {/* Hammer head */}
      <rect x="18" y="2" width="3" height="2" rx="0.5" fill="currentColor" />
      <path d="M19 4v4" />
      
      {/* Secondary accent - gear */}
      <g className={tone === "secondary" ? "opacity-70 icon-secondary-ink" : "opacity-70"}>
        <circle cx="6" cy="18" r="2" fill="none" stroke="currentColor" strokeWidth={1} />
        <circle cx="6" cy="18" r="0.5" fill="currentColor" />
        <path d="M6 16v1" strokeWidth={1} />
        <path d="M6 19v1" strokeWidth={1} />
        <path d="M4 18h1" strokeWidth={1} />
        <path d="M7 18h1" strokeWidth={1} />
      </g>
    </svg>
  );
};

export default BuildTools;
