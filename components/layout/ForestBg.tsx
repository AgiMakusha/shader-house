export default function ForestBg() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-20"
    >
      {/* Layer 1: Sunlight bloom */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 20% 20%, rgba(250, 255, 210, 0.12), transparent 70%),
            radial-gradient(ellipse 40% 30% at 15% 15%, rgba(255, 248, 200, 0.08), transparent 60%)
          `,
        }}
      />
      
      {/* Layer 2: Deep forest gradient */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background: `
            linear-gradient(135deg, rgba(20, 40, 20, 0.9) 0%, rgba(15, 35, 15, 0.95) 50%, rgba(10, 25, 10, 0.98) 100%),
            linear-gradient(45deg, rgba(25, 50, 25, 0.7) 0%, rgba(30, 60, 30, 0.5) 100%)
          `,
        }}
      />
      
      {/* Layer 3: Tree silhouettes */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            linear-gradient(90deg, transparent 0%, rgba(10, 20, 10, 0.3) 20%, transparent 40%, rgba(15, 25, 15, 0.2) 60%, transparent 80%),
            linear-gradient(180deg, transparent 0%, rgba(8, 18, 8, 0.4) 30%, transparent 70%)
          `,
        }}
      />
      
      {/* Layer 4: Vignette */}
      <div className="absolute inset-0 vignette" />
      
      {/* Layer 5: Pixel grid overlay */}
      <div
        className="absolute inset-0 opacity-5 pixelized"
        style={{
          background: `
            repeating-linear-gradient(
              0deg,
              transparent 0px,
              rgba(255, 255, 255, 0.1) 1px,
              transparent 2px,
              transparent 8px
            ),
            repeating-linear-gradient(
              90deg,
              transparent 0px,
              rgba(255, 255, 255, 0.1) 1px,
              transparent 2px,
              transparent 8px
            )
          `,
          backgroundSize: '8px 8px',
        }}
      />
      
      {/* Layer 6: Subtle noise texture */}
      <div
        className="absolute inset-0 opacity-10 pixelized"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '64px 64px',
        }}
      />
    </div>
  );
}