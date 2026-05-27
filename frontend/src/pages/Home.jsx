import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Zap, Landmark, BarChart3, ArrowRight, UserCheck } from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user } = useContext(AuthContext);

  // Format account number for premium card view
  const formatAccountNumber = (num) => {
    if (!num) return '8274 918 362';
    return num.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  };


  const features = [
    {
      title: 'Automated Banking',
      description: 'Receive a unique, randomized 10-digit account number immediately upon secure registration.',
      icon: Landmark,
    },
    {
      title: 'Instant Cash Flow',
      description: 'Deposit and withdraw funds instantly with automatic balance auditing and real-time updates.',
      icon: Zap,
    },
    {
      title: 'Protected Securities',
      description: 'Protected using bcrypt password hashing algorithms and JSON Web Token (JWT) session caching.',
      icon: ShieldCheck,
    },
    {
      title: 'Detailed Audits',
      description: 'Analyze transactions logs with custom search parameters and filters in a responsive ledger.',
      icon: BarChart3,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Header */}
      <header className="fixed top-0 inset-x-0 z-30 glass-nav">
        <div className="max-w-7xl mx-auto px-6 h-18 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-bank-primary text-white">
              <Landmark size={20} />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-bank-secondary">DoxBank</span>
              <span className="text-[9px] block font-bold text-bank-accent tracking-widest uppercase -mt-1">Of India</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-5 py-2 rounded-xl bg-bank-secondary text-white text-sm font-semibold hover:bg-slate-800 hover-scale cursor-pointer flex items-center gap-1.5"
              >
                <span>Dashboard</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2 text-sm font-semibold text-slate-600 hover:text-bank-secondary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 rounded-xl bg-bank-accent text-white text-sm font-semibold hover:bg-bank-accent/90 shadow-md shadow-bank-accent/15 hover-scale cursor-pointer"
                >
                  Open Account
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bank-accent/10 border border-bank-accent/20 text-xs font-bold text-bank-accent">
                <UserCheck size={12} />
                Now Serving Across India
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-bank-secondary leading-[1.1] tracking-tight">
                Next-Generation <br />
                <span className="text-bank-accent">Banking For India.</span>
              </h2>
              <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Welcome to DoxBankOfIndia. Open a secure account in seconds, perform instant deposits and withdrawals, 
                and trace your transactions in real-time. Secure, fast, and completely digital.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-bank-primary text-white font-bold hover:bg-slate-800 text-center shadow-lg shadow-bank-primary/10 hover-scale cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight size={16} />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-bank-accent text-white font-bold hover:bg-bank-accent/95 text-center shadow-lg shadow-bank-accent/20 hover-scale cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Get Started Now</span>
                      <ArrowRight size={16} />
                    </Link>
                    <Link
                      to="/login"
                      className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-center hover-scale cursor-pointer"
                    >
                      Access Dashboard
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right Graphic Mockup */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-sm aspect-[4/3] rounded-3xl p-6 glass-card-dark text-white flex flex-col justify-between shadow-2xl overflow-hidden hover-scale">
                {/* Graphics elements */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-bank-accent/20 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">DoxBankOfIndia</p>
                    <h3 className="text-xl font-bold mt-1">
                      {isAuthenticated && user 
                        ? `₹${user.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` 
                        : '₹748,500.00'}
                    </h3>
                  </div>
                  <Landmark className="h-8 w-8 text-bank-accent" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-medium">Account Number</p>
                  <p className="text-base font-mono tracking-widest mt-0.5">
                    {isAuthenticated && user ? formatAccountNumber(user.accountNumber) : '8274 918 362'}
                  </p>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-medium">Card Holder</p>
                    <p className="text-xs font-semibold text-slate-200">{isAuthenticated && user ? user.name : 'Sample Account'}</p>
                  </div>
                  <div className="flex gap-1">
                    <span className="h-4 w-4 bg-orange-500 rounded-full opacity-85"></span>
                    <span className="h-4 w-4 bg-red-500 rounded-full -ml-2.5 opacity-85"></span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Features Grid */}
          <section className="mt-32 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-bank-secondary tracking-tight">
                Designed for Reliability and Safety
              </h3>
              <p className="text-slate-500 text-sm">
                Built with industry standard MERN architecture. Optimized for learning, portfolio presentations, and secure operations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="glass-card hover-scale rounded-2xl p-6 space-y-4">
                    <div className="p-3 bg-bank-accent/10 border border-bank-accent/20 rounded-xl text-bank-accent w-fit">
                      <Icon size={20} />
                    </div>
                    <h4 className="font-bold text-slate-800 text-base">{feature.title}</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
          <p className="text-slate-400 text-xs">
            © {new Date().getFullYear()} DoxBankOfIndia. Developed for portfolio reference and educational training.
          </p>
          <p className="text-slate-500 text-[10px]">
            Licensed demonstration node. System utilizes secure local JWT credentials.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
