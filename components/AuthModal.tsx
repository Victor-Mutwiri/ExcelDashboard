import React, { useState } from 'react';
import { Modal } from './Modal';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { CloseIcon } from './Icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // Check if Supabase is configured before attempting auth.
    if (!isSupabaseConfigured || !supabase) {
      setError("Authentication service is not configured. Please set Supabase credentials in the application's configuration.");
      setLoading(false);
      return;
    }

    try {
      let response;
      if (activeTab === 'signUp') {
        response = await supabase.auth.signUp({ email, password });
        if (!response.error) {
           setMessage('Success! Please check your email for a confirmation link to activate your account.');
           // In a real app with email confirmation, you'd wait for them to click the link.
           // For this demo, we'll treat it as an immediate success to continue the flow.
           setTimeout(() => onSuccess(), 1500);
        }
      } else {
        response = await supabase.auth.signInWithPassword({ email, password });
        if (!response.error) {
            onSuccess();
        }
      }

      if (response.error) {
        throw response.error;
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError(null);
    setMessage(null);
    setActiveTab('signIn');
    onClose();
  }

  // Display a persistent warning if Supabase is not configured.
  const configurationWarning = !isSupabaseConfigured ? (
     <div className="flex items-center gap-3 p-3 bg-yellow-500/10 text-yellow-600 rounded-lg text-sm mb-4">
        <span className="font-bold">!</span> <p>Auth is not configured. Sign-in/up is disabled.</p>
     </div>
  ) : null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create an Account to Continue">
        <div className="flex flex-col gap-4">
            <p className="text-center text-[var(--text-secondary)]">
                Create a free account to save your work, use AI features, and export your dashboards.
            </p>
            
            {configurationWarning}

            <div className="flex justify-center border-b border-[var(--border-color)]">
                <button 
                    onClick={() => setActiveTab('signIn')} 
                    className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'signIn' ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                >
                    Sign In
                </button>
                <button 
                    onClick={() => setActiveTab('signUp')} 
                    className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'signUp' ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                >
                    Sign Up
                </button>
            </div>
            
            <form onSubmit={handleAuthAction} className="space-y-4">
                <div>
                    <label htmlFor="auth-email" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label>
                    <input
                        id="auth-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-2 focus:ring-2 focus:ring-[var(--ring-color)] focus:outline-none"
                        placeholder="you@example.com"
                    />
                </div>
                 <div>
                    <label htmlFor="auth-password"className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Password</label>
                    <input
                        id="auth-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-2 focus:ring-2 focus:ring-[var(--ring-color)] focus:outline-none"
                        placeholder="••••••••"
                    />
                </div>

                <button type="submit" disabled={loading || !isSupabaseConfigured} className="w-full py-2 px-4 bg-[var(--bg-accent)] hover:bg-[var(--bg-accent-hover)] text-[var(--text-on-accent)] rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? 'Processing...' : (activeTab === 'signIn' ? 'Sign In' : 'Create Account')}
                </button>
            </form>
            
            {error && (
                <div className="flex items-center gap-3 p-3 bg-red-500/10 text-red-500 rounded-lg text-sm">
                   <span className="font-bold">!</span> <p>{error}</p>
                </div>
            )}
             {message && (
                <div className="flex items-center gap-3 p-3 bg-green-500/10 text-green-600 rounded-lg text-sm">
                   <span className="font-bold">✓</span> <p>{message}</p>
                </div>
            )}
        </div>
    </Modal>
  );
};

export default AuthModal;
