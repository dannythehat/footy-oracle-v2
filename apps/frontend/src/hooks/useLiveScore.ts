import { useState, useEffect } from 'react';
import { wsService, LiveScoreUpdate } from '../services/websocket';

export const useLiveScore = (fixtureId: number | null) => {
  const [liveScore, setLiveScore] = useState<LiveScoreUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!fixtureId) return;

    // Connect WebSocket if not already connected
    wsService.connect();
    setIsConnected(true);

    // Subscribe to fixture updates
    const unsubscribe = wsService.subscribe(fixtureId, (data) => {
      setLiveScore(data);
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [fixtureId]);

  return {
    liveScore,
    isConnected,
  };
};
