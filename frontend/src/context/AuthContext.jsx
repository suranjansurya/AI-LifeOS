import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const AuthContext = createContext(null);

const USERS_STORAGE_KEY = 'ailifeos_registered_users';
const SESSION_STORAGE_KEY = 'ailifeos_user_session';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setSession(session);
            setUser(session.user);
          }
        } catch (err) {
          console.error('[AuthContext] Supabase session fetch error:', err);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        });

        setLoading(false);
        return () => subscription.unsubscribe();
      } else {
        // Local session storage check
        try {
          const rawSession = localStorage.getItem(SESSION_STORAGE_KEY);
          if (rawSession) {
            const parsedSession = JSON.parse(rawSession);
            if (parsedSession && parsedSession.user) {
              setSession(parsedSession);
              setUser(parsedSession.user);
            }
          }
        } catch (e) {
          console.error('[AuthContext] Error parsing local session:', e);
        }
        setLoading(false);
      }
    };

    initSession();
  }, []);

  const signUp = async (email, password, name) => {
    if (isSupabaseConfigured && supabase) {
      const res = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (!res.error && res.data?.user) {
        setUser(res.data.user);
        setSession(res.data.session || { user: res.data.user });
      }
      return res;
    }

    // Local authentication signup logic
    const rawUsers = localStorage.getItem(USERS_STORAGE_KEY);
    const users = rawUsers ? JSON.parse(rawUsers) : [];

    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return { data: null, error: { message: 'An account with this email already exists.' } };
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      email: email.trim(),
      password, // Local fallback security scope
      name: name.trim()
    };

    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    const newSession = {
      user: {
        id: newUser.id,
        email: newUser.email,
        user_metadata: { name: newUser.name }
      }
    };

    setUser(newSession.user);
    setSession(newSession);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));

    return { data: newSession, error: null };
  };

  const signIn = async (email, password) => {
    if (isSupabaseConfigured && supabase) {
      const res = await supabase.auth.signInWithPassword({ email, password });
      if (!res.error && res.data?.user) {
        setUser(res.data.user);
        setSession(res.data.session);
      }
      return res;
    }

    // Local authentication signin logic
    const rawUsers = localStorage.getItem(USERS_STORAGE_KEY);
    const users = rawUsers ? JSON.parse(rawUsers) : [];

    const foundUser = users.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );

    if (!foundUser) {
      return { data: null, error: { message: 'Invalid email or password. Please try again.' } };
    }

    const newSession = {
      user: {
        id: foundUser.id,
        email: foundUser.email,
        user_metadata: { name: foundUser.name }
      }
    };

    setUser(newSession.user);
    setSession(newSession);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));

    return { data: newSession, error: null };
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('[AuthContext] Supabase signOut error:', err);
      }
    }
    setUser(null);
    setSession(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  const resetPassword = async (email) => {
    if (isSupabaseConfigured && supabase) {
      return await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
    }
    return { data: {}, error: null };
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
