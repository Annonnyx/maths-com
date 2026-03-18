'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Clock, 
  TrendingUp, 
  BookOpen, 
  Target,
  Calendar,
  Award,
  Download,
  Users
} from 'lucide-react';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  class: string;
  rank: string;
  elo: number;
  weeklyTime: number;
  successRate: number;
  lastLogin: string;
  recentCourses: Array<{
    id: string;
    title: string;
    completedAt: string;
    duration: number;
  }>;
  recentTrainings: Array<{
    id: string;
    type: string;
    score: number;
    completedAt: string;
  }>;
  eloProgression: Array<{
    date: string;
    elo: number;
  }>;
  subjectPerformance: Array<{
    subject: string;
    successRate: number;
    progression: number;
    totalQuestions: number;
  }>;
}

export default function ParentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'parent') {
      router.push('/dashboard');
      return;
    }

    if (status === 'authenticated') {
      fetchChildren();
    }
  }, [status, session, router]);

  const fetchChildren = async () => {
    try {
      const response = await fetch('/api/parent/children');
      if (!response.ok) throw new Error('Failed to fetch children');
      const data = await response.json();
      setChildren(data);
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePdfReport = async (childId: string, childName: string) => {
    setGeneratingPdf(childId);
    try {
      const response = await fetch(`/api/reports/student/${childId}`);
      if (!response.ok) throw new Error('Failed to generate report');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const date = new Date().toISOString().split('T')[0];
      a.download = `rapport_${childName.toLowerCase().replace(' ', '-')}_${date}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setGeneratingPdf(null);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tableau de bord parent
          </h1>
          <p className="text-gray-600">
            Suivez la progression de {children.length} enfant{children.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Children Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {children.map((child) => (
            <Card key={child.id} className="bg-white shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {child.firstName} {child.lastName}
                      </CardTitle>
                      <p className="text-sm text-gray-500">{child.class}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-sm">
                      {child.rank}
                    </Badge>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">{child.elo}</div>
                      <div className="text-xs text-gray-500">ELO</div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mx-auto mb-1">
                      <Clock className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-sm font-medium">{formatTime(child.weeklyTime)}</div>
                    <div className="text-xs text-gray-500">Cette semaine</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mx-auto mb-1">
                      <Target className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-sm font-medium">{child.successRate}%</div>
                    <div className="text-xs text-gray-500">Réussite</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full mx-auto mb-1">
                      <Calendar className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-sm font-medium">{formatDate(child.lastLogin)}</div>
                    <div className="text-xs text-gray-500">Dernière connexion</div>
                  </div>
                </div>

                {/* ELO Progression */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Progression ELO (30 jours)</h4>
                  <div className="h-24 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-1" />
                      <p className="text-sm text-blue-600">Courbe de progression</p>
                    </div>
                  </div>
                </div>

                {/* Subject Performance */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Performance par matière</h4>
                  <div className="space-y-2">
                    {child.subjectPerformance.map((subject) => (
                      <div key={subject.subject} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{subject.subject}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={subject.successRate} className="w-20 h-2" />
                          <span className="text-sm font-medium">{subject.successRate}%</span>
                          {subject.progression > 0 && (
                            <Badge variant="outline" className="text-xs text-green-600">
                              +{subject.progression}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activities */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Activités récentes</h4>
                  <div className="space-y-2">
                    {child.recentTrainings.slice(0, 3).map((training) => (
                      <div key={training.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{training.type}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={training.score >= 80 ? "default" : training.score >= 60 ? "secondary" : "destructive"}>
                            {training.score}%
                          </Badge>
                          <span className="text-xs text-gray-500">{formatDate(training.completedAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Export Button */}
                <div className="pt-4 border-t">
                  <Button
                    onClick={() => generatePdfReport(child.id, `${child.firstName} ${child.lastName}`)}
                    disabled={generatingPdf === child.id}
                    className="w-full"
                  >
                    {generatingPdf === child.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Génération du PDF...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Exporter le rapport PDF
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {children.length === 0 && (
          <Card className="bg-white shadow-sm">
            <CardContent className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun enfant lié
              </h3>
              <p className="text-gray-600 mb-4">
                Vous n'avez pas encore lié de compte d'enfant au vôtre.
              </p>
              <p className="text-sm text-gray-500">
                Demandez à votre enfant de générer un code d'invitation depuis ses paramètres.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
