"use client";

import { useEffect } from "react";

interface GameAccessTrackerProps {
  gameId: string;
}

/**
 * Client component to track when users view a game detail page
 * Used for the "First Steps" achievement (Discover your first game)
 */
export function GameAccessTracker({ gameId }: GameAccessTrackerProps) {
  useEffect(() => {
    const trackAccess = async () => {
      console.log('🎮 GameAccessTracker: Starting to track access for game:', gameId);
      
      try {
        const response = await fetch(`/api/games/${gameId}/access`, {
          method: 'POST',
          credentials: 'include', // Ensure session cookie is sent
        });
        
        const data = await response.json();
        
        if (response.ok) {
          console.log('✅ GameAccessTracker: Successfully tracked game access:', data);
        } else {
          console.error('❌ GameAccessTracker: Failed to track game access:', response.status, data);
        }
      } catch (error) {
        console.error('❌ GameAccessTracker: Network error:', error);
        // Silent fail - don't interrupt user experience
      }
    };

    trackAccess();
  }, [gameId]); // Only run when gameId changes

  // This component renders nothing - it's just for tracking
  return null;
}

