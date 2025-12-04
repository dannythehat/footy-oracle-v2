import React, { ReactNode, CSSProperties } from 'react';

interface Premium3DCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  hoverScale?: boolean;
  style?: CSSProperties;
}

export default function Premium3DCard({ 
  children, 
  className = '', 
  glowColor = 'purple',
  hoverScale = true,
  style = {}
}: Premium3DCardProps) {
  const glowColors = {
    purple: 'shadow-purple-500/20 hover:shadow-purple-500/40 border-purple-500/30 hover:border-purple-400/60',
    yellow: 'shadow-yellow-500/20 hover:shadow-yellow-500/40 border-yellow-500/30 hover:border-yellow-400/60',
    blue: 'shadow-blue-500/20 hover:shadow-blue-500/40 border-blue-500/30 hover:border-blue-400/60',
    green: 'shadow-green-500/20 hover:shadow-green-500/40 border-green-500/30 hover:border-green-400/60',
  };

  return (
    <div 
      className={`
        group relative
        rounded-2xl
        bg-gradient-to-br from-zinc-900/90 via-black to-zinc-950/90
        backdrop-blur-xl
        border ${glowColors[glowColor as keyof typeof glowColors] || glowColors.purple}
        shadow-2xl
        transition-all duration-500 ease-out
        ${hoverScale ? 'hover:scale-[1.02] hover:-translate-y-2' : ''}
        transform-gpu
        perspective-1000
        ${className}
      `}
      style={{
        transformStyle: 'preserve-3d',
        ...style
      }}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Glow effect */}
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
      
      {/* Glass reflection */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
        style={{ transform: 'translateZ(1px)' }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
