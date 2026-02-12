-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "elo" INTEGER NOT NULL DEFAULT 400,
    "rankClass" TEXT NOT NULL DEFAULT 'F-',
    "bestElo" INTEGER NOT NULL DEFAULT 400,
    "bestRankClass" TEXT NOT NULL DEFAULT 'F-',
    "hasCompletedOnboarding" BOOLEAN NOT NULL DEFAULT false,
    "additionLevel" INTEGER NOT NULL DEFAULT 1,
    "subtractionLevel" INTEGER NOT NULL DEFAULT 0,
    "multiplicationLevel" INTEGER NOT NULL DEFAULT 0,
    "divisionLevel" INTEGER NOT NULL DEFAULT 0,
    "powerLevel" INTEGER NOT NULL DEFAULT 0,
    "rootLevel" INTEGER NOT NULL DEFAULT 0,
    "factorizationLevel" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "bestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastTestDate" DATETIME
);

-- CreateTable
CREATE TABLE "tests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "totalQuestions" INTEGER NOT NULL DEFAULT 20,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL,
    "timeTaken" INTEGER NOT NULL,
    "eloBefore" INTEGER NOT NULL,
    "eloAfter" INTEGER NOT NULL,
    "eloChange" INTEGER NOT NULL,
    "isPerfect" BOOLEAN NOT NULL DEFAULT false,
    "isStreakTest" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "tests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "testId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "userAnswer" TEXT,
    "isCorrect" BOOLEAN,
    "timeTaken" INTEGER,
    "explanation" TEXT,
    "order" INTEGER NOT NULL,
    CONSTRAINT "questions_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "statistics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "totalTests" INTEGER NOT NULL DEFAULT 0,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "totalCorrect" INTEGER NOT NULL DEFAULT 0,
    "totalTime" INTEGER NOT NULL DEFAULT 0,
    "averageScore" REAL NOT NULL DEFAULT 0,
    "averageTime" REAL NOT NULL DEFAULT 0,
    "additionTests" INTEGER NOT NULL DEFAULT 0,
    "additionCorrect" INTEGER NOT NULL DEFAULT 0,
    "additionTotal" INTEGER NOT NULL DEFAULT 0,
    "subtractionTests" INTEGER NOT NULL DEFAULT 0,
    "subtractionCorrect" INTEGER NOT NULL DEFAULT 0,
    "subtractionTotal" INTEGER NOT NULL DEFAULT 0,
    "multiplicationTests" INTEGER NOT NULL DEFAULT 0,
    "multiplicationCorrect" INTEGER NOT NULL DEFAULT 0,
    "multiplicationTotal" INTEGER NOT NULL DEFAULT 0,
    "divisionTests" INTEGER NOT NULL DEFAULT 0,
    "divisionCorrect" INTEGER NOT NULL DEFAULT 0,
    "divisionTotal" INTEGER NOT NULL DEFAULT 0,
    "powerTests" INTEGER NOT NULL DEFAULT 0,
    "powerCorrect" INTEGER NOT NULL DEFAULT 0,
    "powerTotal" INTEGER NOT NULL DEFAULT 0,
    "rootTests" INTEGER NOT NULL DEFAULT 0,
    "rootCorrect" INTEGER NOT NULL DEFAULT 0,
    "rootTotal" INTEGER NOT NULL DEFAULT 0,
    "factorizationTests" INTEGER NOT NULL DEFAULT 0,
    "factorizationCorrect" INTEGER NOT NULL DEFAULT 0,
    "factorizationTotal" INTEGER NOT NULL DEFAULT 0,
    "weakPoints" TEXT,
    "eloHistory" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "statistics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "exercise_attempts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "userAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeTaken" INTEGER NOT NULL,
    "feedbackShown" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "exercise_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "relatedTypes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "statistics_userId_key" ON "statistics"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");
