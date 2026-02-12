import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: gameId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { questionId, answer, timeTaken } = await req.json();

    if (!questionId || answer === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the game and question belong to the user
    const game = await prisma.multiplayerGame.findFirst({
      where: {
        id: gameId,
        OR: [
          { player1Id: user.id },
          { player2Id: user.id }
        ],
        status: 'playing'
      },
      include: {
        questions: {
          where: { id: questionId }
        }
      }
    });

    if (!game || game.questions.length === 0) {
      return NextResponse.json({ error: 'Game or question not found' }, { status: 404 });
    }

    const question = game.questions[0];
    const isCorrect = answer.trim().toLowerCase() === question.answer.trim().toLowerCase();

    // Determine which player is answering
    const isPlayer1 = game.player1Id === user.id;
    
    // Update the question with the player's answer
    const updateData: any = {};
    if (isPlayer1) {
      updateData.player1Answer = answer;
      updateData.player1Time = timeTaken;
      updateData.player1Correct = isCorrect;
    } else {
      updateData.player2Answer = answer;
      updateData.player2Time = timeTaken;
      updateData.player2Correct = isCorrect;
    }

    await prisma.multiplayerQuestion.update({
      where: { id: questionId },
      data: updateData
    });

    // Update game score if correct
    if (isCorrect) {
      const scoreUpdate = isPlayer1 
        ? { player1Score: { increment: 1 } }
        : { player2Score: { increment: 1 } };

      await prisma.multiplayerGame.update({
        where: { id: gameId },
        data: scoreUpdate
      });
    }

    // Check if both players have answered this question
    const updatedQuestion = await prisma.multiplayerQuestion.findUnique({
      where: { id: questionId }
    });

    let bothAnswered = false;
    if (updatedQuestion?.player1Answer && updatedQuestion?.player2Answer) {
      bothAnswered = true;
    }

    return NextResponse.json({
      success: true,
      isCorrect,
      bothAnswered,
      playerScore: isPlayer1 ? game.player1Score + (isCorrect ? 1 : 0) : game.player2Score + (isCorrect ? 1 : 0)
    });

  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
}
