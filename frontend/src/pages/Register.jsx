import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Landmark, Mail, Lock, User, Eye, EyeOff, Loader2, ArrowLeft, Phone, MapPin, Calendar, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const { register, isAuthenticated } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [accountType, setAccountType] = useState('savings');
  const [dob, setDob] = useState('');
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

    // Client-side Validations
    if (!name.trim() || !email.trim() || !password || !phone.trim() || !address.trim() || !dob) {
      toast.error('All registration fields are required.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    // Phone format validation (simple check for digits)
    const phoneRegex = /^[0-9\s+()-]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      toast.error('Please enter a valid phone number.');
      return;
    }

    // DOB age validation (e.g. must be at least 18 years old)
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      toast.error('You must be at least 18 years old to open a bank account.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await register(name, email, password, phone, address, accountType, dob);

      if (res.success) {
        toast.success('Welcome! Your bank account was successfully generated.');
        navigate('/dashboard');
      } else {
        toast.error(res.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred during registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6">
      {/* Decorative Blur Spheres */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-bank-accent/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-2xl space-y-6 z-10">
        
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
            <div className="p-3 rounded-2xl bg-bank-accent text-white shadow-md shadow-bank-accent/15">
              <Landmark size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-bank-secondary">Open Bank Account</h2>
              <p className="text-xs text-slate-400 mt-1">Provide your details to register and generate an account number</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-bank-accent/30 focus:border-bank-accent transition-all"
                  />
                </div>
              </div>

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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Phone size={16} />
                  </span>
                  <input
                    type="tel"
                    required
                    disabled={isSubmitting}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-bank-accent/30 focus:border-bank-accent transition-all"
                  />
                </div>
              </div>

              {/* Date of Birth Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Calendar size={16} />
                  </span>
                  <input
                    type="date"
                    required
                    disabled={isSubmitting}
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-bank-accent/30 focus:border-bank-accent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Account Type selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Account Type
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <CreditCard size={16} />
                </span>
                <select
                  required
                  disabled={isSubmitting}
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-bank-accent/30 focus:border-bank-accent transition-all appearance-none cursor-pointer"
                >
                  <option value="savings">Savings Account</option>
                  <option value="checking">Checking Account</option>
                  <option value="business">Business Account</option>
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</span>
              </div>
            </div>

            {/* Address Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Residential Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-4 text-slate-400">
                  <MapPin size={16} />
                </span>
                <textarea
                  required
                  rows="3"
                  disabled={isSubmitting}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your current street address, city, state and PIN code..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-bank-accent/30 focus:border-bank-accent transition-all resize-none"
                ></textarea>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Create Password
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
                  placeholder="•••••••• (Min. 6 characters)"
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
              className="w-full py-3.5 mt-2 rounded-2xl bg-bank-primary hover:bg-slate-850 text-white font-bold text-sm shadow-lg shadow-bank-primary/10 flex items-center justify-center gap-2 hover-scale cursor-pointer transition-all"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span>Register & Open Account</span>
              )}
            </button>

          </form>

          {/* Prompt Sign in */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-bank-accent hover:underline ml-0.5 cursor-pointer"
              >
                Sign In
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
