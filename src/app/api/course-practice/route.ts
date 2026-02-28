import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Sauvegarder une session d'entraînement ciblé
export async function POST(request: NextRequest) {
  try {
    const { userId, courseId, score, questionsCount, correctAnswers, timeSpentSeconds, difficultyLevel } = await request.json();
    
    if (!userId || !courseId || score === undefined || !questionsCount || correctAnswers === undefined || timeSpentSeconds === undefined || !difficultyLevel) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Insérer l'historique d'entraînement
    const { data: practiceHistory, error } = await supabase
      .from('course_practice_history')
      .insert({
        user_id: userId,
        course_id: courseId,
        score,
        questions_count: questionsCount,
        correct_answers: correctAnswers,
        time_spent_seconds: timeSpentSeconds,
        difficulty_level: difficultyLevel
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving course practice history:', error);
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 });
    }

    return NextResponse.json({ success: true, practiceHistory });
  } catch (error) {
    console.error('Error in course-practice POST:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// GET - Récupérer l'historique d'entraînement pour un utilisateur et un cours
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    let query = supabase
      .from('course_practice_history')
      .select(`
        *,
        course:courses(id, title, slug)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data: practiceHistory, error } = await query;

    if (error) {
      console.error('Error fetching course practice history:', error);
      return NextResponse.json({ error: 'Erreur lors de la récupération' }, { status: 500 });
    }

    return NextResponse.json({ practiceHistory: practiceHistory || [] });

  } catch (error) {
    console.error('Error in course-practice GET:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
