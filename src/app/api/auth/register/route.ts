import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    // Validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { message: 'Le nom d\'utilisateur doit faire entre 3 et 20 caractères' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Cet email ou ce nom d\'utilisateur est déjà utilisé' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        displayName: username,
        elo: 400,
        rankClass: 'F-',
        bestElo: 400,
        bestRankClass: 'F-',
        hasCompletedOnboarding: false,
      },
    });

    // Create initial statistics
    await prisma.statistics.create({
      data: {
        userId: user.id,
        totalTests: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        averageTime: 0,
        additionCorrect: 0,
        additionTotal: 0,
        subtractionCorrect: 0,
        subtractionTotal: 0,
        multiplicationCorrect: 0,
        multiplicationTotal: 0,
        divisionCorrect: 0,
        divisionTotal: 0,
        powerCorrect: 0,
        powerTotal: 0,
        rootCorrect: 0,
        rootTotal: 0,
        factorizationCorrect: 0,
        factorizationTotal: 0,
      },
    });

    return NextResponse.json(
      { message: 'Utilisateur créé avec succès', userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de l\'inscription' },
      { status: 500 }
    );
  }
}
