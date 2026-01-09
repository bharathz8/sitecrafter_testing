import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Shield, Lock, User, Eye, EyeOff, Terminal } from 'lucide-react';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-600/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Secure Access Terminal</h1>
          <p className="text-slate-400">Enter your credentials for regimental portal access.</p>
        </div>

        <Card className="p-8 bg-slate-900/50 border-slate-800 backdrop-blur-xl shadow-2xl">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Personnel ID / Email</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input 
                  placeholder="ID-XXXXXX" 
                  className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-600"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Access Key</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••" 
                  className="pl-10 pr-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-600"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-600" />
                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Remember device</span>
              </label>
              <a href="#" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">Reset Key?</a>
            </div>

            <Button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg font-bold shadow-lg shadow-indigo-600/20"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  <span>Initialize Connection</span>
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-800 text-center">
            <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-4">Classified Access Only</p>
            <div className="flex justify-center gap-4">
              <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-400 text-[10px] font-mono">
                IP: 10.0.1.254
              </div>
              <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-400 text-[10px] font-mono">
                PORT: 443/TCP
              </div>
            </div>
          </div>
        </Card>

        <p className="mt-8 text-center text-slate-500 text-sm">
          Warning: Unauthorized access is strictly prohibited and monitored under the Information Security Act.
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;