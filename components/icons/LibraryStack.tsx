import React from 'react';

interface LibraryStackProps {
  className?: string;
  title?: string;
}

const LibraryStack: React.FC<LibraryStackProps> = ({ 
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
      
      {/* Book spines as strokes */}
      <path d="M4 4h4v16H4z" />
      <path d="M10 4h4v16h-4z" />
      <path d="M16 4h4v16h-4z" />
      
      {/* Page lines */}
      <line x1="5.5" y1="8" x2="6.5" y2="8" />
      <line x1="5.5" y1="10" x2="6.5" y2="10" />
      <line x1="5.5" y1="12" x2="6.5" y2="12" />
      <line x1="11.5" y1="8" x2="12.5" y2="8" />
      <line x1="11.5" y1="10" x2="12.5" y2="10" />
      <line x1="11.5" y1="12" x2="12.5" y2="12" />
      <line x1="17.5" y1="8" x2="18.5" y2="8" />
      <line x1="17.5" y1="10" x2="18.5" y2="10" />
      <line x1="17.5" y1="12" x2="18.5" y2="12" />
    </svg>
  );
};

export default LibraryStack;