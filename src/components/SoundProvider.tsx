'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface SoundContextType {
  isMuted: boolean;
  playSound: (type: SoundType) => void;
  toggleMute: () => void;
  volume: number;
  setVolume: (volume: number) => void;
}

type SoundType = 'correct' | 'incorrect' | 'click' | 'hover' | 'complete' | 'levelUp' | 'tick';

const SoundContext = createContext<SoundContextType | undefined>(undefined);

// Simple synthesized sounds using Web Audio API
const createOscillator = (frequency: number, type: OscillatorType, duration: number, audioContext: AudioContext) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = type;
  
  // Discrete, soft envelope
  gainNode.gain.setValueAtTime(0.18, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
};

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const initAudioContext = useCallback(() => {
    if (!audioContext && typeof window !== 'undefined') {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
    }
  }, [audioContext]);

  const playSound = useCallback((type: SoundType) => {
    if (isMuted || typeof window === 'undefined') return;
    
    initAudioContext();
    if (!audioContext) return;

    // Resume context if suspended (browser policy)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    switch (type) {
      case 'correct':
        // Success sound: very soft ascending two-tone
        createOscillator(523.25, 'sine', 0.10, audioContext); // C5
        setTimeout(() => createOscillator(659.25, 'sine', 0.12, audioContext), 70); // E5
        break;
      
      case 'incorrect':
        // Error sound: short, low-pitch blip (less harsh)
        createOscillator(220, 'triangle', 0.10, audioContext);
        setTimeout(() => createOscillator(180, 'triangle', 0.10, audioContext), 60);
        break;
      
      case 'click':
        // UI click: subtle short tick
        createOscillator(750, 'square', 0.03, audioContext);
        break;
      
      case 'hover':
        // Subtle hover
        createOscillator(420, 'sine', 0.025, audioContext);
        break;
      
      case 'complete':
        // Victory fanfare
        createOscillator(523.25, 'square', 0.1, audioContext);
        setTimeout(() => createOscillator(659.25, 'square', 0.1, audioContext), 100);
        setTimeout(() => createOscillator(783.99, 'square', 0.1, audioContext), 200);
        setTimeout(() => createOscillator(1046.50, 'square', 0.4, audioContext), 300);
        break;
      
      case 'levelUp':
        // Level up: arpeggio
        createOscillator(440, 'triangle', 0.1, audioContext);
        setTimeout(() => createOscillator(554, 'triangle', 0.1, audioContext), 100);
        setTimeout(() => createOscillator(659, 'triangle', 0.1, audioContext), 200);
        setTimeout(() => createOscillator(880, 'triangle', 0.4, audioContext), 300);
        break;
      
      case 'tick':
        // Timer tick
        createOscillator(1000, 'sine', 0.02, audioContext);
        break;
    }
  }, [audioContext, isMuted, initAudioContext]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return (
    <SoundContext.Provider value={{ isMuted, playSound, toggleMute, volume, setVolume }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}
