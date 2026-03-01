-- SCRIPT FINAL : Toutes les colonnes manquantes pour TOUTES les tables

-- TeacherRequest
ALTER TABLE teacher_requests ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE teacher_requests ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE teacher_requests ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE teacher_requests ADD COLUMN IF NOT EXISTS "school" TEXT;
ALTER TABLE teacher_requests ADD COLUMN IF NOT EXISTS "subject" TEXT;
ALTER TABLE teacher_requests ADD COLUMN IF NOT EXISTS "message" TEXT;
ALTER TABLE teacher_requests ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'pending';
ALTER TABLE teacher_requests ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE teacher_requests ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- FaqSubmission
ALTER TABLE faq_submissions ADD COLUMN IF NOT EXISTS "type" TEXT;
ALTER TABLE faq_submissions ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE faq_submissions ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE faq_submissions ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE faq_submissions ADD COLUMN IF NOT EXISTS "category" TEXT;
ALTER TABLE faq_submissions ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'pending';
ALTER TABLE faq_submissions ADD COLUMN IF NOT EXISTS "userAgent" TEXT;
ALTER TABLE faq_submissions ADD COLUMN IF NOT EXISTS "ip" TEXT;
ALTER TABLE faq_submissions ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ClassGroup
ALTER TABLE class_groups ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE class_groups ADD COLUMN IF NOT EXISTS "teacherId" TEXT;
ALTER TABLE class_groups ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE class_groups ADD COLUMN IF NOT EXISTS "isPrivate" BOOLEAN DEFAULT FALSE;
ALTER TABLE class_groups ADD COLUMN IF NOT EXISTS "inviteCode" TEXT;
ALTER TABLE class_groups ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE class_groups ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ClassGroupMember
ALTER TABLE class_group_members ADD COLUMN IF NOT EXISTS "groupId" TEXT;
ALTER TABLE class_group_members ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE class_group_members ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'student';
ALTER TABLE class_group_members ADD COLUMN IF NOT EXISTS "joinedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ClassMessage
ALTER TABLE class_messages ADD COLUMN IF NOT EXISTS "groupId" TEXT;
ALTER TABLE class_messages ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE class_messages ADD COLUMN IF NOT EXISTS "content" TEXT;
ALTER TABLE class_messages ADD COLUMN IF NOT EXISTS "type" TEXT DEFAULT 'text';
ALTER TABLE class_messages ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- QuestionHistory
ALTER TABLE question_history ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE question_history ADD COLUMN IF NOT EXISTS "questionId" TEXT;
ALTER TABLE question_history ADD COLUMN IF NOT EXISTS "answeredAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE question_history ADD COLUMN IF NOT EXISTS "correct" BOOLEAN;
ALTER TABLE question_history ADD COLUMN IF NOT EXISTS "eloAtMoment" INTEGER;

-- ClassJoinRequest
ALTER TABLE class_join_requests ADD COLUMN IF NOT EXISTS "studentId" TEXT;
ALTER TABLE class_join_requests ADD COLUMN IF NOT EXISTS "teacherId" TEXT;
ALTER TABLE class_join_requests ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'pending';
ALTER TABLE class_join_requests ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE class_join_requests ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- CoursePracticeHistory
ALTER TABLE course_practice_history ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE course_practice_history ADD COLUMN IF NOT EXISTS "courseId" TEXT;
ALTER TABLE course_practice_history ADD COLUMN IF NOT EXISTS "score" INTEGER;
ALTER TABLE course_practice_history ADD COLUMN IF NOT EXISTS "questionsCount" INTEGER;
ALTER TABLE course_practice_history ADD COLUMN IF NOT EXISTS "correctAnswers" INTEGER;
ALTER TABLE course_practice_history ADD COLUMN IF NOT EXISTS "timeSpentSeconds" INTEGER;
ALTER TABLE course_practice_history ADD COLUMN IF NOT EXISTS "difficultyLevel" INTEGER;
ALTER TABLE course_practice_history ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE course_practice_history ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Course (si elle existe)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') THEN
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS "title" TEXT;
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS "slug" TEXT;
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS "description" TEXT;
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS "content" TEXT;
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS "difficulty" INTEGER;
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS "order" INTEGER;
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS "isPublished" BOOLEAN DEFAULT TRUE;
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS "relatedTypes" TEXT;
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Foreign keys finales (supprimer et recréer)
ALTER TABLE teacher_requests DROP CONSTRAINT IF EXISTS teacher_requests_userid_fkey;
ALTER TABLE teacher_requests ADD CONSTRAINT teacher_requests_userid_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE class_groups DROP CONSTRAINT IF EXISTS class_groups_teacherid_fkey;
ALTER TABLE class_groups ADD CONSTRAINT class_groups_teacherid_fkey FOREIGN KEY ("teacherId") REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE class_group_members DROP CONSTRAINT IF EXISTS class_group_members_groupid_fkey;
ALTER TABLE class_group_members DROP CONSTRAINT IF EXISTS class_group_members_userid_fkey;
ALTER TABLE class_group_members ADD CONSTRAINT class_group_members_groupid_fkey FOREIGN KEY ("groupId") REFERENCES class_groups(id) ON DELETE CASCADE;
ALTER TABLE class_group_members ADD CONSTRAINT class_group_members_userid_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE class_messages DROP CONSTRAINT IF EXISTS class_messages_groupid_fkey;
ALTER TABLE class_messages DROP CONSTRAINT IF EXISTS class_messages_userid_fkey;
ALTER TABLE class_messages ADD CONSTRAINT class_messages_groupid_fkey FOREIGN KEY ("groupId") REFERENCES class_groups(id) ON DELETE CASCADE;
ALTER TABLE class_messages ADD CONSTRAINT class_messages_userid_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE question_history DROP CONSTRAINT IF EXISTS question_history_userid_fkey;
ALTER TABLE question_history ADD CONSTRAINT question_history_userid_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE class_join_requests DROP CONSTRAINT IF EXISTS class_join_requests_studentid_fkey;
ALTER TABLE class_join_requests DROP CONSTRAINT IF EXISTS class_join_requests_teacherid_fkey;
ALTER TABLE class_join_requests ADD CONSTRAINT class_join_requests_studentid_fkey FOREIGN KEY ("studentId") REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE class_join_requests ADD CONSTRAINT class_join_requests_teacherid_fkey FOREIGN KEY ("teacherId") REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE course_practice_history DROP CONSTRAINT IF EXISTS course_practice_history_userid_fkey;
ALTER TABLE course_practice_history DROP CONSTRAINT IF EXISTS course_practice_history_courseid_fkey;
ALTER TABLE course_practice_history ADD CONSTRAINT course_practice_history_userid_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') THEN
    ALTER TABLE course_practice_history ADD CONSTRAINT course_practice_history_courseid_fkey FOREIGN KEY ("courseId") REFERENCES courses(id) ON DELETE CASCADE;
  END IF;
END $$;
