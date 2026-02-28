import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== 'string' || code.length !== 6) {
      return NextResponse.json(
        { error: 'Code invalide. Le code doit faire 6 caractères.' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            cookie: cookieStore.toString(),
          },
        },
      }
    );

    // Vérifier l'authentification de l'utilisateur
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    // Chercher le code de liaison
    const { data: linkCode, error: codeError } = await supabase
      .from('link_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('used', false)
      .single();

    if (codeError || !linkCode) {
      return NextResponse.json(
        { error: 'Code invalide ou déjà utilisé' },
        { status: 400 }
      );
    }

    // Vérifier si le code n'est pas expiré
    if (new Date(linkCode.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Code expiré. Veuillez en demander un nouveau.' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur a déjà un compte Discord lié
    const { data: existingLink, error: existingError } = await supabase
      .from('user_discord_links')
      .select('*')
      .eq('supabase_user_id', user.id)
      .eq('is_active', true)
      .single();

    if (existingLink && !existingError) {
      return NextResponse.json(
        { error: 'Tu as déjà un compte Discord lié. Supprime d\'abord le lien existant.' },
        { status: 400 }
      );
    }

    // Vérifier si le Discord user_id est déjà lié à un autre compte
    const { data: discordLink, error: discordError } = await supabase
      .from('user_discord_links')
      .select('*')
      .eq('discord_user_id', linkCode.discord_user_id)
      .eq('is_active', true)
      .single();

    if (discordLink && !discordError) {
      return NextResponse.json(
        { error: 'Ce compte Discord est déjà lié à un autre utilisateur.' },
        { status: 400 }
      );
    }

    // Créer la liaison
    const { data: newLink, error: linkError } = await supabase
      .from('user_discord_links')
      .insert({
        supabase_user_id: user.id,
        discord_user_id: linkCode.discord_user_id,
        linked_at: new Date().toISOString(),
        is_active: true
      })
      .select()
      .single();

    if (linkError) {
      console.error('Erreur lors de la création du lien:', linkError);
      return NextResponse.json(
        { error: 'Erreur lors de la liaison du compte Discord' },
        { status: 500 }
      );
    }

    // Marquer le code comme utilisé
    await supabase
      .from('link_codes')
      .update({ used: true })
      .eq('id', linkCode.id);

    return NextResponse.json({
      success: true,
      message: 'Compte Discord lié avec succès !',
      discord_user_id: linkCode.discord_user_id,
      link: newLink
    });

  } catch (error) {
    console.error('Erreur dans /api/discord/verify-code:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}
