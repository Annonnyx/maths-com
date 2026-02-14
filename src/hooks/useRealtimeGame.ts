import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export function useRealtimeGame(gameId: string | null) {
  const [gameState, setGameState] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!gameId) return;

    // Fetch initial game state
    const fetchGame = async () => {
      const { data, error } = await supabase
        .from('multiplayer_games')
        .select('*, player1:users!player1Id(*), player2:users!player2Id(*)')
        .eq('id', gameId)
        .single();

      if (error) {
        console.error('Error fetching game:', error);
        setError(error.message);
      } else {
        setGameState(data);
      }
    };

    fetchGame();

    // Subscribe to changes in the game
    const channel = supabase
      .channel(`game:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'multiplayer_games',
          filter: `id=eq.${gameId}`,
        },
        async (payload) => {
          console.log('Game updated:', payload);
          // Re-fetch to get nested relations
          const { data } = await supabase
            .from('multiplayer_games')
            .select('*, player1:users!player1Id(*), player2:users!player2Id(*)')
            .eq('id', gameId)
            .single();
          
          if (data) {
            setGameState(data);
            
            // Handle redirections or game start
            if (data.status === 'playing' && data.player2Id) {
              // Trigger any local UI changes if needed
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, router]);

  return { gameState, error };
}
