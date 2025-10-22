import React from 'react';

interface LibraryStackProps {
  className?: string;
  title?: string;
  tone?: "primary" | "secondary";
}

const LibraryStack: React.FC<LibraryStackProps> = ({ 
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
      
      {/* Book spines */}
      <rect x="4" y="4" width="4" height="16" rx="1" />
      <rect x="10" y="4" width="4" height="16" rx="1" />
      <rect x="16" y="4" width="4" height="16" rx="1" />
      
      {/* Secondary accent - page lines */}
      <g className="icon-secondary-ink" style={{ opacity: 0.65 }}>
        <line x1="5.5" y1="8" x2="6.5" y2="8" strokeWidth={1} />
        <line x1="5.5" y1="10" x2="6.5" y2="10" strokeWidth={1} />
        <line x1="5.5" y1="12" x2="6.5" y2="12" strokeWidth={1} />
        <line x1="11.5" y1="8" x2="12.5" y2="8" strokeWidth={1} />
        <line x1="11.5" y1="10" x2="12.5" y2="10" strokeWidth={1} />
        <line x1="11.5" y1="12" x2="12.5" y2="12" strokeWidth={1} />
        <line x1="17.5" y1="8" x2="18.5" y2="8" strokeWidth={1} />
        <line x1="17.5" y1="10" x2="18.5" y2="10" strokeWidth={1} />
        <line x1="17.5" y1="12" x2="18.5" y2="12" strokeWidth={1} />
      </g>
    </svg>
  );
};

export default LibraryStack;