import React from 'react';

interface AnalyticsEyeProps {
  className?: string;
  title?: string;
}

const AnalyticsEye: React.FC<AnalyticsEyeProps> = ({ 
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
      
      {/* Almond eye + single pupil dot */}
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" fill="none" />
    </svg>
  );
};

export default AnalyticsEye;