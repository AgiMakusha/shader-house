import React from 'react';
import { ICON_STROKE, ICON_CAP, ICON_JOIN, ICON_MITER } from './spec';

interface AvatarIconProps {
  className?: string;
  title?: string;
}

const AvatarIcon: React.FC<AvatarIconProps> = ({ 
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
      
      {/* Head - stylized gaming helmet/visor */}
      <path 
        d="M 12.0 5.0
           C 9.0 5.0, 6.5 7.5, 6.5 10.5
           C 6.5 11.8, 7.0 13.0, 7.8 13.8
           C 8.5 14.5, 9.4 15.0, 10.4 15.2
           C 11.2 15.3, 12.0 15.3, 12.8 15.2
           C 13.8 15.0, 14.7 14.5, 15.4 13.8
           C 16.2 13.0, 16.7 11.8, 16.7 10.5
           C 16.7 7.5, 14.2 5.0, 11.2 5.0
           Z"
        strokeWidth={ICON_STROKE}
        vectorEffect="non-scaling-stroke"
      />
      
      {/* Visor/face detail - gaming style shield */}
      <path 
        d="M 9.0 9.5
           C 9.0 8.8, 9.5 8.3, 10.2 8.3
           C 10.9 8.3, 11.4 8.8, 11.4 9.5
           C 11.4 10.0, 11.1 10.4, 10.7 10.6
           C 10.3 10.8, 9.9 10.8, 9.5 10.6
           C 9.1 10.4, 8.8 10.0, 8.8 9.5
           Z"
        strokeWidth={ICON_STROKE}
        vectorEffect="non-scaling-stroke"
      />
      
      {/* Body/Torso - stylized armor */}
      <path 
        d="M 12.0 15.5
           C 10.8 15.5, 9.7 16.0, 9.0 16.8
           C 8.4 17.5, 8.1 18.4, 8.2 19.2
           C 8.3 19.9, 8.7 20.5, 9.3 20.8
           C 9.9 21.1, 10.6 21.2, 11.3 21.1
           C 12.0 21.0, 12.7 20.7, 13.2 20.1
           C 13.7 19.5, 13.9 18.8, 13.8 18.0
           C 13.7 17.2, 13.3 16.5, 12.6 15.9
           C 11.9 15.3, 11.0 15.0, 10.1 15.0
           Z"
        strokeWidth={ICON_STROKE}
        vectorEffect="non-scaling-stroke"
      />
      
      {/* Left shoulder pad - gaming armor detail */}
      <path 
        d="M 6.0 12.0
           L 5.0 13.5
           L 6.0 14.5
           L 7.2 13.8
           L 7.0 12.5
           Z"
        strokeWidth={ICON_STROKE}
        vectorEffect="non-scaling-stroke"
      />
      
      {/* Right shoulder pad - gaming armor detail */}
      <path 
        d="M 18.0 12.0
           L 19.0 13.5
           L 18.0 14.5
           L 16.8 13.8
           L 17.0 12.5
           Z"
        strokeWidth={ICON_STROKE}
        vectorEffect="non-scaling-stroke"
      />
      
      {/* Decorative line on helmet - gaming aesthetic */}
      <line 
        x1="8.5" 
        y1="7.5" 
        x2="15.5" 
        y2="7.5" 
        strokeWidth={ICON_STROKE} 
        vectorEffect="non-scaling-stroke"
      />
      
      {/* Small accent dots - tech/gaming feel */}
      <circle 
        cx="10.0" 
        cy="12.5" 
        r="0.8" 
        strokeWidth={ICON_STROKE} 
        vectorEffect="non-scaling-stroke"
      />
      <circle 
        cx="14.0" 
        cy="12.5" 
        r="0.8" 
        strokeWidth={ICON_STROKE} 
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

export default AvatarIcon;

