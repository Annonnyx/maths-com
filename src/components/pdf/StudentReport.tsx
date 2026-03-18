'use client';

import { 
  Page, 
  Text, 
  View, 
  Document, 
  StyleSheet, 
  PDFDownloadLink,
  Font,
  Image,
  Line,
  Svg,
  Rect,
  Path
} from '@react-pdf/renderer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Enregistrer les polices (nécessite des fichiers .ttf dans public/fonts/)
Font.register({
  family: 'Inter',
  src: '/fonts/Inter-Regular.ttf'
});

Font.register({
  family: 'Inter-Bold',
  src: '/fonts/Inter-Bold.ttf'
});

interface StudentReportProps {
  student: {
    firstName: string;
    lastName: string;
    class: string;
    rank: string;
    elo: number;
  };
  stats: {
    periodStart: string;
    periodEnd: string;
    totalSessions: number;
    totalTime: number;
    globalSuccessRate: number;
    weeklyTime: number;
    lastLogin: string;
    eloProgression: Array<{ date: string; elo: number }>;
    subjectPerformance: Array<{
      subject: string;
      successRate: number;
      progression: number;
      totalQuestions: number;
    }>;
    recentCourses: Array<{
      title: string;
      completedAt: string;
      duration: number;
    }>;
    recentTrainings: Array<{
      type: string;
      score: number;
      completedAt: string;
    }>;
    badges: Array<{
      name: string;
      description: string;
      earnedAt: string;
    }>;
  };
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Inter',
    color: '#333'
  },
  header: {
    marginBottom: 30,
    borderBottom: '1 solid #e5e7eb',
    paddingBottom: 20
  },
  logo: {
    position: 'absolute',
    top: 40,
    right: 40,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'Inter-Bold',
    color: '#1f2937'
  },
  subtitle: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 20
  },
  grid: {
    display: 'flex',
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20
  },
  col: {
    flex: 1
  },
  label: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 4
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold'
  },
  section: {
    marginBottom: 30
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
    borderBottom: '1 solid #e5e7eb',
    paddingBottom: 8
  },
  table: {
    width: '100%',
    border: '1 solid #e5e7eb',
    marginBottom: 20
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
    borderBottom: '1 solid #e5e7eb',
    padding: 8,
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold'
  },
  tableRow: {
    borderBottom: '1 solid #e5e7eb',
    padding: 8,
    fontSize: 10
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 4
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6'
  },
  badge: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '4 8',
    borderRadius: 4,
    fontSize: 9,
    marginBottom: 4
  },
  recommendationBox: {
    backgroundColor: '#f9fafb',
    border: '1 solid #e5e7eb',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15
  },
  recommendationTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
    color: '#1f2937'
  },
  recommendationText: {
    fontSize: 10,
    color: '#4b5563',
    marginBottom: 4
  },
  commentArea: {
    border: '1 solid #d1d5db',
    borderRadius: 4,
    height: 60,
    padding: 8,
    marginTop: 10
  },
  chartPlaceholder: {
    height: 150,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  }
});

