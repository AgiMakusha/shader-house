export default function ForestBg() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
    >
      {/* Main magical forest scene background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/magical-forest-bg.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.9, // Make forest more visible
        }}
      />
      
      {/* Subtle overlay for depth */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `
            radial-gradient(ellipse 100% 100% at 50% 50%, transparent 0%, transparent 50%, rgba(0, 0, 0, 0.05) 80%, rgba(0, 0, 0, 0.1) 100%)
          `,
        }}
      />
      
      {/* Magical shimmer animation */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `
            linear-gradient(
              45deg,
              transparent 30%,
              rgba(150, 200, 150, 0.1) 50%,
              transparent 70%
            )
          `,
          animation: 'magic-shimmer 8s ease-in-out infinite',
        }}
      />
    </div>
  );
}