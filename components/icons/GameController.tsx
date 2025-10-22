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

      {/* ORGANIC OUTER OUTLINE — open path (no fill), shaped like the reference */}
      <path
        d="
          M 4.0 15.6
          C 3.2 13.9, 3.5 11.0, 6.3 10.1
          C 9.1 9.2, 11.7 9.9, 12.0 9.9
          C 12.3 9.9, 14.9 9.2, 17.7 10.1
          C 20.5 11.0, 20.8 13.9, 20.0 15.6
          C 18.9 18.2, 16.0 18.2, 13.6 16.9
          C 12.7 16.4, 11.3 16.4, 10.4 16.9
          C 8.0 18.2, 5.1 18.2, 4.0 15.6
        "
        strokeWidth={ICON_STROKE}
        vectorEffect="non-scaling-stroke"
      />

      {/* D-PAD (rounded plus) */}
      <line x1="8.0" y1="10.4" x2="8.0" y2="13.6" strokeWidth={ICON_STROKE} vectorEffect="non-scaling-stroke" />
      <line x1="6.4" y1="12.0" x2="9.6" y2="12.0" strokeWidth={ICON_STROKE} vectorEffect="non-scaling-stroke" />

      {/* FOUR HOLLOW BUTTONS (diamond layout) */}
      <circle cx="16.3" cy="10.7" r="1.25" strokeWidth={ICON_STROKE} vectorEffect="non-scaling-stroke" />
      <circle cx="18.1" cy="11.9" r="1.25" strokeWidth={ICON_STROKE} vectorEffect="non-scaling-stroke" />
      <circle cx="16.3" cy="13.1" r="1.25" strokeWidth={ICON_STROKE} vectorEffect="non-scaling-stroke" />
      <circle cx="14.7" cy="11.9" r="1.25" strokeWidth={ICON_STROKE} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}