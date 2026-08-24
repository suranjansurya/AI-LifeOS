import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, ArrowLeft, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    await resetPassword(email);
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="card-panel p-8 max-w-md w-full border-indigo-500/30 space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            Enter your email to receive a password reset link.
          </p>
        </div>

        {sent ? (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 space-y-2 text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
            <p className="font-bold">Reset email sent!</p>
            <p className="text-[11px] text-zinc-400">Check your inbox for password reset instructions.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <Button
              variant="ai"
              size="lg"
              type="submit"
              disabled={loading}
              className="w-full justify-center"
              icon={loading ? Loader2 : Mail}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        )}

        <div className="text-center pt-3 border-t border-zinc-800 text-xs">
          <Link to="/login" className="text-zinc-400 hover:text-zinc-200 flex items-center justify-center gap-1 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
