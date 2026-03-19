/*
  Warnings:

  - You are about to drop the column `color` on the `badges` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `badges` table. All the data in the column will be lost.
  - You are about to drop the column `isCustom` on the `badges` table. All the data in the column will be lost.
  - You are about to drop the column `isTemporary` on the `badges` table. All the data in the column will be lost.
  - You are about to drop the column `requirement` on the `badges` table. All the data in the column will be lost.
  - You are about to drop the column `challengedId` on the `challenges` table. All the data in the column will be lost.
  - You are about to drop the column `challengerId` on the `challenges` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `exercise_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `user1Id` on the `friendships` table. All the data in the column will be lost.
  - You are about to drop the column `user2Id` on the `friendships` table. All the data in the column will be lost.
  - You are about to drop the column `receiverId` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `player1Id` on the `multiplayer_games` table. All the data in the column will be lost.
  - You are about to drop the column `gameId` on the `multiplayer_questions` table. All the data in the column will be lost.
  - You are about to drop the column `bestStreak` on the `multiplayer_statistics` table. All the data in the column will be lost.
  - You are about to drop the column `currentStreak` on the `multiplayer_statistics` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `multiplayer_statistics` table. All the data in the column will be lost.
  - You are about to drop the column `awardedById` on the `user_badges` table. All the data in the column will be lost.
  - You are about to drop the column `badgeId` on the `user_badges` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `user_badges` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `user_badges` table. All the data in the column will be lost.
  - You are about to drop the column `additionLevel` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `avatarUrl` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `bannerUrl` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `bestElo` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `bestMultiplayerElo` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `bestMultiplayerRankClass` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `bestRankClass` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `bestStreak` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `currentStreak` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `customBannerId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `displayName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `divisionLevel` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `elo` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `factorizationLevel` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `hasCompletedOnboarding` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isAdmin` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isOnline` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastSeenAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastTestDate` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `multiplayerElo` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `multiplayerGames` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `multiplayerLosses` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `multiplayerRankClass` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `multiplayerWins` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `multiplicationLevel` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `powerLevel` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `rankClass` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `rootLevel` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `selectedBadgeIds` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `subtractionLevel` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `questions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `statistics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tests` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user1_id,user2_id]` on the table `friendships` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `multiplayer_statistics` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,badge_id]` on the table `user_badges` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[discord_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[discord_link_code]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `challenged_id` to the `challenges` table without a default value. This is not possible if the table is not empty.
  - Added the required column `challenger_id` to the `challenges` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `exercise_attempts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user1_id` to the `friendships` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user2_id` to the `friendships` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiver_id` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sender_id` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `player1_id` to the `multiplayer_games` table without a default value. This is not possible if the table is not empty.
  - Added the required column `game_id` to the `multiplayer_questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `multiplayer_statistics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `badge_id` to the `user_badges` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `user_badges` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."challenges" DROP CONSTRAINT "challenges_challengedId_fkey";

-- DropForeignKey
ALTER TABLE "public"."challenges" DROP CONSTRAINT "challenges_challengerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."exercise_attempts" DROP CONSTRAINT "exercise_attempts_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."friendships" DROP CONSTRAINT "friendships_user1Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."friendships" DROP CONSTRAINT "friendships_user2Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_senderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."multiplayer_games" DROP CONSTRAINT "multiplayer_games_player1Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."multiplayer_questions" DROP CONSTRAINT "multiplayer_questions_gameId_fkey";

-- DropForeignKey
ALTER TABLE "public"."multiplayer_statistics" DROP CONSTRAINT "multiplayer_statistics_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."questions" DROP CONSTRAINT "questions_testId_fkey";

-- DropForeignKey
ALTER TABLE "public"."statistics" DROP CONSTRAINT "statistics_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."tests" DROP CONSTRAINT "tests_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_badges" DROP CONSTRAINT "user_badges_badgeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_badges" DROP CONSTRAINT "user_badges_userId_fkey";

-- DropIndex
DROP INDEX "public"."friendships_user1Id_user2Id_key";

-- DropIndex
DROP INDEX "public"."multiplayer_statistics_userId_key";

-- DropIndex
DROP INDEX "public"."user_badges_userId_badgeId_key";

-- DropIndex
DROP INDEX "public"."idx_users_elo";

-- DropIndex
DROP INDEX "public"."idx_users_last_seen";

-- DropIndex
DROP INDEX "public"."idx_users_rank_class";

-- AlterTable
ALTER TABLE "public"."badges" DROP COLUMN "color",
DROP COLUMN "createdById",
DROP COLUMN "isCustom",
DROP COLUMN "isTemporary",
DROP COLUMN "requirement",
ADD COLUMN     "condition" TEXT,
ADD COLUMN     "is_hidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rarity" TEXT NOT NULL DEFAULT 'common',
ADD COLUMN     "requirements" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."challenges" DROP COLUMN "challengedId",
DROP COLUMN "challengerId",
ADD COLUMN     "challenged_id" TEXT NOT NULL,
ADD COLUMN     "challenger_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."exercise_attempts" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."friendships" DROP COLUMN "user1Id",
DROP COLUMN "user2Id",
ADD COLUMN     "user1_id" TEXT NOT NULL,
ADD COLUMN     "user2_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."messages" DROP COLUMN "receiverId",
DROP COLUMN "senderId",
ADD COLUMN     "receiver_id" TEXT NOT NULL,
ADD COLUMN     "sender_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."multiplayer_games" DROP COLUMN "player1Id",
ADD COLUMN     "player1_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."multiplayer_questions" DROP COLUMN "gameId",
ADD COLUMN     "game_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."multiplayer_statistics" DROP COLUMN "bestStreak",
DROP COLUMN "currentStreak",
DROP COLUMN "userId",
ADD COLUMN     "multiplayerBestStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "multiplayerCurrentStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."user_badges" DROP COLUMN "awardedById",
DROP COLUMN "badgeId",
DROP COLUMN "expiresAt",
DROP COLUMN "userId",
ADD COLUMN     "badge_id" TEXT NOT NULL,
ADD COLUMN     "is_new" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "additionLevel",
DROP COLUMN "avatarUrl",
DROP COLUMN "bannerUrl",
DROP COLUMN "bestElo",
DROP COLUMN "bestMultiplayerElo",
DROP COLUMN "bestMultiplayerRankClass",
DROP COLUMN "bestRankClass",
DROP COLUMN "bestStreak",
DROP COLUMN "createdAt",
DROP COLUMN "currentStreak",
DROP COLUMN "customBannerId",
DROP COLUMN "displayName",
DROP COLUMN "divisionLevel",
DROP COLUMN "elo",
DROP COLUMN "factorizationLevel",
DROP COLUMN "hasCompletedOnboarding",
DROP COLUMN "isAdmin",
DROP COLUMN "isOnline",
DROP COLUMN "lastSeenAt",
DROP COLUMN "lastTestDate",
DROP COLUMN "multiplayerElo",
DROP COLUMN "multiplayerGames",
DROP COLUMN "multiplayerLosses",
DROP COLUMN "multiplayerRankClass",
DROP COLUMN "multiplayerWins",
DROP COLUMN "multiplicationLevel",
DROP COLUMN "powerLevel",
DROP COLUMN "rankClass",
DROP COLUMN "rootLevel",
DROP COLUMN "selectedBadgeIds",
DROP COLUMN "subtractionLevel",
DROP COLUMN "updatedAt",
ADD COLUMN     "accept_join_requests" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "banner_url" TEXT,
ADD COLUMN     "birth_year" INTEGER,
ADD COLUMN     "classe" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "custom_banner_id" TEXT,
ADD COLUMN     "discord_id" TEXT,
ADD COLUMN     "discord_link_code" TEXT,
ADD COLUMN     "discord_linked_at" TIMESTAMP(3),
ADD COLUMN     "discord_username" TEXT,
ADD COLUMN     "display_name" TEXT,
ADD COLUMN     "has_completed_onboarding" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_admin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_online" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_teacher" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "last_test_date" TIMESTAMP(3),
ADD COLUMN     "multiplayer_best_elo" INTEGER NOT NULL DEFAULT 400,
ADD COLUMN     "multiplayer_best_rank_class" TEXT NOT NULL DEFAULT 'F-',
ADD COLUMN     "multiplayer_elo" INTEGER NOT NULL DEFAULT 400,
ADD COLUMN     "multiplayer_rank_class" TEXT NOT NULL DEFAULT 'F-',
ADD COLUMN     "school" TEXT,
ADD COLUMN     "selected_badge_ids" TEXT,
ADD COLUMN     "solo_best_elo" INTEGER NOT NULL DEFAULT 400,
ADD COLUMN     "solo_best_rank_class" TEXT NOT NULL DEFAULT 'F-',
ADD COLUMN     "solo_best_streak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "solo_current_streak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "solo_elo" INTEGER NOT NULL DEFAULT 400,
ADD COLUMN     "solo_rank_class" TEXT NOT NULL DEFAULT 'F-',
ADD COLUMN     "subject" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "public"."questions";

-- DropTable
DROP TABLE "public"."statistics";

-- DropTable
DROP TABLE "public"."tests";

-- CreateTable
CREATE TABLE "public"."solo_statistics" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "totalTests" INTEGER NOT NULL DEFAULT 0,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "totalCorrect" INTEGER NOT NULL DEFAULT 0,
    "totalTime" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solo_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."solo_tests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "totalQuestions" INTEGER NOT NULL DEFAULT 20,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL,
    "timeTaken" INTEGER NOT NULL,
    "eloBefore" INTEGER NOT NULL,
    "eloAfter" INTEGER NOT NULL,
    "eloChange" INTEGER NOT NULL,
    "timeBonus" INTEGER NOT NULL DEFAULT 0,
    "isPerfect" BOOLEAN NOT NULL DEFAULT false,
    "isStreakTest" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "solo_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."solo_questions" (
    "id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "userAnswer" TEXT,
    "isCorrect" BOOLEAN,
    "timeTaken" INTEGER,
    "explanation" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "solo_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."game_sessions" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(6) NOT NULL,
    "host_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "quizId" TEXT,
    "maxPlayers" INTEGER NOT NULL DEFAULT 20,
    "currentQuestionIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."game_players" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isReady" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."game_questions" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."teacher_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."faq_submissions" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "email" TEXT,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "userAgent" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faq_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."class_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "description" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "inviteCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "level" VARCHAR(50),
    "subject" VARCHAR(50) DEFAULT 'maths',
    "maxstudents" INTEGER DEFAULT 30,

    CONSTRAINT "class_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."class_group_members" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'student',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."class_messages" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_by" TEXT,
    "requires_confirmation" BOOLEAN NOT NULL DEFAULT false,
    "confirmed_by" TEXT,
    "attachments" TEXT,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "pinned_at" TIMESTAMP(3),
    "pinned_by" TEXT,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."question_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "correct" BOOLEAN NOT NULL,
    "eloAtMoment" INTEGER NOT NULL,

    CONSTRAINT "question_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."class_join_requests" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_join_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "senderId" TEXT,
    "senderName" TEXT,
    "senderAvatarUrl" TEXT,
    "metadata" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."course_practice_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "questionsCount" INTEGER NOT NULL,
    "correctAnswers" INTEGER NOT NULL,
    "timeSpentSeconds" INTEGER NOT NULL,
    "difficultyLevel" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_practice_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."class_assignments" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "class_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "question_count" INTEGER DEFAULT 10,
    "difficulty" TEXT DEFAULT 'mixed',
    "time_limit" INTEGER,
    "operation_types" TEXT,
    "due_date" TIMESTAMPTZ(6),
    "status" TEXT DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."assignment_questions" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "assignment_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "assignment_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."assignment_submissions" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "assignment_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "status" TEXT DEFAULT 'in_progress',
    "score" INTEGER,
    "correct_count" INTEGER DEFAULT 0,
    "total_answered" INTEGER DEFAULT 0,
    "time_spent" INTEGER,
    "started_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMPTZ(6),
    "graded_at" TIMESTAMPTZ(6),
    "graded_by" TEXT,

    CONSTRAINT "assignment_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."assignment_answers" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "submission_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "user_answer" TEXT,
    "is_correct" BOOLEAN,
    "time_taken" INTEGER,

    CONSTRAINT "assignment_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuestionHistory" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "user_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "answered_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "correct" BOOLEAN NOT NULL,
    "time_spent" INTEGER DEFAULT 0,
    "difficulty" TEXT DEFAULT 'mixed',
    "subject" TEXT DEFAULT 'maths',
    "type" TEXT DEFAULT 'calculation',
    "elo_at_moment" INTEGER NOT NULL,

    CONSTRAINT "QuestionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cli_api_keys" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "label" TEXT,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cli_api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "solo_statistics_user_id_key" ON "public"."solo_statistics"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "game_sessions_code_key" ON "public"."game_sessions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "class_groups_inviteCode_key" ON "public"."class_groups"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "class_group_members_group_id_user_id_key" ON "public"."class_group_members"("group_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_class_assignments_class_id" ON "public"."class_assignments"("class_id");

-- CreateIndex
CREATE INDEX "idx_class_assignments_status" ON "public"."class_assignments"("status");

-- CreateIndex
CREATE INDEX "idx_assignment_questions_assignment_id" ON "public"."assignment_questions"("assignment_id");

-- CreateIndex
CREATE INDEX "idx_assignment_submissions_assignment_id" ON "public"."assignment_submissions"("assignment_id");

-- CreateIndex
CREATE INDEX "idx_assignment_submissions_student_id" ON "public"."assignment_submissions"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "assignment_submissions_assignment_id_student_id_key" ON "public"."assignment_submissions"("assignment_id", "student_id");

-- CreateIndex
CREATE INDEX "idx_assignment_answers_submission_id" ON "public"."assignment_answers"("submission_id");

-- CreateIndex
CREATE UNIQUE INDEX "assignment_answers_submission_id_question_id_key" ON "public"."assignment_answers"("submission_id", "question_id");

-- CreateIndex
CREATE INDEX "idx_question_history_answered_at" ON "public"."QuestionHistory"("answered_at");

-- CreateIndex
CREATE INDEX "idx_question_history_user_id" ON "public"."QuestionHistory"("user_id");

-- CreateIndex
CREATE INDEX "idx_question_history_user_question" ON "public"."QuestionHistory"("user_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "cli_api_keys_keyHash_key" ON "public"."cli_api_keys"("keyHash");

-- CreateIndex
CREATE INDEX "badges_category_idx" ON "public"."badges"("category");

-- CreateIndex
CREATE INDEX "idx_badges_category" ON "public"."badges"("category");

-- CreateIndex
CREATE UNIQUE INDEX "friendships_user1_id_user2_id_key" ON "public"."friendships"("user1_id", "user2_id");

-- CreateIndex
CREATE UNIQUE INDEX "multiplayer_statistics_user_id_key" ON "public"."multiplayer_statistics"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_badges_badge_id" ON "public"."user_badges"("badge_id");

-- CreateIndex
CREATE INDEX "idx_user_badges_user_id" ON "public"."user_badges"("user_id");

-- CreateIndex
CREATE INDEX "user_badges_badge_id_idx" ON "public"."user_badges"("badge_id");

-- CreateIndex
CREATE INDEX "user_badges_user_id_idx" ON "public"."user_badges"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_user_id_badge_id_key" ON "public"."user_badges"("user_id", "badge_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_discord_id_key" ON "public"."users"("discord_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_discord_link_code_key" ON "public"."users"("discord_link_code");

-- AddForeignKey
ALTER TABLE "public"."solo_statistics" ADD CONSTRAINT "solo_statistics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."solo_tests" ADD CONSTRAINT "solo_tests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."solo_questions" ADD CONSTRAINT "solo_questions_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "public"."solo_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."game_sessions" ADD CONSTRAINT "game_sessions_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."game_players" ADD CONSTRAINT "game_players_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."game_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."game_players" ADD CONSTRAINT "game_players_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."game_questions" ADD CONSTRAINT "game_questions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."game_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exercise_attempts" ADD CONSTRAINT "exercise_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."friendships" ADD CONSTRAINT "friendships_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."friendships" ADD CONSTRAINT "friendships_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."multiplayer_games" ADD CONSTRAINT "multiplayer_games_player1_id_fkey" FOREIGN KEY ("player1_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."multiplayer_questions" ADD CONSTRAINT "multiplayer_questions_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."multiplayer_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."multiplayer_statistics" ADD CONSTRAINT "multiplayer_statistics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."challenges" ADD CONSTRAINT "challenges_challenged_id_fkey" FOREIGN KEY ("challenged_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."challenges" ADD CONSTRAINT "challenges_challenger_id_fkey" FOREIGN KEY ("challenger_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_badges" ADD CONSTRAINT "user_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_badges" ADD CONSTRAINT "user_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_requests" ADD CONSTRAINT "teacher_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_groups" ADD CONSTRAINT "class_groups_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_group_members" ADD CONSTRAINT "class_group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."class_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_group_members" ADD CONSTRAINT "class_group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_messages" ADD CONSTRAINT "class_messages_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."class_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_messages" ADD CONSTRAINT "class_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_history" ADD CONSTRAINT "question_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_join_requests" ADD CONSTRAINT "class_join_requests_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_join_requests" ADD CONSTRAINT "class_join_requests_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_practice_history" ADD CONSTRAINT "course_practice_history_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_practice_history" ADD CONSTRAINT "course_practice_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_assignments" ADD CONSTRAINT "class_assignments_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."class_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."assignment_questions" ADD CONSTRAINT "assignment_questions_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "public"."class_assignments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."assignment_submissions" ADD CONSTRAINT "assignment_submissions_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "public"."class_assignments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."assignment_submissions" ADD CONSTRAINT "assignment_submissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."assignment_answers" ADD CONSTRAINT "assignment_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."assignment_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."assignment_answers" ADD CONSTRAINT "assignment_answers_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "public"."assignment_submissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."QuestionHistory" ADD CONSTRAINT "QuestionHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."cli_api_keys" ADD CONSTRAINT "cli_api_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
