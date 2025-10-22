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

      {/* Lift the glyph slightly for optical vertical centering */}
      <g transform="translate(0,-0.25)">
        {/* OUTER SILHOUETTE — smooth ergonomic shape (open path, outline only) */}
        <path
          d="
            M 4.5 15.5
            C 3.8 14.0, 3.9 11.0, 6.6 10.1
            C 9.3 9.2, 12.0 10.0, 12.0 10.0
            C 12.0 10.0, 14.7 9.2, 17.4 10.1
            C 20.1 11.0, 20.2 14.0, 19.5 15.5
            C 18.2 18.0, 15.2 18.0, 12.0 16.6
            C 8.8 18.0, 5.8 18.0, 4.5 15.5
          "
          strokeWidth={ICON_STROKE}
          vectorEffect="non-scaling-stroke"
        />

        {/* D-PAD — plus shape (stroke only) */}
        <line x1="8.0" y1="10.5" x2="8.0" y2="13.5" strokeWidth={ICON_STROKE} vectorEffect="non-scaling-stroke" />
        <line x1="6.5" y1="12.0" x2="9.5" y2="12.0" strokeWidth={ICON_STROKE} vectorEffect="non-scaling-stroke" />

        {/* BUTTONS — four hollow circles in a diamond */}
        <circle cx="16.3" cy="10.6" r="1.2" strokeWidth={ICON_STROKE} vectorEffect="non-scaling-stroke" />
        <circle cx="18.0" cy="12.0" r="1.2" strokeWidth={ICON_STROKE} vectorEffect="non-scaling-stroke" />
        <circle cx="16.3" cy="13.4" r="1.2" strokeWidth={ICON_STROKE} vectorEffect="non-scaling-stroke" />
        <circle cx="14.7" cy="12.0" r="1.2" strokeWidth={ICON_STROKE} vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}