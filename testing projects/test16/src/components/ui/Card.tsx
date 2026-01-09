import React from 'react';
import { motion } from 'framer-motion';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = true 
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -5, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' } : {}}
      className={cn(
        'bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300',
        className
      )}
    >
      {children}
    </motion.div>
  );
};