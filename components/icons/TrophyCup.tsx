import React from 'react';

interface TrophyCupProps {
  className?: string;
  title?: string;
}

const TrophyCup: React.FC<TrophyCupProps> = ({ 
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
      
      {/* Trophy cup */}
      <path d="M6 9H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h2" />
      <path d="M18 9h2a2 2 0 0 0 2-2V5c0-1.1-.9-2-2-2h-2" />
      <path d="M4 22h16c1.1 0 2-.9 2-2v-4H2v4c0 1.1.9 2 2 2z" />
      <path d="M10 14.66V17c0 .55.47.98.97 1.21l1.69.7c.52.22 1.05.22 1.57 0l1.69-.7c.5-.23.97-.66.97-1.21v-2.34" />
      
      {/* Trophy handles */}
      <path d="M6 9v6a6 6 0 0 0 6 6h0a6 6 0 0 0 6-6V9" />
    </svg>
  );
};

export default TrophyCup;