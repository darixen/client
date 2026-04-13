// components/auth/BackgroundHud.tsx
export const BackgroundHud = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    {/* High-Density Grid */}
    <div 
      className="absolute inset-0 opacity-[0.03]" 
      style={{ 
        backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
        backgroundSize: '40px 40px' 
      }} 
    />
    
    {/* Scanline Animation */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent h-full w-full animate-scanline" />

    {/* Responsive Radial Glow - Mobile Aware */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] md:w-[600px] h-[90vw] md:h-[600px] bg-blue-900/10 rounded-full blur-[80px] md:blur-[120px]" />
  </div>
);