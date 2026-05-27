import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { ArrowUpRight, ArrowDownLeft, Landmark, Loader2, X, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const BalanceCard = ({ onTransactionSuccess }) => {
  const { user, reloadProfile } = useContext(AuthContext);
  const [modalType, setModalType] = useState(null); // 'deposit' or 'withdraw'
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('other');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  // Format account number for premium feel (e.g. 1234 567 890)
  const formatAccountNumber = (num) => {
    if (!num) return '';
    return num.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  };

  const handleOpenModal = (type) => {
    if (user.isCardFrozen) {
      toast.error('Transactions blocked. Your virtual debit card is frozen.');
      return;
    }
    setModalType(type);
    setAmount('');
    // Set logical default categories
    setCategory(type === 'deposit' ? 'salary' : 'food');
    setDescription('');
  };

  const handleCloseModal = () => {
    setModalType(null);
    setAmount('');
    setCategory('other');
    setDescription('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = parseFloat(amount);

    if (isNaN(value) || value <= 0) {
      toast.error('Please enter a valid amount greater than zero.');
      return;
    }

    if (modalType === 'withdraw' && value > user.balance) {
      toast.error(`Insufficient balance. Maximum withdrawal is ₹${user.balance.toLocaleString('en-IN')}`);
      return;
    }

    try {
      setIsSubmitting(true);
      const endpoint = modalType === 'deposit' ? '/account/deposit' : '/account/withdraw';
      const { data } = await API.post(endpoint, { 
        amount: value,
        category,
        description: description.trim() || (modalType === 'deposit' ? 'Self deposit' : 'Self withdrawal')
      });

      if (data.success) {
        toast.success(data.message);
        await reloadProfile(); // Refresh context user profile/balance
        if (onTransactionSuccess) {
          onTransactionSuccess(); // Refresh transaction list in dashboard
        }
        handleCloseModal();
      } else {
        toast.error(data.message || 'Transaction failed.');
      }
    } catch (error) {
      console.error('Transaction processing error:', error);
      toast.error(error.response?.data?.message || 'Connection lost. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visa-style Premium Glassmorphism Banking Card */}
        <div className={`lg:col-span-2 relative overflow-hidden rounded-3xl text-white glass-card-dark p-8 flex flex-col justify-between min-h-[220px] transition-all duration-300 ${
          user.isCardFrozen ? 'opacity-55 saturate-50 scale-[0.99]' : ''
        }`}>
          {/* Background Decorative Rings */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-bank-accent/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Card Top Header */}
          <div className="flex justify-between items-start z-10">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">DoxBank Premium Card</p>
                {user.isCardFrozen && (
                  <span className="inline-flex items-center gap-1 bg-rose-500/25 border border-rose-500/50 text-[9px] font-extrabold px-2 py-0.5 rounded-lg text-rose-300 uppercase tracking-widest animate-pulse">
                    <ShieldAlert size={10} />
                    Frozen
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold tracking-tight mt-1">₹{user.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
            </div>
            <Landmark className="h-9 w-9 text-bank-accent/80" />
          </div>

          {/* Card Middle: Account Number */}
          <div className="my-6 z-10">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Account Number</p>
            <p className="text-lg md:text-xl font-mono tracking-widest font-semibold mt-1">
              {formatAccountNumber(user.accountNumber)}
            </p>
          </div>

          {/* Card Footer: Account Holder */}
          <div className="flex justify-between items-end z-10">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Card Holder</p>
              <p className="text-sm font-semibold tracking-wide text-slate-100">{user.name}</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-5 w-5 bg-orange-500 rounded-full opacity-80"></span>
              <span className="h-5 w-5 bg-red-500 rounded-full -ml-3 opacity-80"></span>
            </div>
          </div>
        </div>

        {/* Quick Transaction Action panel */}
        <div className="glass-card rounded-3xl p-6 flex flex-col justify-center gap-4 relative overflow-hidden">
          {user.isCardFrozen && (
            <div className="absolute inset-0 bg-slate-900/5 dark:bg-slate-950/20 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center text-center p-4">
              <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl mb-1.5">
                <ShieldAlert size={20} />
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Transactions Locked</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Unfreeze card in Card Security to unlock</p>
            </div>
          )}

          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Quick Actions</h3>
          
          <button
            onClick={() => handleOpenModal('deposit')}
            disabled={user.isCardFrozen}
            className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 hover:border-emerald-200 text-emerald-800 font-semibold transition-all duration-200 group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <ArrowDownLeft size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800">Deposit Money</p>
                <p className="text-xs font-normal text-slate-500">Add funds to account</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleOpenModal('withdraw')}
            disabled={user.isCardFrozen}
            className="flex items-center justify-between p-4 rounded-2xl bg-rose-50/50 hover:bg-rose-50 border border-rose-100 hover:border-rose-200 text-rose-800 font-semibold transition-all duration-200 group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500 text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
                <ArrowUpRight size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800">Withdraw Money</p>
                <p className="text-xs font-normal text-slate-500">Deduct cash instantly</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Transaction Modal (Deposit / Withdraw Overlay) */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
              <h4 className="text-lg font-bold text-slate-800 capitalize">
                {modalType === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
              </h4>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Amount Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    disabled={isSubmitting}
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 font-bold focus:outline-none focus:ring-2 focus:ring-bank-accent/30 focus:border-bank-accent transition-all text-lg"
                  />
                </div>
                {modalType === 'withdraw' && (
                  <p className="text-xs text-slate-405 mt-2 flex justify-between">
                    <span>Available Balance:</span>
                    <span className="font-semibold text-slate-600">₹{user.balance.toLocaleString('en-IN')}</span>
                  </p>
                )}
              </div>

              {/* Category Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Transaction Category
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-bank-accent/30 focus:border-bank-accent transition-all appearance-none cursor-pointer"
                >
                  {modalType === 'deposit' ? (
                    <>
                      <option value="salary">Salary / Income</option>
                      <option value="other">Other / Transfers</option>
                    </>
                  ) : (
                    <>
                      <option value="food">Dining / Food</option>
                      <option value="utilities">Bills & Utilities</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="shopping">Shopping</option>
                      <option value="other">Other Expenses</option>
                    </>
                  )}
                </select>
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Memo / Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description note..."
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-bank-accent/30 focus:border-bank-accent transition-all"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 border border-slate-200 rounded-2xl text-slate-600 font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-3.5 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all duration-200 ${
                    modalType === 'deposit'
                      ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10'
                      : 'bg-bank-accent hover:bg-bank-accent/90 shadow-bank-accent/15'
                  }`}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <span>Confirm {modalType === 'deposit' ? 'Deposit' : 'Withdrawal'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default BalanceCard;
