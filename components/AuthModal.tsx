
import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { supabase } from '../supabaseClient';
import { EyeIcon, EyeOffIcon, MailIcon, LockClosedIcon, ClockIcon, BackIcon, CheckCircleIcon } from './Icons';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type AuthView = 'signIn' | 'signUp' | 'forgotPassword' | 'enterOtp';

const OTP_COOLDOWN_SECONDS = 60;

// --- Rate Limiting Helpers ---
const getOtpRequests = (email: string): number[] => {
  try {
    const log = JSON.parse(localStorage.getItem('otp_request_log') || '{}');
    return log[email] || [];
  } catch {
    return [];
  }
};

const addOtpRequest = (email: string) => {
  try {
    const log = JSON.parse(localStorage.getItem('otp_request_log') || '{}');
    const now = Date.now();
    const timestamps = (log[email] || []).filter((ts: number) => now - ts < 24 * 60 * 60 * 1000); // Keep last 24h
    timestamps.push(now);
    log[email] = timestamps;
    localStorage.setItem('otp_request_log', JSON.stringify(log));
  } catch (error) {
    console.error("Failed to update OTP log:", error);
  }
};

const checkOtpRateLimit = (email: string): { allowed: boolean; message: string } => {
  const timestamps = getOtpRequests(email);
  const now = Date.now();
  const requestsInLastHour = timestamps.filter(ts => now - ts < 60 * 60 * 1000).length;
  const requestsInLastDay = timestamps.length;

  if (requestsInLastHour >= 3) {
    return { allowed: false, message: 'Too many requests. Please try again in an hour.' };
  }
  if (requestsInLastDay >= 5) {
    return { allowed: false, message: 'Daily request limit reached. Please try again tomorrow.' };
  }
  return { allowed: true, message: '' };
};
// --- End Rate Limiting Helpers ---

