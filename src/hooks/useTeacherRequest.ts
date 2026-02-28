import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface TeacherRequest {
  id: string;
  userId: string;
  name: string;
  email: string;
  school: string;
  subject: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export function useTeacherRequest() {
  const { data: session } = useSession();
  const [request, setRequest] = useState<TeacherRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) {
      setIsLoading(false);
      return;
    }

    const fetchTeacherRequest = async () => {
      try {
        const response = await fetch('/api/teacher-requests/my-request', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setRequest(data.request);
        } else if (response.status === 404) {
          // No request found - this is normal
          setRequest(null);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Erreur lors du chargement de la demande');
        }
      } catch (err) {
        setError('Erreur réseau');
        console.error('Error fetching teacher request:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacherRequest();
  }, [session?.user?.id]);

  const refetch = () => {
    setIsLoading(true);
    setError(null);
    // Re-trigger the fetch
    if (session?.user?.id) {
      fetch('/api/teacher-requests/my-request', {
        credentials: 'include'
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else if (response.status === 404) {
          return { request: null };
        } else {
          throw new Error('Failed to fetch');
        }
      })
      .then(data => {
        setRequest(data.request);
        setIsLoading(false);
      })
      .catch(err => {
        setError('Erreur réseau');
        setIsLoading(false);
      });
    }
  };

  return { request, isLoading, error, refetch };
}
