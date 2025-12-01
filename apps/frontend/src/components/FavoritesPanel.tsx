import React from 'react';
import { Star, Trash2, Calendar, Trophy } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';

export const FavoritesPanel: React.FC = () => {
  const { favorites, removeFavorite, clearFavorites } = useFavorites();

  if (favorites.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Star className="w-12 h-12 text-gray-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              No Favorites Yet
            </h3>
            <p className="text-sm text-gray-500">
              Star fixtures to quickly access them here
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
          <h3 className="text-lg font-semibold text-white">
            Favorite Fixtures ({favorites.length})
          </h3>
        </div>
        {favorites.length > 0 && (
          <button
            onClick={clearFavorites}
            className="text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Favorites List */}
      <div className="divide-y divide-gray-700">
        {favorites.map((favorite) => (
          <div
            key={favorite.fixtureId}
            className="p-4 hover:bg-gray-750 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Teams */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white font-medium">
                    {favorite.homeTeam}
                  </span>
                  <span className="text-gray-500">vs</span>
                  <span className="text-white font-medium">
                    {favorite.awayTeam}
                  </span>
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    <span>{favorite.league}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(favorite.date)}</span>
                  </div>
                </div>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeFavorite(favorite.fixtureId)}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                title="Remove from favorites"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
