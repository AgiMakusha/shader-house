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
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={1}
      className={className}
      aria-hidden={!title}
    >
      {title && <title>{title}</title>}
      
      {/* Three parallel spine lines with slight vertical offset */}
      <path d="M4 4h4v16H4z" />
      <path d="M10 4h4v16h-4z" />
      <path d="M16 4h4v16h-4z" />
    </svg>
  );
};

export default LibraryStack;