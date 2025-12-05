import { useState, useEffect } from 'react';

const FAVORITE_LEAGUES_KEY = 'footy_oracle_favorite_leagues';

export interface FavoriteLeague {
  leagueName: string;
  country?: string;
  addedAt: string;
}

export const useFavoriteLeagues = () => {
  const [favoriteLeagues, setFavoriteLeagues] = useState<FavoriteLeague[]>([]);

  // Load favorite leagues from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(FAVORITE_LEAGUES_KEY);
    if (stored) {
      try {
        setFavoriteLeagues(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse favorite leagues:', error);
        localStorage.removeItem(FAVORITE_LEAGUES_KEY);
      }
    }
  }, []);

  // Save favorite leagues to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(FAVORITE_LEAGUES_KEY, JSON.stringify(favoriteLeagues));
  }, [favoriteLeagues]);

  const addFavoriteLeague = (league: Omit<FavoriteLeague, 'addedAt'>) => {
    const newFavorite: FavoriteLeague = {
      ...league,
      addedAt: new Date().toISOString(),
    };
    setFavoriteLeagues((prev) => {
      // Prevent duplicates
      if (prev.some((f) => f.leagueName === league.leagueName)) {
        return prev;
      }
      return [...prev, newFavorite];
    });
  };

  const removeFavoriteLeague = (leagueName: string) => {
    setFavoriteLeagues((prev) => prev.filter((f) => f.leagueName !== leagueName));
  };

  const isFavoriteLeague = (leagueName: string): boolean => {
    return favoriteLeagues.some((f) => f.leagueName === leagueName);
  };

  const toggleFavoriteLeague = (league: Omit<FavoriteLeague, 'addedAt'>) => {
    if (isFavoriteLeague(league.leagueName)) {
      removeFavoriteLeague(league.leagueName);
    } else {
      addFavoriteLeague(league);
    }
  };

  const clearFavoriteLeagues = () => {
    setFavoriteLeagues([]);
    localStorage.removeItem(FAVORITE_LEAGUES_KEY);
  };

  return {
    favoriteLeagues,
    addFavoriteLeague,
    removeFavoriteLeague,
    isFavoriteLeague,
    toggleFavoriteLeague,
    clearFavoriteLeagues,
  };
};
