import * as React from "react";

type Props = {
  className?: string;
  title?: string;
  strokeWidth?: number; // default 1.9 to match wrench weight
};

export default function GameController({
  className,
  title,
  strokeWidth = 1.9,
}: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={1}
      className={className}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <g transform="translate(0,-0.25)">
        {/* Outer body: rounded rectangle (bigger, more mechanical).
            SIZE: 20x13 at (2,5.5); CORNERS: 3.25; increased optical mass.
            All strokes non-scaling for crispness at any size. */}
        <rect
          x="2"
          y="5.5"
          width="20"
          height="13"
          rx="3.25"
          ry="3.25"
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
        {/* D-pad (left): simple plus, centered at (8,12) */}
        <line
          x1="8"
          y1="9.8"
          x2="8"
          y2="14.2"
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1="5.8"
          y1="12"
          x2="10.2"
          y2="12"
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
        {/* Face buttons (right): four hollow circles in a diamond - slightly larger */}
        <circle
          cx="16.2"
          cy="10.3"
          r="1.7"
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx="18.2"
          cy="12"
          r="1.7"
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx="16.2"
          cy="13.7"
          r="1.7"
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx="14.6"
          cy="12"
          r="1.7"
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  );
}