import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // If Supabase is not configured, don't attempt to fetch a session.
        if (!isSupabaseConfigured || !supabase) {
            setLoading(false);
            return;
        }

        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setLoading(false);
        };

        fetchSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        if (isSupabaseConfigured && supabase) {
            await supabase.auth.signOut();
        }
    };

    const value = {
        session,
        loading,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
