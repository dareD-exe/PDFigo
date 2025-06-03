import React from 'react';

const CosmicBackground = () => (
  <div className="fixed inset-0 -z-10 w-full h-full bg-[#0a0d12]">
    {/* Nebula Glow */}
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      <svg width="100%" height="100%" className="absolute inset-0 w-full h-full" style={{ opacity: 0.35 }}>
        <radialGradient id="nebula1" cx="30%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#6d28d9" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0a0d12" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="nebula2" cx="70%" cy="70%" r="50%">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0a0d12" stopOpacity="0" />
        </radialGradient>
        <circle cx="30%" cy="40%" r="600" fill="url(#nebula1)" />
        <circle cx="70%" cy="70%" r="400" fill="url(#nebula2)" />
      </svg>
    </div>
    {/* Starfield */}
    <div className="absolute inset-0 w-full h-full pointer-events-none animate-cosmic-bg">
      <svg width="100%" height="100%" className="absolute inset-0 w-full h-full" style={{ opacity: 0.45 }}>
        {[...Array(220)].map((_, i) => {
          const cx = Math.random() * 1920;
          const cy = Math.random() * 1080;
          const r = Math.random() * 2.2 + 0.8;
          const color = Math.random() > 0.85 ? '#a5b4fc' : '#fff';
          const twinkleDur = (Math.random() * 2 + 1.5).toFixed(2);
          const twinkleDelay = (Math.random() * 3).toFixed(2);
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill={color} opacity={Math.random() * 0.7 + 0.5}>
              <animate attributeName="opacity" values="0.5;1;0.5" dur={`${twinkleDur}s`} repeatCount="indefinite" begin={`${twinkleDelay}s`} />
            </circle>
          );
        })}
      </svg>
    </div>
  </div>
);

export default CosmicBackground; 