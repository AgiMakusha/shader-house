export default function ForestBg() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-20"
    >
      {/* Layer 1: Magical forest clearing gradient */}
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 40%, rgba(45, 70, 45, 0.3) 0%, rgba(25, 50, 25, 0.7) 40%, rgba(15, 35, 15, 0.9) 100%),
            linear-gradient(135deg, rgba(20, 40, 20, 0.8) 0%, rgba(15, 35, 15, 0.9) 50%, rgba(10, 25, 10, 0.95) 100%)
          `,
        }}
      />
      
      {/* Layer 2: Sunlight filtering through trees */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          background: `
            radial-gradient(ellipse 40% 30% at 30% 20%, rgba(250, 255, 210, 0.15), transparent 60%),
            radial-gradient(ellipse 30% 20% at 70% 30%, rgba(255, 248, 200, 0.1), transparent 50%),
            linear-gradient(45deg, transparent 0%, rgba(200, 255, 200, 0.05) 50%, transparent 100%)
          `,
        }}
      />
      
      {/* Layer 3: Tree silhouettes and depth */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background: `
            linear-gradient(90deg, rgba(8, 18, 8, 0.4) 0%, transparent 15%, rgba(12, 22, 12, 0.3) 30%, transparent 45%, rgba(10, 20, 10, 0.4) 60%, transparent 75%, rgba(8, 18, 8, 0.3) 100%),
            linear-gradient(180deg, transparent 0%, rgba(6, 16, 6, 0.3) 20%, transparent 40%, rgba(8, 18, 8, 0.2) 60%, transparent 80%)
          `,
        }}
      />
      
      {/* Layer 4: Magical clearing path */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `
            linear-gradient(180deg, transparent 0%, rgba(60, 80, 60, 0.1) 30%, rgba(80, 100, 80, 0.15) 50%, rgba(60, 80, 60, 0.1) 70%, transparent 100%),
            radial-gradient(ellipse 20% 80% at 50% 50%, rgba(70, 90, 70, 0.1), transparent 60%)
          `,
        }}
      />
      
      {/* Layer 5: Pixelated house silhouette */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='pixel' patternUnits='userSpaceOnUse' width='4' height='4'%3E%3Crect width='4' height='4' fill='rgba(120,140,120,0.3)'/%3E%3C/pattern%3E%3C/defs%3E%3Cg transform='translate(50,80) scale(0.8)'%3E%3C!-- House base --%3E%3Crect x='20' y='40' width='60' height='50' fill='url(%23pixel)' stroke='rgba(100,120,100,0.4)' stroke-width='1'/%3E%3C!-- Roof --%3E%3Cpolygon points='10,40 50,10 90,40' fill='url(%23pixel)' stroke='rgba(80,100,80,0.4)' stroke-width='1'/%3E%3C!-- Door --%3E%3Crect x='45' y='65' width='10' height='25' fill='rgba(60,80,60,0.5)'/%3E%3C!-- Window --%3E%3Crect x='35' y='50' width='8' height='8' fill='rgba(200,220,200,0.3)'/%3E%3Crect x='57' y='50' width='8' height='8' fill='rgba(200,220,200,0.3)'/%3E%3C!-- Chimney --%3E%3Crect x='65' y='25' width='8' height='15' fill='url(%23pixel)' stroke='rgba(80,100,80,0.4)' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '300px 300px',
          backgroundPosition: 'center 60%',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Layer 6: Atmospheric vignette */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          background: `
            radial-gradient(ellipse 100% 100% at 50% 50%, transparent 0%, transparent 40%, rgba(0, 0, 0, 0.1) 70%, rgba(0, 0, 0, 0.3) 100%)
          `,
        }}
      />
      
      {/* Layer 7: Subtle pixel grid for texture */}
      <div
        className="absolute inset-0 opacity-3 pixelized"
        style={{
          background: `
            repeating-linear-gradient(
              0deg,
              transparent 0px,
              rgba(255, 255, 255, 0.05) 1px,
              transparent 2px,
              transparent 6px
            ),
            repeating-linear-gradient(
              90deg,
              transparent 0px,
              rgba(255, 255, 255, 0.05) 1px,
              transparent 2px,
              transparent 6px
            )
          `,
          backgroundSize: '6px 6px',
        }}
      />
      
      {/* Layer 8: Magical shimmer */}
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