import * as React from "react";

type Props = {
  className?: string;
  title?: string;
  strokeWidth?: number; // default 1.8 to match wrench weight
};

export default function GameController({
  className,
  title,
  strokeWidth = 1.8,
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
      {/* Outer body: rounded rectangle (precise, symmetric).
          SIZE: 19x12 at (2.5,6); CORNERS: 4; matches wrench presence.
          All strokes non-scaling for crispness at any size. */}
      <rect
        x="2.5"
        y="6"
        width="19"
        height="12"
        rx="4"
        ry="4"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
      {/* D-pad (left): simple plus, centered at (8,12) */}
      <line
        x1="8"
        y1="10"
        x2="8"
        y2="14"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1="6"
        y1="12"
        x2="10"
        y2="12"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
      {/* Face buttons (right): four hollow circles in a diamond */}
      <circle
        cx="16"
        cy="10.5"
        r="1.6"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx="18"
        cy="12"
        r="1.6"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx="16"
        cy="13.5"
        r="1.6"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx="14.5"
        cy="12"
        r="1.6"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}