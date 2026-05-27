import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Activity } from 'lucide-react';

const SummaryCard = ({ transactions = [] }) => {
  // Compute analytics dynamically from the transactions array
  const totalDeposited = transactions
    .filter((tx) => tx.type === 'deposit')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalWithdrawn = transactions
    .filter((tx) => tx.type === 'withdraw')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalTransactionsCount = transactions.length;

  const cards = [
    {
      title: 'Total Deposited',
      value: `₹${totalDeposited.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: ArrowDownLeft,
      colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/10',
      description: 'Incoming capital flow',
    },
    {
      title: 'Total Withdrawn',
      value: `₹${totalWithdrawn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: ArrowUpRight,
      colorClass: 'text-rose-500 bg-rose-500/10 border-rose-500/10',
      description: 'Outgoing capital flow',
    },
    {
      title: 'Transactions Logged',
      value: totalTransactionsCount.toString(),
      icon: Activity,
      colorClass: 'text-bank-accent bg-bank-accent/10 border-bank-accent/10',
      description: 'Total completed transactions',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="glass-card hover-scale rounded-2xl p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.title}</p>
                <h4 className="text-xl font-bold text-slate-800 mt-2 tracking-tight">{card.value}</h4>
              </div>
              <div className={`p-2.5 rounded-xl border ${card.colorClass}`}>
                <Icon size={20} />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4 border-t border-slate-100 pt-3">{card.description}</p>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCard;
