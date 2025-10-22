import React from 'react';

interface UploadCloudProps {
  className?: string;
  title?: string;
}

const UploadCloud: React.FC<UploadCloudProps> = ({ 
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
      
      {/* Compact cloud outline + single up arrow */}
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
      <path d="M12 6v8" />
      <path d="M8 10l4-4 4 4" />
    </svg>
  );
};

export default UploadCloud;