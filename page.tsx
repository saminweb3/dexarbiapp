"use client";
import { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, TrendingUp, Zap, Lock, DollarSign } from 'lucide-react';

export default function ArbUltimate() {
  const [isAuth, setIsAuth] = useState(false);
  const [login, setLogin] = useState({ user: '', pass: '' });
  const [data, setData] = useState<any>({ ranked: [], gas: {} });
  const [amount, setAmount] = useState(1000);
  const [copied, setCopied] = useState("");

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (login.user === 'samproeth' && login.pass === 'samproeth') {
      setIsAuth(true);
    } else {
      alert("Invalid Admin Credentials");
    }
  };

  useEffect(() => {
    if (isAuth) {
      const load = () => fetch('/api/arbitrage').then(res => res.json()).then(setData);
      load();
      const interval = setInterval(load, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuth]);

  if (!isAuth) return (
    <div className="h-screen flex items-center justify-center bg-black text-white p-6 font-sans">
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4 bg-slate-900 p-8 rounded-2xl border border-slate-800">
        <Lock className="mx-auto w-10 h-10 text-blue-500 mb-2" />
        <h2 className="text-center font-bold text-xl">ADMIN ACCESS</h2>
        <input type="text" placeholder="Username" className="w-full bg-black border border-slate-700 p-3 rounded" onChange={e => setLogin({...login, user: e.target.value})} />
        <input type="password" placeholder="Password" className="w-full bg-black border border-slate-700 p-3 rounded" onChange={e => setLogin({...login, pass: e.target.value})} />
        <button className="w-full bg-blue-600 font-bold py-3 rounded hover:bg-blue-500 transition-all">UNLOCK DASHBOARD</button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h1 className="text-2xl font-black italic tracking-tighter text-blue-500 flex items-center gap-2">
            <Zap className="fill-blue-500" /> EVM ARB RANKER
          </h1>
          <div className="flex items-center gap-3 bg-black px-4 py-2 rounded-lg border border-slate-800">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <input 
              type="number" value={amount} 
              onChange={(e) => setAmount(Number(e.target.value))}
              className="bg-transparent text-emerald-400 font-bold w-24 outline-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          {data.ranked.map((item: any, idx: number) => {
            const netProfit = (amount * (item.spread / 100)) - item.totalGasEst - (amount * 0.003);
            return (
              <div key={idx} className={relative bg-slate-900 border ${idx === 0 ? 'border-yellow-500' : 'border-slate-800'} rounded-2xl p-6}>
                <div className={absolute -top-3 left-6 px-4 py-1 rounded-full text-[10px] font-black ${idx === 0 ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-slate-400'}}>
                  RANK #{idx + 1}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      {item.symbol}
                      <button onClick={() => { navigator.clipboard.writeText(item.tokenAddress); setCopied(item.symbol); setTimeout(()=>setCopied(""), 2000); }}>
                        {copied === item.symbol ? <Check size={14} className="text-emerald-400"/> : <Copy size={14}/>}
                      </button></h3>
                    <p className="text-[10px] text-slate-500 font-mono truncate">{item.tokenAddress}</p>
                  </div>
                  <div className="md:col-span-2 flex justify-between bg-black/40 p-4 rounded-xl">
                    <div className="text-center"><p className="text-[10px] text-blue-400 font-bold">{item.buy.chain}</p><p className="font-mono text-emerald-400">${item.buy.price.toFixed(6)}</p></div>
                    <TrendingUp className="text-slate-700" />
                    <div className="text-center"><p className="text-[10px] text-purple-400 font-bold">{item.sell.chain}</p><p className="font-mono text-rose-400">${item.sell.price.toFixed(6)}</p></div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Net Profit</p>
                    <p className={text-2xl font-black ${netProfit > 0 ? 'text-emerald-400' : 'text-slate-500'}}>${netProfit.toFixed(2)}</p>
                    <a href={item.buy.link} target="_blank" className="inline-block mt-3 bg-white text-black px-4 py-2 rounded text-xs font-black uppercase tracking-tighter hover:bg-blue-500 hover:text-white transition-all">Execute <ExternalLink size={12} className="inline ml-1"/></a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
