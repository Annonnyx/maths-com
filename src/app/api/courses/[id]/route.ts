import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Récupérer les détails d'un cours
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { data: course, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .eq('isPublished', true)
      .single();

    if (error) {
      console.error('Error fetching course:', error);
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 });
    }

    // Parser les relatedTypes si c'est une chaîne JSON
    let relatedTypes = [];
    if (course.relatedTypes) {
      try {
        relatedTypes = typeof course.relatedTypes === 'string' 
          ? JSON.parse(course.relatedTypes) 
          : course.relatedTypes;
      } catch (e) {
        console.error('Error parsing relatedTypes:', e);
        relatedTypes = [];
      }
    }

    return NextResponse.json({ 
      ...course, 
      relatedTypes 
    });
  } catch (error) {
    console.error('Error in courses GET:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
