import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TimeControl, GameType } from '@/lib/multiplayer';
import { generateMultiplayerQuestions } from '@/lib/exercises';
import { TIME_CONTROLS } from '@/lib/multiplayer';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        username: true,
        displayName: true,
        multiplayerElo: true,
        multiplayerRankClass: true,
        isOnline: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { timeControl, gameType, questionCount } = await req.json();

    console.log('Multiplayer game request:', { 
      userId: user.id, 
      username: user.username, 
      timeControl, 
      gameType, 
      questionCount 
    });

    // Validate input
    if (!timeControl || !gameType) {
      console.log('Missing required fields:', { timeControl, gameType });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user is already in a game
    const existingGame = await prisma.multiplayerGame.findFirst({
      where: {
        OR: [
          { player1Id: user.id, status: { in: ['waiting', 'playing'] } },
          { player2Id: user.id, status: { in: ['waiting', 'playing'] } }
        ]
      }
    });

    if (existingGame) {
      console.log('User already in game:', {
        userId: user.id,
        gameId: existingGame.id,
        status: existingGame.status
      });
      return NextResponse.json({ 
        error: 'You are already in a game',
        gameId: existingGame.id,
        status: existingGame.status 
      }, { status: 400 });
    }

    // Find waiting game
    const waitingGame = await prisma.multiplayerGame.findFirst({
      where: {
        status: 'waiting',
        player2Id: null,
        player1Id: { not: user.id },
        gameType: gameType, // Match same game type
        timeControl: timeControl // Match same time control
      },
      include: {
        player1: {
          select: {
            id: true,
            username: true,
            displayName: true,
            multiplayerElo: true,
            multiplayerRankClass: true,
            isOnline: true
          }
        }
      }
    });

    if (waitingGame) {
      // Join existing game
      console.log('Joining existing game:', waitingGame.id);
      console.log('Player1 Elo:', waitingGame.player1.multiplayerElo);
      console.log('Player2 Elo:', user.multiplayerElo);
      
      try {
        const questions = generateMultiplayerQuestions(
          waitingGame.player1.multiplayerElo,
          user.multiplayerElo,
          questionCount || 20
        );
        
        console.log('Generated questions:', questions.length);
        console.log('First question:', questions[0]);

        // Update game with player 2
        const updatedGame = await prisma.multiplayerGame.update({
          where: { id: waitingGame.id },
          data: {
            player2Id: user.id,
            player2Elo: user.multiplayerElo,
            status: 'playing',
            startedAt: new Date(),
            questions: {
              create: questions.map((q: any, index: number) => ({
                order: index,
                question: q.question,
                answer: q.answer,
                type: q.type,
                difficulty: q.difficulty
              }))
            }
          },
          include: {
            player1: {
              select: {
                id: true,
                username: true,
                displayName: true,
                multiplayerElo: true,
                multiplayerRankClass: true,
                isOnline: true
              }
            },
            player2: {
              select: {
                id: true,
                username: true,
                displayName: true,
                multiplayerElo: true,
                multiplayerRankClass: true,
                isOnline: true
              }
            },
            questions: {
              orderBy: { order: 'asc' }
            }
          }
        });

        // Update user online status
        await prisma.user.update({
          where: { id: user.id },
          data: { isOnline: true, lastSeenAt: new Date() }
        });

        return NextResponse.json({
          success: true,
          game: updatedGame,
          isPlayer1: false
        });
      } catch (error) {
        console.error('Error generating questions or updating game:', error);
        return NextResponse.json({ 
          error: 'Failed to generate questions or update game',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    } else {
      // Create new waiting game
      const newGame = await prisma.multiplayerGame.create({
        data: {
          player1Id: user.id,
          player1Elo: user.multiplayerElo,
          status: 'waiting',
          gameType,
          timeControl,
          timeLimit: TIME_CONTROLS[timeControl as TimeControl].timeLimit,
          questionCount: questionCount || 20
        },
        include: {
          player1: {
            select: {
              id: true,
              username: true,
              displayName: true,
              multiplayerElo: true,
              multiplayerRankClass: true,
              isOnline: true
            }
          }
        }
      });

      // Update user online status
      await prisma.user.update({
        where: { id: user.id },
        data: { isOnline: true, lastSeenAt: new Date() }
      });

      return NextResponse.json({
        success: true,
        game: newGame,
        isPlayer1: true
      });
    }
  } catch (error) {
    console.error('Error in multiplayer API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
