'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, Users, CheckCircle, AlertCircle, Clock } from 'lucide-react';

function JoinClassContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const inviteCode = searchParams.get('code');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [classInfo, setClassInfo] = useState<any>(null);

  useEffect(() => {
    if (!inviteCode) {
      setError('Code d\'invitation manquant');
      setLoading(false);
      return;
    }

    // Vérifier le code et récupérer les infos de la classe
    const fetchClassInfo = async () => {
      try {
        const response = await fetch(`/api/class-groups/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inviteCode })
        });

        const data = await response.json();
        
        if (response.ok) {
          if (data.needsApproval) {
            // Classe privée - demande envoyée en attente
            setClassInfo({
              name: data.member.group.name,
              teacher: data.member.group.teacher,
              needsApproval: true
            });
            setSuccess(true);
          } else {
            // Classe publique - rejointe directement
            setClassInfo({
              name: data.member.group.name,
              teacher: data.member.group.teacher,
              needsApproval: false
            });
            setSuccess(true);
          }
        } else {
          setError(data.error || 'Code invalide');
        }
      } catch (error) {
        setError('Erreur lors de la connexion');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchClassInfo();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [inviteCode, status]);

  const handleLogin = () => {
    router.push(`/login?callbackUrl=${encodeURIComponent(window.location.href)}`);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="max-w-md mx-4">
          <div className="bg-[#1a1a2a] rounded-xl border border-[#2a2a3a] p-6 text-center">
            <Users className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Rejoindre une classe</h1>
            <p className="text-muted-foreground mb-6">
              Vous devez être connecté pour rejoindre une classe
            </p>
            <button
              onClick={handleLogin}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Se connecter
            </button>
            <Link href="/class-management" className="block mt-3 text-purple-400 hover:text-purple-300">
              Retour à la gestion des classes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="max-w-md mx-4">
          <div className="bg-[#1a1a2a] rounded-xl border border-[#2a2a3a] p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Code invalide</h1>
            <p className="text-muted-foreground mb-6">
              {error}
            </p>
            <Link href="/class-management" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Retour à la gestion des classes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success && classInfo) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="max-w-md mx-4">
          <div className="bg-[#1a1a2a] rounded-xl border border-[#2a2a3a] p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">
              {classInfo.needsApproval ? 'Demande envoyée !' : 'Classe rejointe !'}
            </h1>
            <div className="bg-[#2a2a3a] rounded-lg p-4 mb-6">
              <h2 className="font-semibold text-lg mb-2">{classInfo.name}</h2>
              <p className="text-sm text-muted-foreground">
                Professeur: {classInfo.teacher.displayName}
              </p>
            </div>
            <p className="text-muted-foreground mb-6">
              {classInfo.needsApproval 
                ? 'Votre demande a été envoyée au professeur. Vous recevrez une notification dès qu\'elle sera acceptée.'
                : 'Vous avez rejoint cette classe avec succès !'
              }
            </p>
            <Link href="/class-management" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Retour à la gestion des classes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function JoinClassPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    }>
      <JoinClassContent />
    </Suspense>
  );
}
