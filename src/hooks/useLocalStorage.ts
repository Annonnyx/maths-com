'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseLocalStorageProps<T> {
  key: string;
  initialValue: T;
}

export function useLocalStorage<T>({ key, initialValue }: UseLocalStorageProps<T>) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.error('Error reading from localStorage:', error);
      }
      setIsLoaded(true);
    }
  }, [key]);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue, isLoaded] as const;
}

// Hook for test state management
export function useTestState() {
  const [currentTest, setCurrentTest] = useLocalStorage({
    key: 'mathcom-current-test',
    initialValue: null as any
  });

  const clearTest = useCallback(() => {
    setCurrentTest(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mathcom-current-test');
    }
  }, [setCurrentTest]);

  return { currentTest, setCurrentTest, clearTest };
}

// Hook for user preferences
export function useUserPreferences() {
  const [preferences, setPreferences] = useLocalStorage({
    key: 'mathcom-preferences',
    initialValue: {
      soundEffects: true,
      animations: true,
      showTimer: true,
      difficulty: 'adaptive' as const,
      friendRequests: true,
      challenges: true,
      disableGeometry: false, // New option to disable geometry questions
      preferredClass: null as string | null // Preferred class for training mode
    }
  });

  return { preferences, setPreferences };
}

// Hook for tracking progress locally
export function useLocalProgress() {
  const [progress, setProgress, isLoaded] = useLocalStorage({
    key: 'mathcom-progress',
    initialValue: {
      soloElo: 400,
      soloRankClass: 'F-',
      totalTests: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      soloCurrentStreak: 0,
      soloBestStreak: 0,
      tests: [] as any[]
    }
  });

  const addTestResult = useCallback((result: {
    score: number;
    correct: number;
    total: number;
    eloChange: number;
    date: string;
  }) => {
    setProgress(prev => {
      const newElo = Math.max(0, prev.soloElo + result.eloChange);
      const newStreak = result.score >= 80 ? prev.soloCurrentStreak + 1 : 0;
      
      return {
        ...prev,
        soloElo: newElo,
        totalTests: prev.totalTests + 1,
        totalCorrect: prev.totalCorrect + result.correct,
        totalQuestions: prev.totalQuestions + result.total,
        soloCurrentStreak: newStreak,
        soloBestStreak: Math.max(prev.soloBestStreak, newStreak),
        tests: [...prev.tests.slice(-49), result] // Keep last 50 tests
      };
    });
  }, [setProgress]);

  return { progress, addTestResult, isLoaded };
}
