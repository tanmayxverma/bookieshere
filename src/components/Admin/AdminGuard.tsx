import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminSession } from '@/hooks/useAdminSession';
import { Loader2 } from 'lucide-react';

export function AdminGuard({ children }: { children: ReactNode }) {
  const { valid, validating } = useAdminSession();
  const navigate = useNavigate();
  useEffect(() => {
    if (!validating && !valid) navigate('/', { replace: true });
  }, [valid, validating, navigate]);
  if (validating) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!valid) return null;
  return <>{children}</>;
}