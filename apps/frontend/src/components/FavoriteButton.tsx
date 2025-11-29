import React from 'react';
import { Star } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';

interface FavoriteButtonProps {
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  date: string;
  league: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  fixtureId,
  homeTeam,
  awayTeam,
  date,
  league,
  size = 'md',
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(fixtureId);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite({
      fixtureId,
      homeTeam,
      awayTeam,
      date,
      league,
    });
  };

  return (
    <button
      onClick={handleClick}
      className={`
        transition-all duration-200 hover:scale-110
        ${favorite ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-300'}
      `}
      title={favorite ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Star
        className={sizeClasses[size]}
        fill={favorite ? 'currentColor' : 'none'}
        strokeWidth={2}
      />
    </button>
  );
};
