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
      
      {/* Book stack */}
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      
      {/* Secondary accent - book pages */}
      <g className={tone === "secondary" ? "opacity-70 icon-secondary-ink" : "opacity-70"}>
        <line x1="8" y1="6" x2="18" y2="6" strokeWidth={1.5} />
        <line x1="8" y1="10" x2="16" y2="10" strokeWidth={1.5} />
        <line x1="8" y1="14" x2="18" y2="14" strokeWidth={1.5} />
        <line x1="8" y1="18" x2="14" y2="18" strokeWidth={1.5} />
      </g>
      
      {/* Bookmark */}
      <path d="M16 2v6l2-2 2 2V2" />
    </svg>
  );
};

export default LibraryStack;
