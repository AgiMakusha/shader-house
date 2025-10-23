export default function ForestBg() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
    >
      {/* Main magical forest scene background - much brighter */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/magical-forest-bg.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 1, // Full visibility
        }}
      />
      
      {/* Very light overlay for subtle depth only */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          background: `
            radial-gradient(ellipse 120% 120% at 50% 50%, transparent 0%, transparent 60%, rgba(0, 0, 0, 0.03) 90%, rgba(0, 0, 0, 0.05) 100%)
          `,
        }}
      />
      
      {/* Magical shimmer animation - more visible */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          background: `
            linear-gradient(
              45deg,
              transparent 20%,
              rgba(150, 250, 150, 0.15) 50%,
              transparent 80%
            )
          `,
          animation: 'magic-shimmer 8s ease-in-out infinite',
        }}
      />
    </div>
  );
}