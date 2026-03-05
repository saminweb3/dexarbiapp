// app/page.tsx
"use client";
import { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, TrendingUp, Zap, Lock } from 'lucide-react';

export default function ArbUltimate() {
  const [isAuth, setIsAuth] = useState(false);
  const [login, setLogin] = useState({ user: '', pass: '' });
  const [data, setData] = useState<any>({ ranked: [] });
  const [amount, setAmount] = useState(1000);
  const [copied, setCopied] = useState("");

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (login.user === 'samproeth' && login.pass === 'samproeth') {
      setIsAuth(true);
      localStorage.setItem('auth_arb', 'true'); // Persist session
    } else {
      alert("Invalid Admin Credentials");
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    if (localStorage.getItem('auth_arb') === 'true') {
      setIsAuth(true);
    }
  }, []);

  useEffect(() => {
    if (isAuth) {
      const load = () => fetch('/api/arbitrage').then(res => res.json()).then(setData);
      load();
      const interval = setInterval(load, 60000); // Polling every 60s
      return () => clearInterval(interval);
    }
  }, [isAuth]);

  // Login Screen
  if (!isAuth) return (
    <div className="h-screen flex items-center justify-center bg-black text-white p-6 font-sans">
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4 bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
        <Lock className="mx-auto w-10 h-10 text-blue-500 mb-2" />
        <h2 className="text-center font-bold text-xl uppercase tracking-tighter">Admin Access Only</h2>
        <input type="text" placeholder="Username" className="w-full bg-black border border-zinc-700 p-3 rounded outline-none focus:border-blue-500" onChange={e => setLogin({...login, user: e.target.value})} />
        <input type="password" placeholder="Password" className="w-full bg-black border border-zinc-700 p-3 rounded outline-none focus:border-blue-500" onChange={e => setLogin({...login, pass: e.target.value})} />
        <button className="w-full bg-blue-600 font-bold py-3 rounded hover:bg-blue-500 transition-all">UNLOCK DASHBOARD</button>
      </form>
    </div>
  );

  // Main Dashboard
  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header and Capital Input */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-zinc-900 p-6 rounded-2xl border border-zinc-800 gap-4">
          <h1 className="text-2xl font-black italic tracking-tighter text-blue-500 flex items-center gap-2">
            <Zap className="fill-blue-500" /> EVM ARB RANKER
          </h1>
          
          <div className="flex flex-col items-end gap-1">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Projected Capital ($)</label>
            <input 
              type="number" value={amount} 
              onChange={(e) => setAmount(Number(e.target.value))}
              className="bg-black text-emerald-400 font-mono font-bold w-32 p-2 rounded-lg border border-zinc-800 outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Arb Opportunity List */}
        <div className="space-y-4">
          {data.ranked.map((item: any, idx: number) => {
            // Profit Calculation (Spread % - 0.3% standard DEX fee)
            const netProfit = (amount * (item.spread / 100)) - (amount * 0.003);
            
            return (
              <div key={idx} className={relative bg-zinc-900 border ${idx === 0 ? 'border-yellow-500' : 'border-zinc-800'} rounded-2xl p-6 hover:bg-zinc-800/50 transition-all}>
                
                {/* Rank Badge */}
                <div className={`absolute -top-3 left-6 px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
