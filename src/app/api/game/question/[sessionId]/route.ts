import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/game/question/[sessionId] - Récupérer la question actuelle
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await params;

    // Récupérer la session de jeu
    const gameSession = await prisma.$queryRaw<Array<{
      id: string;
      status: string;
      current_question_index: number;
    }>>`
      SELECT id, status, current_question_index FROM game_sessions 
      WHERE id = ${sessionId}
    `;

    if (gameSession.length === 0) {
      return NextResponse.json({ error: 'Game session not found' }, { status: 404 });
    }

    const sessionData = gameSession[0];

    if (sessionData.status !== 'active') {
      return NextResponse.json({ error: 'Game not active' }, { status: 400 });
    }

    // Générer une question aléatoire (pour l'instant)
    const questionTypes = ['addition', 'subtraction', 'multiplication', 'division'];
    const difficulties = [1, 2, 3, 4, 5];
    
    const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    
    // Créer une question simple
    let question = '';
    let answer = '';
    
    switch (randomType) {
      case 'addition':
        const a = Math.floor(Math.random() * 50) + 1;
        const b = Math.floor(Math.random() * 50) + 1;
        question = `${a} + ${b} = ?`;
        answer = String(a + b);
        break;
      case 'subtraction':
        const c = Math.floor(Math.random() * 50) + 10;
        const d = Math.floor(Math.random() * 30) + 1;
        question = `${c} - ${d} = ?`;
        answer = String(c - d);
        break;
      case 'multiplication':
        const e = Math.floor(Math.random() * 12) + 1;
        const f = Math.floor(Math.random() * 12) + 1;
        question = `${e} × ${f} = ?`;
        answer = String(e * f);
        break;
      case 'division':
        const g = Math.floor(Math.random() * 12) + 1;
        const h = g * Math.floor(Math.random() * 10) + 1;
        question = `${h} ÷ ${g} = ?`;
        answer = String(h / g);
        break;
    }

    const questionData = {
      id: `q_${Date.now()}_${Math.random()}`,
      question,
      answer,
      type: randomType,
      difficulty: randomDifficulty,
      order: sessionData.current_question_index + 1
    };

    return NextResponse.json({
      question: questionData
    });

  } catch (error: any) {
    console.error('Error generating question:', error);
    return NextResponse.json({ 
      error: 'Failed to generate question',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}