const WelcomeView: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
    useEffect(() => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center text-center p-6">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <CheckCircleIcon className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Welcome to SheetSight!</h2>
            <p className="text-[var(--text-secondary)] mb-8">Your account has been successfully created. You're all set to start building amazing dashboards.</p>
            <button 
                onClick={onSuccess} 
                className="w-full py-3 px-4 bg-[var(--bg-accent)] hover:bg-[var(--bg-accent-hover)] text-[var(--text-on-accent)] rounded-lg transition-colors font-semibold shadow-lg shadow-indigo-500/20 transform hover:scale-105 duration-200"
            >
                Get Started
            </button>
        </div>
    );
};

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [view, setView] = useState<AuthView>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => {
      if (timer !== null) {
        clearTimeout(timer);
      }
    };
  }, [countdown]);

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setOtp('');
    setError(null);
    setIsPasswordVisible(false);
    setView('signIn');
    setLoading(false);
    setCountdown(0);
    setShowWelcome(false);
    onClose();
  };

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (view === 'signUp') {
        const response = await supabase.auth.signUp({ email, password });
        if (response.error) throw response.error;
        // Instead of closing, show welcome screen
        setShowWelcome(true);
      } else {
        const response = await supabase.auth.signInWithPassword({ email, password });
        if (response.error) throw response.error;
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const rateLimit = checkOtpRateLimit(email);
    if (!rateLimit.allowed) {
        setError(rateLimit.message);
        return;
    }

    setLoading(true);
    try {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { shouldCreateUser: false },
        });
        if (error) throw error;
        addOtpRequest(email);
        setView('enterOtp');
        setCountdown(OTP_COOLDOWN_SECONDS);
    } catch (err: any) {
        if (err.message && err.message.toLowerCase().includes('signups not allowed for otp')) {
            setError('No account found with this email address. Please check the email and try again.');
        } else {
            setError(err.message || 'Failed to send OTP.');
        }
    } finally {
        setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
        const { error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'email',
        });
        if (error) throw error;
        onSuccess();
    } catch (err: any) {
        setError(err.message || 'Invalid or expired OTP.');
    } finally {
        setLoading(false);
    }
  };

  const renderSignIn = () => (
    <form onSubmit={handleAuthAction} className="space-y-6">
      <div className="relative">
        <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
        <input id="auth-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-[var(--ring-color)] focus:outline-none" placeholder="you@example.com" />
      </div>
      <div className="relative">
        <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
        <input id="auth-password" type={isPasswordVisible ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md pl-10 pr-12 py-2.5 focus:ring-2 focus:ring-[var(--ring-color)] focus:outline-none" placeholder="••••••••" />
        <button type="button" onClick={() => setIsPasswordVisible(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1" aria-label={isPasswordVisible ? "Hide password" : "Show password"}>
          {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
       <div className="text-right">
            <button type="button" onClick={() => setView('forgotPassword')} className="text-sm font-medium text-[var(--color-accent)] hover:underline">Forgot Password?</button>
       </div>
      <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-[var(--bg-accent)] hover:bg-[var(--bg-accent-hover)] text-[var(--text-on-accent)] rounded-lg transition-colors font-semibold disabled:opacity-50">
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  );

  const renderSignUp = () => (
    <form onSubmit={handleAuthAction} className="space-y-6">
      <div className="relative">
        <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
        <input id="auth-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-[var(--ring-color)] focus:outline-none" placeholder="you@example.com" />
      </div>
      <div className="relative">
        <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
        <input id="auth-password" type={isPasswordVisible ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md pl-10 pr-12 py-2.5 focus:ring-2 focus:ring-[var(--ring-color)] focus:outline-none" placeholder="Create a password (min. 6 chars)" />
        <button type="button" onClick={() => setIsPasswordVisible(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1" aria-label={isPasswordVisible ? "Hide password" : "Show password"}>
          {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-[var(--bg-accent)] hover:bg-[var(--bg-accent-hover)] text-[var(--text-on-accent)] rounded-lg transition-colors font-semibold disabled:opacity-50">
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
  
  const renderForgotPassword = () => (
    <form onSubmit={handleRequestOtp} className="space-y-6">
        <p className="text-sm text-center text-[var(--text-secondary)]">Enter your email and we'll send you a recovery code to sign in.</p>
        <div className="relative">
            <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input id="forgot-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-[var(--ring-color)] focus:outline-none" placeholder="you@example.com" />
        </div>
        <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-[var(--bg-accent)] hover:bg-[var(--bg-accent-hover)] text-[var(--text-on-accent)] rounded-lg transition-colors font-semibold disabled:opacity-50">
            {loading ? 'Sending...' : 'Send Recovery Code'}
        </button>
        <div className="text-center">
            <button type="button" onClick={() => setView('signIn')} className="text-sm font-medium text-[var(--color-accent)] hover:underline flex items-center gap-1 mx-auto">
                <BackIcon className="w-4 h-4" /> Back to Sign In
            </button>
       </div>
    </form>
  );

  const renderEnterOtp = () => (
    <form onSubmit={handleVerifyOtp} className="space-y-6">
        <p className="text-sm text-center text-[var(--text-secondary)]">A recovery code was sent to <strong className="text-[var(--text-primary)]">{email}</strong>. It expires in {countdown}s.</p>
        <div className="relative">
            <input id="otp-input" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required minLength={6} maxLength={10} className="w-full text-center font-mono text-lg bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-4 py-2.5 focus:ring-2 focus:ring-[var(--ring-color)] focus:outline-none" placeholder="Enter code" />
        </div>
        <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-[var(--bg-accent)] hover:bg-[var(--bg-accent-hover)] text-[var(--text-on-accent)] rounded-lg transition-colors font-semibold disabled:opacity-50">
            {loading ? 'Verifying...' : 'Verify & Sign In'}
        </button>
        <div className="text-center">
            <button type="button" onClick={handleRequestOtp} disabled={countdown > 0} className="text-sm font-medium text-[var(--color-accent)] hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
                {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
            </button>
        </div>
    </form>
  );

  const renderContent = () => {
    if (showWelcome) return <WelcomeView onSuccess={onSuccess} />;

    switch (view) {
        case 'signIn': return renderSignIn();
        case 'signUp': return renderSignUp();
        case 'forgotPassword': return renderForgotPassword();
        case 'enterOtp': return renderEnterOtp();
    }
  };
  
  const getModalTitle = () => {
    if (showWelcome) return '';
    switch(view) {
        case 'signIn': return 'Sign In';
        case 'signUp': return 'Create Account';
        case 'forgotPassword': return 'Reset Password';
        case 'enterOtp': return 'Enter Recovery Code';
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getModalTitle()} maxWidth="max-w-md">
      <div className="w-full">
        {!showWelcome && view !== 'forgotPassword' && view !== 'enterOtp' && (
            <div className="flex justify-center border-b border-[var(--border-color)] mb-6">
                <button onClick={() => { setView('signIn'); setError(null); }} className={`px-6 py-2 font-semibold transition-colors ${view === 'signIn' ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                    Sign In
                </button>
                <button onClick={() => { setView('signUp'); setError(null); }} className={`px-6 py-2 font-semibold transition-colors ${view === 'signUp' ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                    Sign Up
                </button>
            </div>
        )}
        
        {error && !showWelcome && (
            <div className="mb-4 text-center p-2 bg-red-500/10 text-red-500 rounded-md text-sm font-medium">
                {error}
            </div>
        )}
        
        {renderContent()}
      </div>
    </Modal>
  );
};

export default AuthModal;
