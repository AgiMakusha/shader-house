export default function ForestBg() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
    >
      {/* Main magical forest scene background - MAXIMUM BRIGHTNESS */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url('/images/magical-forest-bg.svg?v=${Date.now()}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 1,
          filter: "brightness(1.2) contrast(1.1)", // Extra boost
        }}
      />
      
      {/* NO DARK OVERLAY - completely removed for maximum brightness */}
      
      {/* Magical shimmer animation - more visible */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `
            linear-gradient(
              45deg,
              transparent 20%,
              rgba(180, 255, 180, 0.2) 50%,
              transparent 80%
            )
          `,
          animation: 'magic-shimmer 8s ease-in-out infinite',
        }}
      />
    </div>
  );
}