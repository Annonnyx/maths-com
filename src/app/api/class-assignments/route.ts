import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdaptiveQuestionGenerator } from '@/lib/question-generators';
import { FrenchClass } from '@/lib/french-classes';

// GET - Récupérer les devoirs d'une classe
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('[GET /api/class-assignments] Session:', session?.user?.id);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    console.log('[GET /api/class-assignments] classId:', classId);

    if (!classId) {
      return NextResponse.json({ error: 'classId requis' }, { status: 400 });
    }

    // Vérifier que l'utilisateur est membre de la classe
    const membership = await prisma.classGroupMember.findFirst({
      where: {
        groupId: classId,
        userId: session.user.id
      }
    });
    console.log('[GET /api/class-assignments] Membership:', membership);

    if (!membership) {
      return NextResponse.json({ error: 'Non membre de cette classe' }, { status: 403 });
    }

    // Fetch real assignments from database
    console.log('[GET /api/class-assignments] Fetching assignments...');
    const assignments = await prisma.classAssignment.findMany({
      where: { classId },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        },
        submissions: {
          where: { studentId: session.user.id },
          select: {
            id: true,
            status: true,
            score: true,
            correctCount: true,
            totalAnswered: true,
            submittedAt: true
          }
        },
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log('[GET /api/class-assignments] Found', assignments.length, 'assignments');
    console.log('[GET /api/class-assignments] First assignment:', assignments[0]);

    // Format assignments for response
    const formattedAssignments = assignments.map(assignment => ({
      ...assignment,
      mySubmission: assignment.submissions[0] || null,
      totalSubmissions: assignment._count.submissions
    }));

    return NextResponse.json({ assignments: formattedAssignments });

  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un devoir (prof uniquement)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      classId, 
      title, 
      description, 
      dueDate, 
      questionCount = 10, 
      difficulty = 'mixed',
      schoolLevel = null,
      operationTypes = ['addition', 'subtraction', 'multiplication', 'division'],
      timeLimit = null,
      negativePoints = false,
      questionSource = 'auto',
      manualQuestions = [], // For manually created questions
      shareEnabled = false
    } = body;

    if (!classId || !title) {
      return NextResponse.json({ error: 'classId et title requis' }, { status: 400 });
    }

    // Vérifier que l'utilisateur est le professeur
    const classGroup = await prisma.classGroup.findUnique({
      where: { id: classId },
      select: { teacherId: true }
    });

    if (!classGroup || classGroup.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Accès réservé au professeur' }, { status: 403 });
    }

    // Générer un share code si partage activé
    const shareCode = shareEnabled ? generateShareCode() : null;

    // Créer le devoir
    const assignment = await prisma.classAssignment.create({
      data: {
        classId,
        title,
        description,
        questionCount,
        difficulty,
        schoolLevel,
        negativePoints,
        questionSource,
        operationTypes: questionSource === 'auto' ? JSON.stringify(operationTypes) : null,
        timeLimit,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'active',
        shareCode,
        shareEnabled
      }
    });

    // Créer les questions
    let questions;
    if (questionSource === 'manual' && manualQuestions.length > 0) {
      // Use manually created questions
      questions = manualQuestions.map((q: any, index: number) => ({
        assignmentId: assignment.id,
        questionType: q.type,
        question: q.question,
        answer: q.answer || null,
        type: 'manual',
        difficulty: q.difficulty || 5,
        order: index,
        points: q.points || 1,
        options: q.options ? JSON.stringify(q.options) : null,
        correctAnswers: q.correctAnswers ? JSON.stringify(q.correctAnswers) : null,
        requiresManualGrading: q.requiresManualGrading || false,
        acceptedAnswers: q.acceptedAnswers ? JSON.stringify(q.acceptedAnswers) : null
      }));
    } else if (schoolLevel) {
      // Use new adaptive question generator based on school level
      const generator = new AdaptiveQuestionGenerator();
      const frenchClass = schoolLevel.toLowerCase().replace('è', 'e').replace('é', 'e') as FrenchClass;
      
      questions = []; // Initialize array first
      
      for (let i = 0; i < questionCount; i++) {
        const q = generator.generateForLevel(frenchClass, { difficulty });
        questions.push({
          assignmentId: assignment.id,
          questionType: 'single',
          question: q.question,
          answer: q.correct, // Use 'correct' property for the answer
          type: 'calculation', // Default type since GeneratedQuestion doesn't have 'type'
          difficulty: q.difficulty || 5,
          order: i,
          points: 1,
          options: null,
          correctAnswers: null,
          requiresManualGrading: false,
          acceptedAnswers: null
        });
      }
    } else {
      // Fallback to simple generation if no school level selected
      const generatedQuestions = generateQuestions(questionCount, difficulty, operationTypes);
      questions = generatedQuestions.map((q, index) => ({
        assignmentId: assignment.id,
        questionType: 'single',
        question: q.question,
        answer: q.answer,
        type: q.type,
        difficulty: q.difficulty,
        order: index,
        points: 1,
        options: null,
        correctAnswers: null,
        requiresManualGrading: false,
        acceptedAnswers: null
      }));
    }
    
    // Créer les questions dans la base
    await prisma.assignmentQuestion.createMany({
      data: questions
    });

    return NextResponse.json({ 
      success: true, 
      assignment: {
        ...assignment,
        questions
      }
    });

  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Generate unique share code
function generateShareCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Générer des questions de calcul
function generateQuestions(count: number, difficulty: string, operationTypes: string[]) {
  const questions = [];
  
  for (let i = 0; i < count; i++) {
    const type = operationTypes[Math.floor(Math.random() * operationTypes.length)];
    let difficultyLevel = 5;
    
    switch (difficulty) {
      case 'easy': difficultyLevel = 3; break;
      case 'medium': difficultyLevel = 5; break;
      case 'hard': difficultyLevel = 8; break;
      case 'mixed': difficultyLevel = Math.floor(Math.random() * 8) + 2; break;
    }
    
    const question = generateMathQuestion(type, difficultyLevel);
    questions.push({
      ...question,
      difficulty: difficultyLevel
    });
  }
  
  return questions;
}

function generateMathQuestion(type: string, difficulty: number) {
  let num1: number, num2: number, answer: number, question: string;
  
  // Ajuster les plages selon la difficulté (1-10)
  const maxNum = Math.min(10 + difficulty * 10, 1000);
  
  switch (type) {
    case 'addition':
      num1 = Math.floor(Math.random() * maxNum) + 1;
      num2 = Math.floor(Math.random() * maxNum) + 1;
      answer = num1 + num2;
      question = `${num1} + ${num2}`;
      break;
    case 'subtraction':
      num1 = Math.floor(Math.random() * maxNum) + 1;
      num2 = Math.floor(Math.random() * num1) + 1;
      answer = num1 - num2;
      question = `${num1} - ${num2}`;
      break;
    case 'multiplication':
      num1 = Math.floor(Math.random() * Math.min(maxNum / 10, 20)) + 1;
      num2 = Math.floor(Math.random() * Math.min(maxNum / 10, 20)) + 1;
      answer = num1 * num2;
      question = `${num1} × ${num2}`;
      break;
    case 'division':
      num2 = Math.floor(Math.random() * Math.min(maxNum / 20, 12)) + 2;
      answer = Math.floor(Math.random() * Math.min(maxNum / 10, 20)) + 1;
      num1 = num2 * answer;
      question = `${num1} ÷ ${num2}`;
      break;
    default:
      num1 = Math.floor(Math.random() * maxNum) + 1;
      num2 = Math.floor(Math.random() * maxNum) + 1;
      answer = num1 + num2;
      question = `${num1} + ${num2}`;
  }
  
  return {
    type,
    question,
    answer: answer.toString()
  };
}
