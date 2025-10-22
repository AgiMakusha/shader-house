import React from 'react';

interface UploadCloudProps {
  className?: string;
  title?: string;
  tone?: "primary" | "secondary";
}

const UploadCloud: React.FC<UploadCloudProps> = ({ 
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
      
      {/* Cloud */}
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
      
      {/* Upload arrow */}
      <path d="M12 6v8" />
      <path d="M8 10l4-4 4 4" />
      
      {/* Secondary accent - cloud details */}
      <g className="icon-secondary-ink" style={{ opacity: 0.65 }}>
        <circle cx="8" cy="12" r="0.5" fill="currentColor" />
        <circle cx="16" cy="12" r="0.5" fill="currentColor" />
        <circle cx="12" cy="8" r="0.3" fill="currentColor" />
      </g>
    </svg>
  );
};

export default UploadCloud;