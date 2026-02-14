'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft, Bell, Users, Swords, Volume2, Palette, 
  Check
} from 'lucide-react';

// Local storage hooks that work without contexts
function useLocalNotifSettings() {
  const [settings, setSettings] = useState(() => {
    if (typeof window === 'undefined') {
      return { friendRequests: true, challenges: true };
    }
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved) : { friendRequests: true, challenges: true };
  });

  const updateSettings = (newSettings: Partial<typeof settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('notificationSettings', JSON.stringify(updated));
    }
  };

  return { settings, updateSettings };
}

function useLocalPrefs() {
  const [preferences, setPreferences] = useState(() => {
    if (typeof window === 'undefined') {
      return { soundEffects: true, animations: true, showTimer: true, difficulty: 'adaptive' };
    }
    const saved = localStorage.getItem('mathcom-preferences');
    return saved ? JSON.parse(saved) : { soundEffects: true, animations: true, showTimer: true, difficulty: 'adaptive' };
  });

  const setPref = (key: string, value: any) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mathcom-preferences', JSON.stringify(updated));
    }
  };

  return { preferences, setPref };
}

export default function SettingsPage() {
  const { settings: notifSettings, updateSettings: updateNotifSettings } = useLocalNotifSettings();
  const { preferences, setPref } = useLocalPrefs();
  const [saved, setSaved] = useState(false);

  const handleNotifChange = (key: 'friendRequests' | 'challenges', value: boolean) => {
    updateNotifSettings({ [key]: value });
    showSaved();
  };

  const handlePrefChange = (key: 'soundEffects' | 'animations', value: boolean) => {
    setPref(key, value);
    showSaved();
  };

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-white">
      <header className="border-b border-border bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">Paramètres</h1>
          {saved && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="ml-auto text-sm text-green-400 flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              Sauvegardé
            </motion.span>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Notifications */}
        <section className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Notifications</h2>
              <p className="text-sm text-muted-foreground">Gère les notifications en temps réel</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#1a1a2e] rounded-xl">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-green-400" />
                <div>
                  <p className="font-medium">Demandes d'ami</p>
                  <p className="text-sm text-muted-foreground">Notifier quand quelqu'un t'envoie une demande</p>
                </div>
              </div>
              <button
                onClick={() => handleNotifChange('friendRequests', !notifSettings.friendRequests)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  notifSettings.friendRequests ? 'bg-indigo-500' : 'bg-gray-600'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                  notifSettings.friendRequests ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#1a1a2e] rounded-xl">
              <div className="flex items-center gap-3">
                <Swords className="w-5 h-5 text-red-400" />
                <div>
                  <p className="font-medium">Défis</p>
                  <p className="text-sm text-muted-foreground">Notifier quand quelqu'un te défie</p>
                </div>
              </div>
              <button
                onClick={() => handleNotifChange('challenges', !notifSettings.challenges)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  notifSettings.challenges ? 'bg-indigo-500' : 'bg-gray-600'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                  notifSettings.challenges ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>
          </div>
        </section>

        {/* Sound & Display */}
        <section className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Son et affichage</h2>
              <p className="text-sm text-muted-foreground">Personnalise ton expérience</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#1a1a2e] rounded-xl">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="font-medium">Effets sonores</p>
                  <p className="text-sm text-muted-foreground">Sons lors des interactions</p>
                </div>
              </div>
              <button
                onClick={() => handlePrefChange('soundEffects', !preferences.soundEffects)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  preferences.soundEffects ? 'bg-indigo-500' : 'bg-gray-600'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                  preferences.soundEffects ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#1a1a2e] rounded-xl">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-pink-400" />
                <div>
                  <p className="font-medium">Animations</p>
                  <p className="text-sm text-muted-foreground">Animations fluides dans l'interface</p>
                </div>
              </div>
              <button
                onClick={() => handlePrefChange('animations', !preferences.animations)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  preferences.animations ? 'bg-indigo-500' : 'bg-gray-600'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                  preferences.animations ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
