import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Supabase configuration
const supabaseUrl = 'https://kioqgrvnolerzffqdwmt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtpb3FncnZub2xlcnpmZnFkd210Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxODM4MDcsImV4cCI6MjA2Mzc1OTgwN30.CD2PAbcklmqMf8NlCK_zdttAy5sMfesAaeBmyZCVwGk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface User {
  id: string;
  email: string;
  user_metadata?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // If sign-in successful, ensure user exists in users table
    if (!error && data.user) {
      try {
        // Check if user exists in users table
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .single();

        // If user doesn't exist, create them
        if (checkError && checkError.code === 'PGRST116') {
          console.log('📝 Creating user record in users table...');
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email || email,
              full_name: data.user.user_metadata?.full_name || null,
              phone: data.user.user_metadata?.phone || null,
              role: 'student'
            })
            .select()
            .single();

          if (insertError) {
            console.error('❌ Error creating user record:', insertError);
            console.error('❌ Insert error details:', {
              code: insertError.code,
              message: insertError.message,
              details: insertError.details
            });
          } else {
            console.log('✅ User record created successfully:', newUser);
          }
        } else if (existingUser) {
          console.log('✅ User already exists in users table:', existingUser.id);
        } else if (checkError) {
          console.error('❌ Error checking user existence:', checkError);
        }
      } catch (userError) {
        console.error('❌ Error handling user record:', userError);
      }
    }

    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}