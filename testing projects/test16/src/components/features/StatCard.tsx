import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../ui/Card';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType<any>; 
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title = 'Metric',
  value = '0',
  icon: Icon,
  change = 0,
  trend = 'neutral',
  description = ''
}) => {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="p-3 rounded-xl bg-indigo-50 text-[#3A29FF]">
          <Icon className="w-6 h-6" />
        </div>
        {change !== 0 ? (
          <div className={cn(
            'flex items-center gap-1 text-sm font-bold',
            trend === 'up' ? 'text-emerald-600' : 'text-[#FF3232]'
          )}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(change)}%
          </div>
        ) : null}
      </div>
      
      <div className="mt-4">
        <h4 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{title}</h4>
        <div className="text-3xl font-black text-slate-900 mt-1">{value}</div>
        {description ? (
          <p className="text-slate-500 text-xs mt-2">{description}</p>
        ) : null}
      </div>
    </Card>
  );
};