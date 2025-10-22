import React from 'react';

interface RocketLaunchProps {
  className?: string;
  title?: string;
}

const RocketLaunch: React.FC<RocketLaunchProps> = ({ 
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
      
      {/* Rocket body */}
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      
      {/* Rocket nose */}
      <path d="M9 12H4s.5-3 3-3" />
      
      {/* Exhaust flames */}
      <g style={{ opacity: 0.65 }}>
        <path d="M15 9v6a3 3 0 0 1-6 0V9" />
        <path d="M12 9l-1-2" />
        <path d="M12 9l1-2" />
      </g>
    </svg>
  );
};

export default RocketLaunch;