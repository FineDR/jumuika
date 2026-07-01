import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { LogoIcon } from './ui/Logo';

export const AuthPage: React.FC = () => {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google Sign-In failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 sm:p-8 bg-background font-sans overflow-hidden">

      {/* Ambient background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-80 h-80 sm:w-[32rem] sm:h-[32rem] bg-secondary/15 rounded-full filter blur-[100px]"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 sm:w-[32rem] sm:h-[32rem] bg-primary/15 rounded-full filter blur-[100px]"></div>
      </div>

      {/* Back to home */}
      <div className="relative z-10 w-full max-w-md mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-foreground/5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="relative bg-surface/70 backdrop-blur-2xl border border-border/60 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl overflow-hidden">

          {/* Top gradient edge */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/60 to-transparent"></div>

          {/* Header */}
          <div className="flex flex-col items-center text-center gap-4 sm:gap-6 mb-8 sm:mb-10">
            <div className="relative">
              <div className="absolute inset-0 bg-secondary/25 blur-2xl rounded-full scale-150"></div>
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-2xl flex items-center justify-center border border-secondary/20 shadow-inner mb-6 sm:mb-8">
                <LogoIcon className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Welcome to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-info">
                  Jumuika
                </span>
              </h1>
              <p className="text-muted text-sm sm:text-base max-w-[260px] sm:max-w-xs mx-auto leading-snug">
                Modern event and contributor management, simplified.
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 sm:mb-6 flex items-start gap-3 p-3.5 sm:p-4 bg-danger/10 border border-danger/25 rounded-xl text-danger text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{error}</p>
            </div>
          )}

          {/* Google Sign-In Button */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <button
              id="google-signin-btn"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="group relative w-full flex items-center justify-center gap-3 sm:gap-4 p-3.5 sm:p-4 bg-surface dark:bg-white text-foreground dark:text-slate-900 border border-border dark:border-transparent rounded-xl font-bold text-sm sm:text-[15px] transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-700 dark:border-slate-500 dark:border-t-slate-200 rounded-full animate-spin shrink-0"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-105 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <p className="text-center text-xs font-medium text-muted leading-relaxed">
              Secured with end-to-end encryption.{' '}
              <span className="hidden sm:inline">Your data is always protected.</span>
            </p>
          </div>

          {/* Bottom edge */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
        </div>

        {/* Help text below card */}
        <p className="text-center text-xs text-muted mt-4 sm:mt-5">
          By continuing, you agree to our{' '}
          <span className="underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">Terms</span>
          {' '}and{' '}
          <span className="underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};
