import React, { useState } from 'react';

interface TeamLogoProps {
  teamId?: number;
  teamName: string;
  logoUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 'w-5 h-5 text-[8px]',
  md: 'w-6 h-6 text-[10px]',
  lg: 'w-8 h-8 text-xs',
};

export const TeamLogo: React.FC<TeamLogoProps> = ({
  teamId,
  teamName,
  logoUrl,
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Generate initials from team name
  const getInitials = (name: string): string => {
    const words = name.split(' ').filter(word => word.length > 0);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return words
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const initials = getInitials(teamName);

  // Try to construct logo URL if not provided
  const getLogoUrl = (): string | null => {
    if (logoUrl) return logoUrl;
    if (teamId) {
      // API-Football logo URL format
      return `https://media.api-sports.io/football/teams/${teamId}.png`;
    }
    return null;
  };

  const finalLogoUrl = getLogoUrl();

  // Show initials if no logo URL or image failed to load
  if (!finalLogoUrl || imageError) {
    return (
      <div
        className={`${SIZES[size]} ${className} flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 rounded-full border border-gray-600 flex-shrink-0`}
        title={teamName}
      >
        <span className="font-bold text-gray-300">{initials}</span>
      </div>
    );
  }

  return (
    <div className={`${SIZES[size]} ${className} relative flex-shrink-0`} title={teamName}>
      {/* Loading placeholder */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 rounded-full border border-gray-600 animate-pulse">
          <span className={`font-bold text-gray-400 ${size === 'sm' ? 'text-[8px]' : size === 'md' ? 'text-[10px]' : 'text-xs'}`}>
            {initials}
          </span>
        </div>
      )}
      
      {/* Actual logo */}
      <img
        src={finalLogoUrl}
        alt={teamName}
        className={`w-full h-full object-contain rounded-full ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          setImageError(true);
          setImageLoaded(false);
        }}
        loading="lazy"
      />
    </div>
  );
};
