import { createClient } from '@supabase/supabase-js';
import { Exercise, QuestionHistory, generateAdaptiveQuestion, calculateEloChange } from './adaptive-exercises';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export class AdaptiveExerciseManager {
  private userId: string | null = null;
  private questionHistory: QuestionHistory[] = [];
  private recentPerformance: { correct: boolean; time: number }[] = [];

  constructor(userId: string | null = null) {
    this.userId = userId;
  }

  // Initialize manager with user data
  async initialize(userId: string): Promise<void> {
    this.userId = userId;
    await this.loadQuestionHistory(userId);
  }

  // Load question history from database
  private async loadQuestionHistory(userId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('question_history')
        .select('*')
        .eq('user_id', userId)
        .order('answered_at', { ascending: false })
        .limit(50); // Load last 50 questions

      if (error) {
        console.error('Error loading question history:', error);
        return;
      }

      this.questionHistory = data?.map(item => ({
        question_id: item.questionId,
        answered_at: new Date(item.answeredAt),
        correct: item.correct,
        elo_at_moment: (item as any).eloAtMoment
      })) || [];
    } catch (error) {
      console.error('Error in loadQuestionHistory:', error);
    }
  }

  // Get current user ELO
  async getCurrentElo(): Promise<number> {
    if (!this.userId) return 400; // Default ELO

    try {
      const { data, error } = await supabase
        .from('users')
        .select('soloElo')
        .eq('id', this.userId)
        .single();

      if (error || !data) {
        console.error('Error fetching user ELO:', error);
        return 400;
      }

      return (data as any).soloElo;
    } catch (error) {
      console.error('Error in getCurrentElo:', error);
      return 400;
    }
  }

  // Generate next adaptive question
  async generateNextQuestion(): Promise<Exercise | null> {
    if (!this.userId) {
      console.error('User ID not set');
      return null;
    }

    const currentElo = await this.getCurrentElo();
    
    try {
      const exercise = generateAdaptiveQuestion(
        currentElo,
        this.questionHistory,
        this.recentPerformance
      );

      return exercise;
    } catch (error) {
      console.error('Error generating adaptive question:', error);
      return null;
    }
  }

  // Record answer and update ELO
  async recordAnswer(
    exercise: Exercise,
    userAnswer: string,
    responseTime: number
  ): Promise<{ success: boolean; eloChange: number; newElo: number }> {
    if (!this.userId) {
      return { success: false, eloChange: 0, newElo: 0 };
    }

    const isCorrect = userAnswer.trim() === exercise.answer.trim();
    const currentElo = await this.getCurrentElo();
    
    // Calculate ELO change
    const eloChange = calculateEloChange(
      currentElo,
      exercise.difficulty,
      isCorrect,
      responseTime
    );
    
    const newElo = Math.max(0, currentElo + eloChange);

    try {
      // Record question in history
      const { error: historyError } = await supabase
        .from('question_history')
        .insert({
          user_id: this.userId,
          question_id: exercise.id,
          answered_at: new Date().toISOString(),
          correct: isCorrect,
          elo_at_moment: currentElo
        });

      if (historyError) {
        console.error('Error recording question history:', historyError);
      }

      // Update user ELO
      const { error: eloError } = await supabase
        .from('users')
        .update({ elo: newElo })
        .eq('id', this.userId);

      if (eloError) {
        console.error('Error updating user ELO:', eloError);
      }

      // Update local data
      this.questionHistory.unshift({
        question_id: exercise.id,
        answered_at: new Date(),
        correct: isCorrect,
        elo_at_moment: currentElo
      });

      // Keep only last 50 questions in memory
      if (this.questionHistory.length > 50) {
        this.questionHistory = this.questionHistory.slice(0, 50);
      }

      // Update recent performance
      this.recentPerformance.push({
        correct: isCorrect,
        time: responseTime
      });

      // Keep only last 10 performances for adaptation
      if (this.recentPerformance.length > 10) {
        this.recentPerformance = this.recentPerformance.slice(-10);
      }

      return {
        success: true,
        eloChange,
        newElo
      };

    } catch (error) {
      console.error('Error in recordAnswer:', error);
      return { success: false, eloChange: 0, newElo: currentElo };
    }
  }

  // Generate adaptive test
  async generateAdaptiveTest(count: number = 20): Promise<Exercise[]> {
    if (!this.userId) {
      console.error('User ID not set');
      return [];
    }

    const currentElo = await this.getCurrentElo();
    const exercises: Exercise[] = [];

    for (let i = 0; i < count; i++) {
      const exercise = generateAdaptiveQuestion(
        currentElo,
        this.questionHistory,
        this.recentPerformance
      );

      if (exercise) {
        exercises.push(exercise);
      }
    }

    return exercises;
  }

  // Get user statistics
  async getUserStatistics(): Promise<{
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    averageResponseTime: number;
    currentElo: number;
    eloHistory: { date: string; elo: number }[];
  }> {
    if (!this.userId) {
      return {
        totalQuestions: 0,
        correctAnswers: 0,
        accuracy: 0,
        averageResponseTime: 0,
        currentElo: 400,
        eloHistory: []
      };
    }

    try {
      const currentElo = await this.getCurrentElo();
      const totalQuestions = this.questionHistory.length;
      const correctAnswers = this.questionHistory.filter(q => q.correct).length;
      const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

      // Get ELO history from question history
      const eloHistory = this.questionHistory
        .slice()
        .reverse()
        .map((q, index) => ({
          date: q.answered_at.toLocaleDateString(),
          elo: (q as any).eloAtMoment // Garder tel quel car c'est l'historique
        }));

      return {
        totalQuestions,
        correctAnswers,
        accuracy: Math.round(accuracy * 100) / 100,
        averageResponseTime: 0, // Would need to store response time in DB
        currentElo,
        eloHistory
      };
    } catch (error) {
      console.error('Error getting user statistics:', error);
      return {
        totalQuestions: 0,
        correctAnswers: 0,
        accuracy: 0,
        averageResponseTime: 0,
        currentElo: 400,
        eloHistory: []
      };
    }
  }

  // Clear question history (for testing)
  async clearHistory(): Promise<void> {
    if (!this.userId) return;

    try {
      const { error } = await supabase
        .from('question_history')
        .delete()
        .eq('user_id', this.userId);

      if (error) {
        console.error('Error clearing question history:', error);
      } else {
        this.questionHistory = [];
        this.recentPerformance = [];
      }
    } catch (error) {
      console.error('Error in clearHistory:', error);
    }
  }

  // Get recent question IDs for avoiding repetition
  getRecentQuestionIds(limit: number = 20): string[] {
    return this.questionHistory
      .slice(0, limit)
      .map(q => q.question_id);
  }

  // Check if question was recently seen
  isQuestionRecentlySeen(questionId: string, limit: number = 20): boolean {
    return this.getRecentQuestionIds(limit).includes(questionId);
  }
}

// Export singleton instance for easy usage
export const adaptiveExerciseManager = new AdaptiveExerciseManager();
