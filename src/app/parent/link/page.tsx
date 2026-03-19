'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft,
  UserPlus,
  Shield
} from 'lucide-react';

function ParentLinkContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [childInfo, setChildInfo] = useState<any>(null);

  useEffect(() => {
    if (status === 'authenticated' && (session.user as any).role === 'parent') {
      if (code) {
        validateCode();
      }
    } else if (status === 'authenticated' && (session.user as any).role !== 'parent') {
      setError('Ce lien est destiné aux comptes parents uniquement.');
    }
  }, [status, session, code]);

  const validateCode = async () => {
    if (!code.trim()) {
      setError('Veuillez entrer un code d\'invitation.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/parent/validate-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: code.trim().toUpperCase() })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Code invalide ou expiré.');
        return;
      }

      setChildInfo(data.child);
      setSuccess(true);
    } catch (error) {
      console.error('Error validating code:', error);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    router.push(`/register?role=parent&redirect=/parent/link?code=${code}`);
  };

  const handleLogin = () => {
    router.push(`/login?redirect=/parent/link?code=${code}`);
  };

  const goToDashboard = () => {
    router.push('/dashboard/parent');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Lier un compte parent
          </h1>
          <p className="text-gray-600">
            Connectez-vous pour suivre la progression de votre enfant
          </p>
        </div>

        {!session ? (
          // Non connecté
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5" />
                <span>Rejoindre votre enfant</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {code && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-center">
                    <p className="text-sm text-blue-800 mb-2">Code d'invitation :</p>
                    <div className="text-xl font-mono font-bold text-blue-600 tracking-wider">
                      {code}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                    Code d'invitation
                  </label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Entrez le code à 8 caractères"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    maxLength={8}
                    className="font-mono text-center text-lg tracking-wider"
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <Button 
                    onClick={validateCode} 
                    disabled={loading || !code.trim()}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Validation...
                      </>
                    ) : (
                      'Valider le code'
                    )}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Ou</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={handleLogin}>
                      Se connecter
                    </Button>
                    <Button variant="outline" onClick={handleCreateAccount}>
                      Créer un compte
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : success ? (
          // Succès
          <Card className="bg-white shadow-sm">
            <CardContent className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Lien créé avec succès !
              </h2>
              <p className="text-gray-600 mb-6">
                Vous suivez maintenant la progression de :
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      {childInfo?.firstName} {childInfo?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{childInfo?.class}</div>
                  </div>
                </div>
              </div>

              <Button onClick={goToDashboard} className="w-full">
                Accéder au tableau de bord
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Connecté mais échec
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span>Erreur de liaison</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard/parent')}
                  className="mr-3"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour au tableau de bord
                </Button>
                <Button onClick={() => {
                  setError('');
                  setSuccess(false);
                }}>
                  Réessayer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {!session && (
          <Card className="bg-blue-50 border-blue-200 mt-6">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <h4 className="font-medium mb-2">Comment ça marche ?</h4>
                  <ol className="space-y-1 list-decimal list-inside">
                    <li>Demandez le code d'invitation à votre enfant</li>
                    <li>Entrez le code ci-dessus</li>
                    <li>Créez un compte parent ou connectez-vous</li>
                    <li>Accédez au tableau de bord pour suivre sa progression</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function ParentLinkPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ParentLinkContent />
    </Suspense>
  );
}
