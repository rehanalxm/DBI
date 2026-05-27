import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import BalanceCard from '../components/BalanceCard';
import SummaryCard from '../components/SummaryCard';
import TransactionTable from '../components/TransactionTable';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { 
  Bell, RefreshCw, Phone, MapPin, Calendar, CreditCard, Trash2, 
  AlertTriangle, Loader2, X, Send, Eye, EyeOff, ShieldCheck, ShieldAlert,
  UserPlus, ArrowRight, UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { 
    user, reloadProfile, deleteAccount, 
    transferFunds, toggleCardFreeze, addSavedPayee, deleteSavedPayee 
  } = useContext(AuthContext);
  
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmWord, setConfirmWord] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Search parameters for tab control
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  
  // Form states for Transfers
  const [recipient, setRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  
  // Form states for Payees
  const [payeeName, setPayeeName] = useState('');
  const [payeeAcc, setPayeeAcc] = useState('');
  const [isAddingPayee, setIsAddingPayee] = useState(false);
  const [showAddPayeeModal, setShowAddPayeeModal] = useState(false);

  // States for Card Security Tab
  const [showCVV, setShowCVV] = useState(false);
  const [isTogglingCard, setIsTogglingCard] = useState(false);

  const navigate = useNavigate();

  const fetchTransactions = async (silent = false) => {
    try {
      if (!silent) setTxLoading(true);
      const { data } = await API.get('/account/transactions');
      if (data && data.success) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to sync account logs.');
    } finally {
      if (!silent) setTxLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleTransactionSuccess = () => {
    fetchTransactions(true); // silent fetch
  };

  const handleManualSync = async () => {
    await Promise.all([reloadProfile(), fetchTransactions()]);
    toast.success('Account logs synchronized.');
  };

  const formatDOB = (dobStr) => {
    if (!dobStr) return 'N/A';
    const d = new Date(dobStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Fund Transfer Submit
  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    const amountVal = parseFloat(transferAmount);

    if (!recipient.trim()) {
      toast.error('Please enter a recipient registered email or account number.');
      return;
    }

    if (isNaN(amountVal) || amountVal <= 0) {
      toast.error('Please enter a valid amount greater than zero.');
      return;
    }

    if (amountVal > user.balance) {
      toast.error('Insufficient funds to complete this transfer.');
      return;
    }

    if (user.isCardFrozen) {
      toast.error('Transfer blocked. Your virtual debit card is frozen.');
      return;
    }

    try {
      setIsTransferring(true);
      const res = await transferFunds(recipient, amountVal);
      if (res.success) {
        toast.success(res.message);
        setRecipient('');
        setTransferAmount('');
        await fetchTransactions(true);
      } else {
        toast.error(res.message || 'Transfer failed.');
      }
    } catch (error) {
      console.error('Transfer submit error:', error);
      toast.error('Could not complete transfer.');
    } finally {
      setIsTransferring(false);
    }
  };

  // Toggle Card Freeze status
  const handleCardToggle = async () => {
    try {
      setIsTogglingCard(true);
      const res = await toggleCardFreeze();
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message || 'Failed to toggle card status.');
      }
    } catch (error) {
      console.error('Card toggle error:', error);
      toast.error('Connection error updating card settings.');
    } finally {
      setIsTogglingCard(false);
    }
  };

  // Add Payee Submit
  const handleAddPayeeSubmit = async (e) => {
    e.preventDefault();
    if (!payeeName.trim() || !payeeAcc.trim()) {
      toast.error('Payee name and account number are required.');
      return;
    }

    try {
      setIsAddingPayee(true);
      const res = await addSavedPayee(payeeName, payeeAcc);
      if (res.success) {
        toast.success(res.message);
        setPayeeName('');
        setPayeeAcc('');
        setShowAddPayeeModal(false);
      } else {
        toast.error(res.message || 'Failed to add payee.');
      }
    } catch (error) {
      console.error('Add payee error:', error);
      toast.error('Connection error saving payee details.');
    } finally {
      setIsAddingPayee(false);
    }
  };

  // Delete Payee click
  const handleDeletePayee = async (accountNumber) => {
    try {
      const res = await deleteSavedPayee(accountNumber);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message || 'Failed to delete payee.');
      }
    } catch (error) {
      console.error('Delete payee error:', error);
      toast.error('Connection error deleting payee.');
    }
  };

  // Delete account confirmation
  const handleCloseAccount = async (e) => {
    e.preventDefault();
    if (confirmWord !== 'DELETE') {
      toast.error("Please type 'DELETE' to authorize account closure.");
      return;
    }

    try {
      setIsDeleting(true);
      const res = await deleteAccount();
      if (res.success) {
        toast.success('Your DoxBankOfIndia account has been permanently deleted.');
        navigate('/');
      } else {
        toast.error(res.message || 'Account closure request failed.');
      }
    } catch (error) {
      console.error('Error wiping account:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setConfirmWord('');
    }
  };

  const formatAccountNumber = (num) => {
    if (!num) return '';
    return num.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Dashboard Container */}
      <main className="flex-1 md:ml-64 min-w-0 p-6 md:p-10 space-y-8">
        
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5 pt-8 md:pt-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-bank-secondary tracking-tight">
              Welcome, {user?.name}!
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Account status: <span className="font-semibold text-emerald-600">Active</span> • Instant balance tracking enabled
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleManualSync}
              title="Sync Transactions"
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-bank-secondary hover:bg-slate-50 hover-scale shadow-sm cursor-pointer transition-colors"
            >
              <RefreshCw size={16} />
            </button>
            <div 
              title="Notifications"
              className="relative p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-bank-secondary hover-scale shadow-sm cursor-pointer transition-colors"
            >
              <Bell size={16} />
              <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 bg-bank-accent rounded-full"></span>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Swapper */}
        <div className="space-y-8 animate-fade-in">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              {/* Card Account Panel */}
              <BalanceCard onTransactionSuccess={handleTransactionSuccess} />

              {/* Cards metrics overview */}
              <SummaryCard transactions={transactions} />

              {/* Profile Details & Account Management Danger Zone Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Profile Info Details Panel */}
                <div className="lg:col-span-2 glass-card rounded-3xl p-6 space-y-5">
                  <div className="border-b border-slate-150 pb-3">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Profile Information</h3>
                    <p className="text-[11px] text-slate-400">Personal details registered with your account number</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {/* Account Type info */}
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="p-2 rounded-xl bg-bank-accent/10 text-bank-accent">
                        <CreditCard size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Account Type</p>
                        <p className="font-bold text-slate-700 capitalize mt-0.5">{user?.accountType || 'Savings'}</p>
                      </div>
                    </div>

                    {/* Phone number info */}
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="p-2 rounded-xl bg-bank-accent/10 text-bank-accent">
                        <Phone size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Phone Number</p>
                        <p className="font-bold text-slate-700 mt-0.5">{user?.phone || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Date of Birth info */}
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="p-2 rounded-xl bg-bank-accent/10 text-bank-accent">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Date of Birth</p>
                        <p className="font-bold text-slate-700 mt-0.5">{formatDOB(user?.dob)}</p>
                      </div>
                    </div>

                    {/* Address info */}
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 md:col-span-2">
                      <div className="p-2 rounded-xl bg-bank-accent/10 text-bank-accent shrink-0">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Residential Address</p>
                        <p className="font-semibold text-slate-600 mt-0.5 leading-relaxed text-xs">{user?.address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Closure Danger Zone Widget */}
                <div className="glass-card rounded-3xl p-6 border-rose-100 bg-rose-50/25 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-rose-700 font-bold text-sm uppercase tracking-wider">
                      <AlertTriangle size={18} className="stroke-[2.5]" />
                      <span>Danger Zone</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Close your account with DoxBankOfIndia. This action is **irreversible**. Wipes all details, transaction lists, and balances permanently from our database.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-250 hover:border-rose-300 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 hover-scale cursor-pointer transition-all"
                  >
                    <Trash2 size={16} />
                    <span>Close Account & Wipe Data</span>
                  </button>
                </div>
              </div>

              {/* Transactions Table Log */}
              <TransactionTable transactions={transactions} isLoading={txLoading} />
            </>
          )}

          {/* TAB 2: SEND MONEY */}
          {activeTab === 'transfers' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Transfer Form Panel */}
              <div className="lg:col-span-2 glass-card rounded-3xl p-6 space-y-6">
                <div className="border-b border-slate-150 pb-4">
                  <h3 className="text-base font-bold text-slate-800">Send Money Instantly</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Transfer funds securely using a registered recipient Email or 10-digit Account Number.</p>
                </div>

                <form onSubmit={handleTransferSubmit} className="space-y-5">
                  {/* Recipient Identifier */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Recipient Email or Account Number
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Send size={16} />
                      </span>
                      <input
                        type="text"
                        required
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="e.g. name@example.com or 1234567890"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-bank-accent/30 focus:border-bank-accent transition-all"
                      />
                    </div>
                  </div>

                  {/* Transfer Amount */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Amount to Transfer (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 font-bold focus:outline-none focus:ring-2 focus:ring-bank-accent/30 focus:border-bank-accent transition-all text-lg"
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-2 flex justify-between">
                      <span>Available Balance:</span>
                      <span className="font-semibold text-slate-600">₹{user?.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}</span>
                    </p>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isTransferring || user?.isCardFrozen}
                    className="w-full py-4 rounded-2xl bg-bank-accent hover:bg-bank-accent/95 text-white font-bold text-sm shadow-lg shadow-bank-accent/15 flex items-center justify-center gap-2 hover-scale cursor-pointer transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {isTransferring ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Send Funds Securely</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Saved Payees Directory */}
              <div className="glass-card rounded-3xl p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-150 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Payee Directory</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Quick transaction contacts book</p>
                    </div>
                    <button
                      onClick={() => setShowAddPayeeModal(true)}
                      className="p-2 bg-bank-accent/10 border border-bank-accent/20 hover:bg-bank-accent/20 text-bank-accent rounded-xl hover-scale cursor-pointer transition-all"
                    >
                      <UserPlus size={16} />
                    </button>
                  </div>

                  {/* Payee contact list */}
                  <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                    {user?.payees?.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 space-y-1">
                        <p className="text-xs font-bold text-slate-600">No payees saved yet</p>
                        <p className="text-[10px] text-slate-400">Save frequent recipient details for quick access</p>
                      </div>
                    ) : (
                      user?.payees?.map((payee) => (
                        <div 
                          key={payee.accountNumber}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors group"
                        >
                          {/* Left details click autofills the Transfer Input */}
                          <div 
                            onClick={() => setRecipient(payee.accountNumber)}
                            className="flex-1 text-left cursor-pointer"
                            title="Click to transfer money"
                          >
                            <p className="text-xs font-bold text-slate-700 group-hover:text-bank-accent transition-colors">{payee.name}</p>
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5">{formatAccountNumber(payee.accountNumber)}</p>
                          </div>
                          
                          <button
                            onClick={() => handleDeletePayee(payee.accountNumber)}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-slate-100/50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200/40 text-[11px] text-slate-400 leading-relaxed">
                  💡 **Tip**: Click on any contact name inside your payee directory to automatically load their account number into the transfer field.
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CARD SECURITY */}
          {activeTab === 'card' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Virtual Card panel */}
              <div className="lg:col-span-2 glass-card rounded-3xl p-6 space-y-8">
                <div className="border-b border-slate-150 pb-4">
                  <h3 className="text-base font-bold text-slate-800">Virtual Card Manager</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Control the digital authorization and security options for your card details.</p>
                </div>

                {/* Visa credit card representation */}
                <div className={`relative overflow-hidden rounded-3xl text-white p-8 flex flex-col justify-between aspect-[1.78/1] max-w-lg mx-auto w-full transition-all duration-300 shadow-2xl ${
                  user?.isCardFrozen 
                    ? 'bg-slate-800 border border-slate-700 opacity-60 grayscale' 
                    : 'bg-gradient-to-tr from-slate-900 via-bank-primary to-bank-accent'
                }`}>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="flex justify-between items-start z-10">
                    <div>
                      <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest">DoxBank Premium</p>
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">₹{user?.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
                    </div>
                    <Landmark className="h-8 w-8 text-white/80" />
                  </div>

                  <div className="my-2 z-10">
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-medium">Card Number</p>
                    <p className="text-base sm:text-lg font-mono tracking-widest font-semibold mt-0.5">
                      4000 1234 {user?.accountNumber ? user.accountNumber.substring(0, 4) : 'XXXX'} {user?.accountNumber ? user.accountNumber.substring(4) : 'XXXX'}
                    </p>
                  </div>

                  <div className="flex justify-between items-end z-10">
                    <div className="flex gap-6">
                      <div>
                        <p className="text-[8px] text-slate-400 uppercase tracking-widest font-medium">Card Holder</p>
                        <p className="text-xs font-semibold tracking-wide text-slate-100">{user?.name}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-slate-400 uppercase tracking-widest font-medium">Expires</p>
                        <p className="text-xs font-semibold font-mono tracking-wide text-slate-100">12/31</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-slate-400 uppercase tracking-widest font-medium">CVV</p>
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-semibold font-mono tracking-wide text-slate-100">
                            {showCVV ? '824' : '•••'}
                          </p>
                          <button
                            onClick={() => setShowCVV(!showCVV)}
                            className="p-0.5 hover:bg-white/10 rounded transition-colors text-slate-400 hover:text-white"
                          >
                            {showCVV ? <EyeOff size={10} /> : <Eye size={10} />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="h-4 w-4 bg-orange-500 rounded-full opacity-80"></span>
                      <span className="h-4 w-4 bg-red-500 rounded-full -ml-2 opacity-80"></span>
                    </div>
                  </div>
                </div>

                {/* Info tags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                    <p className="font-bold text-slate-700">Withdrawal Limit</p>
                    <p className="text-slate-400">Daily limit: ₹50,000 / transaction</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                    <p className="font-bold text-slate-700">Online Transactions</p>
                    <p className="text-slate-400">Supported: Domestic & International</p>
                  </div>
                </div>
              </div>

              {/* Freeze Control panel */}
              <div className="glass-card rounded-3xl p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-150 pb-3">
                    <ShieldCheck className="h-5 w-5 text-bank-accent" />
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Security Controls</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                      <div>
                        <p className="text-xs font-bold text-slate-700">Freeze Debit Card</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Temporarily block transactions</p>
                      </div>
                      
                      {/* Interactive Switch */}
                      <button
                        onClick={handleCardToggle}
                        disabled={isTogglingCard}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          user?.isCardFrozen ? 'bg-rose-500' : 'bg-slate-350'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            user?.isCardFrozen ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {user?.isCardFrozen ? (
                    <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-50 border border-rose-100/50 text-[11px] text-rose-700">
                      <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        **Card Frozen**: The card is currently deactivated. All deposits, withdrawals, and inter-account transfers are locked for your security.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-50 border border-emerald-100/50 text-[11px] text-emerald-800">
                      <UserCheck size={16} className="shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        **Card Active**: The card is currently active and authorized. All banking services (atm deposits, online transfers, cash withdrawals) are fully available.
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle size={20} className="stroke-[2.5]" />
                <h4 className="text-base font-bold">Confirm Account Deletion</h4>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmWord('');
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleCloseAccount} className="p-6 space-y-5">
              <div className="space-y-2">
                <p className="text-xs text-slate-500 leading-relaxed">
                  You are closing your account and removing all data permanently. This includes balance details, profile logs, and transactional records.
                </p>
                <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100/50 p-2.5 rounded-xl">
                  Type the word <span className="font-extrabold font-mono text-sm tracking-wider">DELETE</span> in the box below to authorize.
                </p>
              </div>

              <div>
                <input
                  type="text"
                  required
                  disabled={isDeleting}
                  value={confirmWord}
                  onChange={(e) => setConfirmWord(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all text-center tracking-widest text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setConfirmWord('');
                  }}
                  disabled={isDeleting}
                  className="flex-1 py-3.5 border border-slate-200 rounded-2xl text-slate-600 font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleting || confirmWord !== 'DELETE'}
                  className={`flex-1 py-3.5 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all duration-200 ${
                    confirmWord === 'DELETE'
                      ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/10'
                      : 'bg-slate-200 text-slate-400 border border-slate-200 shadow-none cursor-not-allowed'
                  }`}
                >
                  {isDeleting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <span>Wipe Data & Leave</span>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Add Payee Modal */}
      {showAddPayeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
              <h4 className="text-base font-bold text-slate-800">Add Saved Payee</h4>
              <button
                onClick={() => {
                  setShowAddPayeeModal(false);
                  setPayeeName('');
                  setPayeeAcc('');
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddPayeeSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Payee Full Name
                </label>
                <input
                  type="text"
                  required
                  disabled={isAddingPayee}
                  value={payeeName}
                  onChange={(e) => setPayeeName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-bank-accent/30 focus:border-bank-accent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Recipient Account Number (10 digits)
                </label>
                <input
                  type="text"
                  required
                  disabled={isAddingPayee}
                  value={payeeAcc}
                  onChange={(e) => setPayeeAcc(e.target.value)}
                  placeholder="e.g. 1029384756"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-bank-accent/30 focus:border-bank-accent transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddPayeeModal(false);
                    setPayeeName('');
                    setPayeeAcc('');
                  }}
                  disabled={isAddingPayee}
                  className="flex-1 py-3.5 border border-slate-200 rounded-2xl text-slate-600 font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingPayee}
                  className="flex-1 py-3.5 rounded-2xl bg-bank-accent hover:bg-bank-accent/90 text-white font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-bank-accent/15 transition-all"
                >
                  {isAddingPayee ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <span>Save Payee</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
