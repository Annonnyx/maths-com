'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Users, Clock, CheckCircle } from 'lucide-react';

interface InviteCode {
  code: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
}

export default function ParentInvite() {
  const [inviteCode, setInviteCode] = useState<InviteCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    fetchInviteCode();
  }, []);

  useEffect(() => {
    if (!inviteCode || inviteCode.used) return;

    const interval = setInterval(() => {
      updateTimeLeft();
    }, 1000);

    return () => clearInterval(interval);
  }, [inviteCode]);

  const fetchInviteCode = async () => {
    try {
      const response = await fetch('/api/parent/invite-code');
      if (!response.ok) return;
      
      const data = await response.json();
      if (data) {
        setInviteCode(data);
      }
    } catch (error) {
      console.error('Error fetching invite code:', error);
    }
  };

  const generateInviteCode = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/parent/invite-code', {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to generate code');
      
      const data = await response.json();
      setInviteCode(data);
    } catch (error) {
      console.error('Error generating invite code:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (!inviteCode) return;
    
    try {
      await navigator.clipboard.writeText(inviteCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying code:', error);
    }
  };

  const updateTimeLeft = () => {
    if (!inviteCode) return;
    
    const now = new Date();
    const expires = new Date(inviteCode.expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) {
      setTimeLeft('Expiré');
      return;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    setTimeLeft(`${hours}h ${minutes}min`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>Lier un compte parent</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!inviteCode ? (
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">
              Générez un code d'invitation pour permettre à un parent de suivre votre progression.
            </p>
            <Button onClick={generateInviteCode} disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Génération...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Générer un code
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {inviteCode.used ? (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Code déjà utilisé
                </h3>
                <p className="text-gray-600">
                  Un parent a déjà utilisé ce code pour lier son compte.
                </p>
                <Button onClick={generateInviteCode} disabled={loading} className="mt-4">
                  Générer un nouveau code
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Donnez ce code à votre parent pour qu'il puisse lier son compte :
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg px-6 py-4">
                      <div className="text-2xl font-mono font-bold text-blue-600 tracking-wider">
                        {inviteCode.code}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={copyCode}
                      className="flex items-center space-x-2"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Copié!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copier</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Valable pendant</span>
                    </div>
                    <Badge variant={timeLeft === 'Expiré' ? 'destructive' : 'secondary'}>
                      {timeLeft}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600">Généré le</span>
                    <span className="text-gray-900">{formatDate(inviteCode.createdAt)}</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Instructions pour le parent :</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Allez sur maths-app.com/parent/link</li>
                    <li>Entrez le code : <strong>{inviteCode.code}</strong></li>
                    <li>Créez un compte ou connectez-vous</li>
                    <li>Le lien sera automatiquement créé</li>
                  </ol>
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={generateInviteCode}
                    disabled={loading}
                  >
                    Générer un nouveau code
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
