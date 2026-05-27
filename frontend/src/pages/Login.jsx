import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Landmark, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const { login, isAuthenticated } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic Validation
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await login(email, password);
      
      if (res.success) {
        toast.success(res.message || 'Logged in successfully!');
        navigate('/dashboard');
      } else {
        toast.error(res.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred during sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Decorative Blur Spheres */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-bank-accent/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 z-10">
        
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-bank-secondary transition-colors cursor-pointer group"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        {/* Auth Panel */}
        <div className="glass-card rounded-3xl p-8 border border-slate-200/60 shadow-xl space-y-6">
          {/* Logo */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 rounded-2xl bg-bank-primary text-white shadow-md shadow-bank-primary/10">
              <Landmark size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-bank-secondary">Welcome Back</h2>
              <p className="text-xs text-slate-400 mt-1">Sign in to manage your DoxBank account</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  disabled={isSubmitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-bank-accent/30 focus:border-bank-accent transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-bank-accent/30 focus:border-bank-accent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 mt-2 rounded-2xl bg-bank-accent hover:bg-bank-accent/95 text-white font-bold text-sm shadow-lg shadow-bank-accent/15 flex items-center justify-center gap-2 hover-scale cursor-pointer transition-all"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span>Sign In to Account</span>
              )}
            </button>

          </form>

          {/* Prompt Sign up */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-400">
              Not registered?{' '}
              <Link
                to="/register"
                className="font-bold text-bank-accent hover:underline ml-0.5 cursor-pointer"
              >
                Open an Account
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
