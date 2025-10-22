import * as React from "react";
import { ICON_STROKE, ICON_CAP, ICON_JOIN, ICON_MITER } from './spec';

type Props = {
  className?: string;
  title?: string;
};

export default function GameController({
  className,
  title,
}: Props) {
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
      <g transform="translate(0,-0.25)">
        {/* Outer body: larger, more balanced controller body.
            SIZE: 21x14 at (1.5,5); CORNERS: 3.5; increased optical mass and better proportions.
            All strokes non-scaling for crispness at any size. */}
        <rect
          x="1.5"
          y="5"
          width="21"
          height="14"
          rx="3.5"
          ry="3.5"
          strokeWidth={ICON_STROKE}
          vectorEffect="non-scaling-stroke"
        />
        {/* D-pad (left): simple plus, centered at (8,12) - slightly larger */}
        <line
          x1="8"
          y1="9.5"
          x2="8"
          y2="14.5"
          strokeWidth={ICON_STROKE}
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1="5.5"
          y1="12"
          x2="10.5"
          y2="12"
          strokeWidth={ICON_STROKE}
          vectorEffect="non-scaling-stroke"
        />
        {/* Face buttons (right): four hollow circles in a diamond - larger and better spaced */}
        <circle
          cx="16.5"
          cy="10"
          r="2"
          strokeWidth={ICON_STROKE}
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx="18.5"
          cy="12"
          r="2"
          strokeWidth={ICON_STROKE}
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx="16.5"
          cy="14"
          r="2"
          strokeWidth={ICON_STROKE}
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx="14.5"
          cy="12"
          r="2"
          strokeWidth={ICON_STROKE}
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  );
}