import * as React from "react";
import { ICON_STROKE, ICON_CAP, ICON_JOIN, ICON_MITER } from "./spec";

type Props = { className?: string; title?: string };

export default function GameController({ className, title }: Props) {
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

      {/* FLAT 2D BODY: rounded rectangle, no perspective */}
      <rect
        x="3"
        y="6.5"
        width="18"
        height="11"
        rx="3.25"
        ry="3.25"
        strokeWidth={ICON_STROKE}
        vectorEffect="non-scaling-stroke"
      />

      {/* D-PAD: plus, centered on left */}
      <line x1="8" y1="10" x2="8" y2="14" strokeWidth={ICON_STROKE} vectorEffect="non-scaling-stroke" />
      <line x1="6" y1="12" x2="10" y2="12" strokeWidth={ICON_STROKE} vectorEffect="non-scaling-stroke" />

      {/* BUTTONS: four hollow circles in diamond on right */}
      <circle cx="16"   cy="10.5" r="1.3" strokeWidth={ICON_STROKE} vectorEffect="non-scaling-stroke" />
      <circle cx="18"   cy="12.0" r="1.3" strokeWidth={ICON_STROKE} vectorEffect="non-scaling-stroke" />
      <circle cx="16"   cy="13.5" r="1.3" strokeWidth={ICON_STROKE} vectorEffect="non-scaling-stroke" />
      <circle cx="14.5" cy="12.0" r="1.3" strokeWidth={ICON_STROKE} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}