import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Inbox, Calendar, Search } from 'lucide-react';

const TransactionTable = ({ transactions = [], isLoading = false }) => {
  const [filter, setFilter] = useState('all'); // 'all', 'deposit', 'withdraw'
  const [search, setSearch] = useState('');

  // Format date helper
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  // Filter and search transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesFilter = filter === 'all' || tx.type === filter;
    const matchesSearch = tx._id.toLowerCase().includes(search.toLowerCase()) || 
                          tx.amount.toString().includes(search);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="glass-card rounded-3xl overflow-hidden p-6 space-y-6">
      
      {/* Table Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Transaction History</h3>
          <p className="text-xs text-slate-500">View and audit your account activities</p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-full sm:w-48">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={14} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Transaction ID..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-bank-accent/30 focus:border-bank-accent placeholder-slate-400"
            />
          </div>
          
          <div className="flex bg-slate-100/80 p-0.5 rounded-xl border border-slate-200/50">
            {['all', 'deposit', 'withdraw'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1 text-[11px] font-semibold capitalize rounded-lg transition-colors cursor-pointer ${
                  filter === type
                    ? 'bg-white text-bank-secondary shadow-sm'
                    : 'text-slate-500 hover:text-bank-secondary'
                }`}
              >
                {type === 'all' ? 'All' : type === 'deposit' ? 'Deposits' : 'Withdrawals'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <th className="px-5 py-4">Transaction ID</th>
              <th className="px-5 py-4">Date & Time</th>
              <th className="px-5 py-4">Type</th>
              <th className="px-5 py-4 text-right">Amount</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan="4" className="px-5 py-12 text-center text-slate-400">
                  <div className="flex justify-center items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-bank-accent animate-ping"></span>
                    <span>Updating transaction logs...</span>
                  </div>
                </td>
              </tr>
            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-5 py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-full text-slate-300">
                      <Inbox size={28} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">No records found</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {transactions.length === 0 
                          ? "Perform a deposit or withdrawal to list activities."
                          : "Try updating your search/filter parameters."}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const isDeposit = tx.type === 'deposit';
                return (
                  <tr key={tx._id} className="hover:bg-slate-50/65 transition-colors group">
                    <td className="px-5 py-4 font-mono text-xs text-slate-500 font-medium">
                      <span className="text-slate-300">#</span>{tx._id}
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-slate-400" />
                        <span>{formatDate(tx.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              isDeposit
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                            }`}
                          >
                            {isDeposit ? (
                              <ArrowDownLeft size={10} className="stroke-[3]" />
                            ) : (
                              <ArrowUpRight size={10} className="stroke-[3]" />
                            )}
                            {isDeposit ? 'Deposit' : 'Withdrawal'}
                          </span>

                          <span className="inline-block text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 px-2 py-0.5 rounded-md uppercase tracking-widest">
                            {tx.category || 'other'}
                          </span>
                        </div>
                        {tx.description && (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium pl-1 truncate max-w-[280px]" title={tx.description}>
                            {tx.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td
                      className={`px-5 py-4 font-bold text-right text-base ${
                        isDeposit ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isDeposit ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
