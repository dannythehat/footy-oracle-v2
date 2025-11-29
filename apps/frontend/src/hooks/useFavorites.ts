import { useState, useEffect } from 'react';

const FAVORITES_KEY = 'footy_oracle_favorites';

export interface FavoriteFixture {
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  date: string;
  league: string;
  addedAt: string;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteFixture[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse favorites:', error);
        localStorage.removeItem(FAVORITES_KEY);
      }
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (fixture: Omit<FavoriteFixture, 'addedAt'>) => {
    const newFavorite: FavoriteFixture = {
      ...fixture,
      addedAt: new Date().toISOString(),
    };
    setFavorites((prev) => {
      // Prevent duplicates
      if (prev.some((f) => f.fixtureId === fixture.fixtureId)) {
        return prev;
      }
      return [...prev, newFavorite];
    });
  };

  const removeFavorite = (fixtureId: number) => {
    setFavorites((prev) => prev.filter((f) => f.fixtureId !== fixtureId));
  };

  const isFavorite = (fixtureId: number): boolean => {
    return favorites.some((f) => f.fixtureId === fixtureId);
  };

  const toggleFavorite = (fixture: Omit<FavoriteFixture, 'addedAt'>) => {
    if (isFavorite(fixture.fixtureId)) {
      removeFavorite(fixture.fixtureId);
    } else {
      addFavorite(fixture);
    }
  };

  const clearFavorites = () => {
    setFavorites([]);
    localStorage.removeItem(FAVORITES_KEY);
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    clearFavorites,
  };
};
