'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, GraduationCap, Plus, Check } from 'lucide-react';

interface ClassData {
  name: string;
  description: string;
  level: string;
  subject: string;
  maxStudents: number;
  isPrivate: boolean;
}

const levels = [
  { value: '6eme', label: '6ème' },
  { value: '5eme', label: '5ème' },
  { value: '4eme', label: '4ème' },
  { value: '3eme', label: '3ème' },
  { value: '2nde', label: '2nde' },
  { value: '1ere', label: '1ère' },
  { value: 'Term', label: 'Terminale' },
];

const subjects = [
  { value: 'maths', label: 'Mathématiques' },
  { value: 'physique', label: 'Physique-Chimie' },
  { value: 'svt', label: 'SVT' },
  { value: 'français', label: 'Français' },
  { value: 'histoire', label: 'Histoire-Géographie' },
  { value: 'anglais', label: 'Anglais' },
  { value: 'espagnol', label: 'Espagnol' },
  { value: 'allemand', label: 'Allemand' },
];

export default function CreateClassPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [classData, setClassData] = useState<ClassData>({
    name: '',
    description: '',
    level: '',
    subject: '',
    maxStudents: 30,
    isPrivate: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/class-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classData),
      });

      if (response.ok) {
        router.push('/class-management');
      } else {
        alert('Erreur lors de la création de la classe');
      }
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold">Créer une classe</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Form */}
          <div className="p-6 bg-[#12121a] rounded-2xl border border-border">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-purple-400" />
                  Informations de base
                </h2>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Nom de la classe *</label>
                  <input
                    type="text"
                    required
                    value={classData.name}
                    onChange={(e) => setClassData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 bg-[#2a2a3a] border border-border rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="Ex: Classe de 4ème Maths"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={classData.description}
                    onChange={(e) => setClassData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2 bg-[#2a2a3a] border border-border rounded-lg focus:border-purple-500 focus:outline-none h-24 resize-none"
                    placeholder="Description optionnelle de la classe..."
                  />
                </div>
              </div>

              {/* Class Details */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Détails de la classe
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Niveau *</label>
                    <select
                      required
                      value={classData.level}
                      onChange={(e) => setClassData(prev => ({ ...prev, level: e.target.value }))}
                      className="w-full px-4 py-2 bg-[#2a2a3a] border border-border rounded-lg focus:border-purple-500 focus:outline-none"
                    >
                      <option value="">Sélectionner un niveau</option>
                      {levels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Matière *</label>
                    <select
                      required
                      value={classData.subject}
                      onChange={(e) => setClassData(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-4 py-2 bg-[#2a2a3a] border border-border rounded-lg focus:border-purple-500 focus:outline-none"
                    >
                      <option value="">Sélectionner une matière</option>
                      {subjects.map((subject) => (
                        <option key={subject.value} value={subject.value}>
                          {subject.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nombre maximum d'élèves: {classData.maxStudents}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={classData.maxStudents}
                    onChange={(e) => setClassData(prev => ({ ...prev, maxStudents: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>5</span>
                    <span>50</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="private"
                    checked={classData.isPrivate}
                    onChange={(e) => setClassData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 bg-[#2a2a3a] border border-border rounded focus:ring-purple-500"
                  />
                  <label htmlFor="private" className="text-sm">
                    Classe privée (uniquement sur invitation)
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !classData.name || !classData.level || !classData.subject}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Créer la classe
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
