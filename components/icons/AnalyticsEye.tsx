import React from 'react';

interface AnalyticsEyeProps {
  className?: string;
  title?: string;
  tone?: "primary" | "secondary";
}

const AnalyticsEye: React.FC<AnalyticsEyeProps> = ({ 
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
      
      {/* Eye outline */}
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      
      {/* Eye pupil */}
      <circle cx="12" cy="12" r="3" />
      
      {/* Secondary accent - data lines */}
      <g className="icon-secondary-ink" style={{ opacity: 0.65 }}>
        <path d="M4 8l2 2" strokeWidth={1} />
        <path d="M20 8l-2 2" strokeWidth={1} />
        <path d="M4 16l2-2" strokeWidth={1} />
        <path d="M20 16l-2-2" strokeWidth={1} />
      </g>
    </svg>
  );
};

export default AnalyticsEye;