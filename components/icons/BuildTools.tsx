import React from 'react';
import { ICON_STROKE, ICON_CAP, ICON_JOIN, ICON_MITER } from './spec';

interface BuildToolsProps {
  className?: string;
  title?: string;
}

const BuildTools: React.FC<BuildToolsProps> = ({ 
  className, 
  title
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap={ICON_CAP}
      strokeLinejoin={ICON_JOIN}
      strokeMiterlimit={ICON_MITER}
      className={className}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      
      {/* Single clean wrench: crescent head + straight handle */}
      <path 
        d="M14.5 6.5a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
        strokeWidth={ICON_STROKE}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

export default BuildTools;