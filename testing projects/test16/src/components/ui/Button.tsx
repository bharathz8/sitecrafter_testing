import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}) => {
  const variants = {
    primary: 'bg-[#3A29FF] text-white hover:bg-[#2A1BE0] shadow-md',
    secondary: 'bg-[#FF94B4] text-slate-900 hover:bg-[#FF7DA3] shadow-md',
    accent: 'bg-[#FF3232] text-white hover:bg-[#E62E2E] shadow-md',
    outline: 'border-2 border-[#3A29FF] text-[#3A29FF] hover:bg-[#3A29FF] hover:text-white',
    ghost: 'text-slate-600 hover:bg-slate-100'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg font-bold'
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </motion.button>
  );
};