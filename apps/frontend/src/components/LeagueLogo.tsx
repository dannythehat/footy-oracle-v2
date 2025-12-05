import React, { useState } from 'react';

interface LeagueLogoProps {
  leagueId?: number;
  leagueName: string;
  logoUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 'w-4 h-4 text-[8px]',
  md: 'w-5 h-5 text-[9px]',
  lg: 'w-6 h-6 text-[10px]',
};

export const LeagueLogo: React.FC<LeagueLogoProps> = ({
  leagueId,
  leagueName,
  logoUrl,
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Generate initials from league name
  const getInitials = (name: string): string => {
    // Remove common words
    const cleanName = name
      .replace(/\b(League|Cup|Championship|Trophy|Tournament)\b/gi, '')
      .trim();
    
    const words = cleanName.split(' ').filter(word => word.length > 0);
    
    if (words.length === 0) {
      // Fallback to original name
      return name.substring(0, 2).toUpperCase();
    }
    
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    
    return words
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const initials = getInitials(leagueName);

  // Try to construct logo URL if not provided
  const getLogoUrl = (): string | null => {
    if (logoUrl) return logoUrl;
    if (leagueId) {
      // API-Football logo URL format
      return `https://media.api-sports.io/football/leagues/${leagueId}.png`;
    }
    return null;
  };

  const finalLogoUrl = getLogoUrl();

  // Show initials if no logo URL or image failed to load
  if (!finalLogoUrl || imageError) {
    return (
      <div
        className={`${SIZES[size]} ${className} flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700 rounded border border-blue-500 flex-shrink-0`}
        title={leagueName}
      >
        <span className="font-bold text-white">{initials}</span>
      </div>
    );
  }

  return (
    <div className={`${SIZES[size]} ${className} relative flex-shrink-0`} title={leagueName}>
      {/* Loading placeholder */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700 rounded border border-blue-500 animate-pulse">
          <span className={`font-bold text-white ${size === 'sm' ? 'text-[8px]' : size === 'md' ? 'text-[9px]' : 'text-[10px]'}`}>
            {initials}
          </span>
        </div>
      )}
      
      {/* Actual logo */}
      <img
        src={finalLogoUrl}
        alt={leagueName}
        className={`w-full h-full object-contain ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
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
