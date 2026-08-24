import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { storageService } from '../services/storageService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      // Fallback mock session for local environment
      const localProfile = storageService.getProfile();
      setUser({
        id: 'local-user-id',
        email: localProfile.email || 'user@ailifeos.internal',
        user_metadata: { name: localProfile.name || 'Suranjan' }
      });
      setLoading(false);
      return;
    }

    // Get initial session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, name) => {
    if (!isSupabaseConfigured || !supabase) {
      setUser({ id: 'local-user-id', email, user_metadata: { name } });
      return { data: { user: { id: 'local-user-id', email } }, error: null };
    }
    const res = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    return res;
  };

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      setUser({ id: 'local-user-id', email });
      return { data: { session: {} }, error: null };
    }
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (email) => {
    if (!isSupabaseConfigured || !supabase) {
      return { data: {}, error: null };
    }
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isAuthenticated: Boolean(user),
      isConfigured: isSupabaseConfigured,
      signUp,
      signIn,
      signOut,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