export default function StudentReport({ student, stats }: StudentReportProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const getTopSubjects = (type: 'best' | 'worst') => {
    const sorted = [...stats.subjectPerformance].sort((a, b) => 
      type === 'best' ? b.successRate - a.successRate : a.successRate - b.successRate
    );
    return sorted.slice(0, 2);
  };

  const getNextRank = (currentRank: string) => {
    const ranks = ['Débutant', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+'];
    const currentIndex = ranks.indexOf(currentRank);
    return currentIndex < ranks.length - 1 ? ranks[currentIndex + 1] : currentRank;
  };

  return (
    <Document>
      {/* PAGE 1 - Résumé */}
      <Page size="A4" style={styles.page}>
        <View style={styles.logo}>
          maths-app.com
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>
            Rapport de progression — {student.firstName} {student.lastName}
          </Text>
          <Text style={styles.subtitle}>
            Généré le {formatDate(new Date().toISOString())}
          </Text>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>Classe</Text>
              <Text style={styles.value}>{student.class}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Rang actuel</Text>
              <Text style={styles.value}>{student.rank}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>ELO actuel</Text>
              <Text style={styles.value}>{student.elo}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Période d'analyse</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text>Période couverte</Text>
              <Text>Total de sessions</Text>
              <Text>Temps total</Text>
              <Text>Taux de réussite global</Text>
            </View>
            <View style={styles.tableRow}>
              <Text>{formatDate(stats.periodStart)} - {formatDate(stats.periodEnd)}</Text>
              <Text>{stats.totalSessions}</Text>
              <Text>{formatTime(stats.totalTime)}</Text>
              <Text>{stats.globalSuccessRate}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aperçu des performances</Text>
          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>Temps cette semaine</Text>
              <Text style={styles.value}>{formatTime(stats.weeklyTime)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Dernière connexion</Text>
              <Text style={styles.value}>{formatDate(stats.lastLogin)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Badges obtenus</Text>
              <Text style={styles.value}>{stats.badges.length}</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* PAGE 2 - Progression */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Progression ELO</Text>
          <Text style={styles.subtitle}>
            Évolution sur les 30 derniers jours
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.chartPlaceholder}>
            <Text>Courbe de progression ELO</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance par domaine</Text>
          {stats.subjectPerformance.map((subject, index) => (
            <View key={index} style={{ marginBottom: 15 }}>
              <View style={styles.grid}>
                <View style={styles.col}>
                  <Text style={styles.value}>{subject.subject}</Text>
                  <Text style={styles.label}>{subject.totalQuestions} questions</Text>
                </View>
                <View style={styles.col}>
                  <Text style={styles.value}>{subject.successRate}%</Text>
                  <Text style={{ fontSize: 10, color: subject.progression > 0 ? '#10b981' : '#ef4444' }}>
                    {subject.progression > 0 ? '+' : ''}{subject.progression}%
                  </Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View style={{ 
                  ...styles.progressFill, 
                  width: `${subject.successRate}%` 
                }} />
              </View>
            </View>
          ))}
        </View>
      </Page>

      {/* PAGE 3 - Détail des activités */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Détail des activités</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cours récemment consultés</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text>Cours</Text>
              <Text>Date</Text>
              <Text>Durée</Text>
            </View>
            {stats.recentCourses.map((course, index) => (
              <View key={index} style={styles.tableRow}>
                <Text>{course.title}</Text>
                <Text>{formatDate(course.completedAt)}</Text>
                <Text>{formatTime(course.duration)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10 dernières sessions d'entraînement</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text>Type</Text>
              <Text>Score</Text>
              <Text>Date</Text>
            </View>
            {stats.recentTrainings.slice(0, 10).map((training, index) => (
              <View key={index} style={styles.tableRow}>
                <Text>{training.type}</Text>
                <Text>{training.score}%</Text>
                <Text>{formatDate(training.completedAt)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badges et récompenses</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {stats.badges.map((badge, index) => (
              <View key={index} style={styles.badge}>
                <Text>{badge.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>

      {/* PAGE 4 - Recommandations */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Recommandations personnalisées</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.recommendationBox}>
            <Text style={styles.recommendationTitle}>🎯 Points forts</Text>
            {getTopSubjects('best').map((subject, index) => (
              <Text key={index} style={styles.recommendationText}>
                • {subject.subject} : {subject.successRate}% de réussite
              </Text>
            ))}
          </View>

          <View style={styles.recommendationBox}>
            <Text style={styles.recommendationTitle}>📚 À travailler</Text>
            {getTopSubjects('worst').map((subject, index) => (
              <Text key={index} style={styles.recommendationText}>
                • {subject.subject} : {subject.successRate}% de réussite
              </Text>
            ))}
          </View>

          <View style={styles.recommendationBox}>
            <Text style={styles.recommendationTitle}>🚀 Objectif suggéré</Text>
            <Text style={styles.recommendationText}>
              Atteindre le rang {getNextRank(student.rank)} pour progresser dans le classement.
            </Text>
            <Text style={styles.recommendationText}>
              Continuez votre travail régulier pour maintenir votre progression !
            </Text>
          </View>

          <View style={styles.recommendationBox}>
            <Text style={styles.recommendationTitle}>📝 Commentaires du professeur</Text>
            <View style={styles.commentArea}>
              <Text style={{ fontSize: 10, color: '#9ca3af' }}>
                (Zone à remplir à la main par le professeur)
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
