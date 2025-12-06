import React from 'react';

interface FootballPitchGraphicProps {
  homeTeam?: string;
  awayTeam?: string;
  possession?: { home: number; away: number };
  isLive?: boolean;
}

export default function FootballPitchGraphic({ 
  homeTeam = 'Home', 
  awayTeam = 'Away',
  possession,
  isLive = true 
}: FootballPitchGraphicProps) {
  const homePossession = possession?.home || 50;
  const awayPossession = possession?.away || 50;

  return (
    <div className="relative w-full h-64 bg-gradient-to-b from-gray-900 to-black rounded-lg overflow-hidden">
      {/* Live Indicator */}
      {isLive && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-red-600/90 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-white text-xs font-bold">LIVE</span>
        </div>
      )}

      {/* SVG Football Pitch */}
      <svg
        viewBox="0 0 600 400"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Definitions for gradients and patterns */}
        <defs>
          {/* Grass gradient */}
          <linearGradient id="grassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a4d2e" />
            <stop offset="50%" stopColor="#2d5f3f" />
            <stop offset="100%" stopColor="#1a4d2e" />
          </linearGradient>

          {/* Stripe pattern */}
          <pattern id="stripes" x="0" y="0" width="60" height="400" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="30" height="400" fill="#1a4d2e" fillOpacity="0.3" />
            <rect x="30" y="0" width="30" height="400" fill="#2d5f3f" fillOpacity="0.3" />
          </pattern>

          {/* Possession glow - Home */}
          <radialGradient id="homeGlow" cx="15%" cy="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>

          {/* Possession glow - Away */}
          <radialGradient id="awayGlow" cx="85%" cy="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Grass base */}
        <rect x="0" y="0" width="600" height="400" fill="url(#grassGradient)" />
        
        {/* Grass stripes */}
        <rect x="0" y="0" width="600" height="400" fill="url(#stripes)" />

        {/* Possession zones with animation */}
        {homePossession > 50 && (
          <rect 
            x="0" 
            y="0" 
            width={`${homePossession * 6}px`} 
            height="400" 
            fill="url(#homeGlow)"
            className="animate-pulse"
            style={{ animationDuration: '3s' }}
          />
        )}
        
        {awayPossession > 50 && (
          <rect 
            x={`${600 - (awayPossession * 6)}px`}
            y="0" 
            width={`${awayPossession * 6}px`} 
            height="400" 
            fill="url(#awayGlow)"
            className="animate-pulse"
            style={{ animationDuration: '3s' }}
          />
        )}

        {/* Outer boundary */}
        <rect
          x="30"
          y="30"
          width="540"
          height="340"
          fill="none"
          stroke="white"
          strokeWidth="2"
          opacity="0.8"
        />

        {/* Center line */}
        <line
          x1="300"
          y1="30"
          x2="300"
          y2="370"
          stroke="white"
          strokeWidth="2"
          opacity="0.8"
        />

        {/* Center circle */}
        <circle
          cx="300"
          cy="200"
          r="50"
          fill="none"
          stroke="white"
          strokeWidth="2"
          opacity="0.8"
        />

        {/* Center spot */}
        <circle cx="300" cy="200" r="3" fill="white" opacity="0.8" />

        {/* Left penalty area */}
        <rect
          x="30"
          y="120"
          width="90"
          height="160"
          fill="none"
          stroke="white"
          strokeWidth="2"
          opacity="0.8"
        />

        {/* Left goal area */}
        <rect
          x="30"
          y="160"
          width="40"
          height="80"
          fill="none"
          stroke="white"
          strokeWidth="2"
          opacity="0.8"
        />

        {/* Left penalty spot */}
        <circle cx="95" cy="200" r="3" fill="white" opacity="0.8" />

        {/* Right penalty area */}
        <rect
          x="480"
          y="120"
          width="90"
          height="160"
          fill="none"
          stroke="white"
          strokeWidth="2"
          opacity="0.8"
        />

        {/* Right goal area */}
        <rect
          x="530"
          y="160"
          width="40"
          height="80"
          fill="none"
          stroke="white"
          strokeWidth="2"
          opacity="0.8"
        />

        {/* Right penalty spot */}
        <circle cx="505" cy="200" r="3" fill="white" opacity="0.8" />

        {/* Corner arcs */}
        <path d="M 30 30 Q 40 30 40 40" fill="none" stroke="white" strokeWidth="2" opacity="0.8" />
        <path d="M 570 30 Q 560 30 560 40" fill="none" stroke="white" strokeWidth="2" opacity="0.8" />
        <path d="M 30 370 Q 40 370 40 360" fill="none" stroke="white" strokeWidth="2" opacity="0.8" />
        <path d="M 570 370 Q 560 370 560 360" fill="none" stroke="white" strokeWidth="2" opacity="0.8" />

        {/* Animated ball */}
        <g className="animate-ball">
          <circle cx="300" cy="200" r="8" fill="white" opacity="0.9">
            <animate
              attributeName="cx"
              values="150;450;150"
              dur="8s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values="200;150;250;200"
              dur="8s"
              repeatCount="indefinite"
            />
          </circle>
          {/* Ball shadow */}
          <ellipse cx="300" cy="210" rx="6" ry="2" fill="black" opacity="0.3">
            <animate
              attributeName="cx"
              values="150;450;150"
              dur="8s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values="210;160;260;210"
              dur="8s"
              repeatCount="indefinite"
            />
          </ellipse>
        </g>
      </svg>

      {/* Possession Stats Overlay */}
      {possession && (
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-6">
          {/* Home Possession */}
          <div className="bg-blue-600/80 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            <div className="text-white text-xs font-bold">{homeTeam}</div>
            <div className="text-white text-lg font-bold">{homePossession}%</div>
          </div>

          {/* Possession Label */}
          <div className="bg-gray-900/80 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-gray-300 text-xs font-medium">POSSESSION</span>
          </div>

          {/* Away Possession */}
          <div className="bg-red-600/80 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            <div className="text-white text-xs font-bold text-right">{awayTeam}</div>
            <div className="text-white text-lg font-bold">{awayPossession}%</div>
          </div>
        </div>
      )}

      {/* Match Status Text */}
      {!possession && (
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <div className="bg-gray-900/80 backdrop-blur-sm inline-block px-4 py-2 rounded-lg">
            <p className="text-gray-300 text-sm font-medium">Match in Progress</p>
            <p className="text-gray-500 text-xs mt-1">Statistics will appear shortly</p>
          </div>
        </div>
      )}
    </div>
  );
}
