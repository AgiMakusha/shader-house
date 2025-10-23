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
          backgroundImage: "url('/images/magical-forest-bg.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 1,
          filter: "brightness(1.5) contrast(1.2) saturate(1.3)", // Maximum brightness and vibrancy
        }}
      />
      
      {/* Bright green ambient glow to enhance forest feel */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse at center, rgba(100, 255, 150, 0.15) 0%, transparent 70%)
          `,
        }}
      />
      
      {/* Magical shimmer animation - more visible */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          background: `
            linear-gradient(
              45deg,
              transparent 20%,
              rgba(180, 255, 180, 0.25) 50%,
              transparent 80%
            )
          `,
          animation: 'magic-shimmer 8s ease-in-out infinite',
        }}
      />
    </div>
  );
}