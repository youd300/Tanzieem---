import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Coins, ArrowUpRight, ArrowDownLeft, Calendar, ShieldCheck, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../services/authContext';

interface CoinHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoinHistoryModal: React.FC<CoinHistoryModalProps> = ({ isOpen, onClose }) => {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await api.coins.getTransactions();
      setTransactions(data);
    } catch (err) {
      console.warn('Failed to load coin transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTransactions();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-[#080E1C] border border-amber-500/30 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden text-slate-100 max-h-[85vh] flex flex-col"
        >
          {/* Top Bar */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Chrono Coins Ledger</h3>
                <p className="text-xs text-slate-400">Authentic double-entry transaction history</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchTransactions}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Refresh Ledger"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Current Balance Banner */}
          <div className="p-5 bg-gradient-to-br from-amber-500/10 via-slate-900/80 to-slate-950 border-b border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Current Verified Balance</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-amber-300 tracking-tight">{profile?.coins ?? 500}</span>
                <span className="text-xs text-amber-400/80 font-semibold">Coins</span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <ShieldCheck className="w-3 h-3" />
                Audited & Persistent
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Starting balance = 500 Coins</p>
            </div>
          </div>

          {/* Transaction List */}
          <div className="flex-1 p-5 overflow-y-auto space-y-2.5 text-xs">
            {loading ? (
              <div className="py-12 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                <p>Retrieving transaction ledger from database...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Coins className="w-8 h-8 mx-auto mb-2 opacity-30 text-amber-400" />
                <p>No coin transactions logged yet.</p>
              </div>
            ) : (
              transactions.map((tx) => {
                const isCredit = tx.type === 'credit';
                const dateStr = new Date(tx.timestamp).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isCredit
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-200">{tx.reason}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {dateStr}
                          </span>
                          <span>•</span>
                          <span>Balance: {tx.balance_after}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-sm font-black font-mono ${
                          isCredit ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isCredit ? `+${tx.amount}` : `-${tx.amount}`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
