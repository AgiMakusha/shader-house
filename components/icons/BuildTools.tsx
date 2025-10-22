import React from 'react';

interface BuildToolsProps {
  className?: string;
  title?: string;
}

const BuildTools: React.FC<BuildToolsProps> = ({ 
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
      
      {/* Wrench head with crescent cutout */}
      <path d="M14.5 6.5a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      
      {/* Wrench handle */}
      <path d="M19.5 4v4" />
      
      {/* Socket notch */}
      <line x1="19.5" y1="6" x2="20.5" y2="6" />
    </svg>
  );
};

export default BuildTools;