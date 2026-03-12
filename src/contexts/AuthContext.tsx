import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  kontraktorId: string | null;
  kontraktorName: string | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, kontraktorId: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [kontraktorId, setKontraktorId] = useState<string | null>(null);
  const [kontraktorName, setKontraktorName] = useState<string | null>(null);

  const checkUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (!error && data) {
      const hasAdminRole = data.some(r => r.role === 'admin');
      setIsAdmin(hasAdminRole);
    }
  };

  const fetchKontraktorInfo = async (userId: string) => {
    const { data, error } = await supabase
      .from('akun_kontraktor')
      .select('kontraktor_id, kontraktors(nama_kontraktor)')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) {
      setKontraktorId(data.kontraktor_id);
      setKontraktorName((data.kontraktors as any)?.nama_kontraktor || null);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            checkUserRole(session.user.id);
            fetchKontraktorInfo(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setKontraktorId(null);
          setKontraktorName(null);
        }
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkUserRole(session.user.id);
        fetchKontraktorInfo(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, kontraktorIdParam: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (!error && data.user) {
      // Link user to kontraktor
      const { error: linkError } = await supabase
        .from('akun_kontraktor')
        .insert({
          user_id: data.user.id,
          kontraktor_id: kontraktorIdParam,
          email: email,
        });

      if (linkError) {
        return { error: linkError };
      }
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setKontraktorId(null);
    setKontraktorName(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        isLoading,
        kontraktorId,
        kontraktorName,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
