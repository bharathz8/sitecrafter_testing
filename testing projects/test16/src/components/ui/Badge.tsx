import React from 'react';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'sm',
  className = ''
}) => {
  const variants = {
    primary: 'bg-indigo-100 text-[#3A29FF]',
    secondary: 'bg-pink-100 text-[#FF94B4]',
    accent: 'bg-red-100 text-[#FF3232]',
    success: 'bg-emerald-100 text-emerald-700',
    outline: 'border border-slate-300 text-slate-600'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs font-bold uppercase tracking-wider',
    md: 'px-3 py-1 text-sm font-semibold'
  };

  return (
    <span className={cn(
      'inline-flex items-center rounded-full leading-none',
      variants[variant],
      sizes[size],
      className
    )}>
      {children}
    </span>
  );
};