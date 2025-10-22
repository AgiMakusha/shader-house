import { cn } from "@/lib/utils";

interface PixelHouseIconProps {
  className?: string;
  size?: number;
}

export default function PixelHouseIcon({ className, size = 64 }: PixelHouseIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={cn("pixelized w-full h-full", className)}
      aria-hidden="true"
      style={{
        filter: `
          drop-shadow(0 0 4px rgba(100, 200, 100, 0.6))
          drop-shadow(0 0 8px rgba(147, 197, 253, 0.4))
          drop-shadow(0 0 12px rgba(255, 255, 255, 0.2))
        `,
      }}
    >
      {/* House base - chunky squares */}
      <rect x="8" y="32" width="48" height="24" fill="currentColor" />
      
      {/* House roof - triangular shape made of squares */}
      <rect x="16" y="24" width="8" height="8" fill="currentColor" />
      <rect x="24" y="16" width="8" height="8" fill="currentColor" />
      <rect x="32" y="8" width="8" height="8" fill="currentColor" />
      <rect x="40" y="16" width="8" height="8" fill="currentColor" />
      <rect x="48" y="24" width="8" height="8" fill="currentColor" />
      
      {/* Door */}
      <rect x="28" y="40" width="8" height="16" fill="currentColor" />
      
      {/* Windows */}
      <rect x="16" y="40" width="8" height="8" fill="currentColor" />
      <rect x="40" y="40" width="8" height="8" fill="currentColor" />
      
      {/* Chimney */}
      <rect x="44" y="8" width="4" height="12" fill="currentColor" />
      
      {/* Pixel grid effect - subtle overlay */}
      <defs>
        <pattern id="pixelGrid" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
        </pattern>
      </defs>
      <rect width="64" height="64" fill="url(#pixelGrid)" />
    </svg>
  );
}