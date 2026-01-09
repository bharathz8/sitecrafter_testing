import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/Card';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

interface Activity {
  id: string;
  type: 'security' | 'alert' | 'success';
  title: string;
  timestamp: string;
  user: string;
}

interface ActivityFeedProps {
  activities?: Activity[];
  maxItems?: number;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities = [
    { id: '1', type: 'security', title: 'Firewall Breach Attempt Blocked', timestamp: '2 mins ago', user: 'System' },
    { id: '2', type: 'success', title: 'Satellite Uplink Established', timestamp: '15 mins ago', user: 'Cmdr. Sharma' },
    { id: '3', type: 'alert', title: 'Logistics Delay: Sector 7', timestamp: '1 hour ago', user: 'LogiBot' },
    { id: '4', type: 'security', title: 'New Admin Credentials Issued', timestamp: '4 hours ago', user: 'HQ' },
  ],
  maxItems = 5
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'security': return <Shield className="w-4 h-4 text-[#3A29FF]" />;
      case 'alert': return <AlertTriangle className="w-4 h-4 text-[#FF3232]" />;
      case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'security': return 'bg-indigo-50';
      case 'alert': return 'bg-red-50';
      case 'success': return 'bg-emerald-50';
      default: return 'bg-slate-50';
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Operational Logs</h3>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live</span>
      </div>
      <div className="p-0">
        {(activities ?? []).slice(0, maxItems).map((activity, idx) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-start gap-4 p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
          >
            <div className={cn('p-2 rounded-lg mt-0.5', getBg(activity.type))}>
              {getIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{activity.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500 font-medium">{activity.user}</span>
                <span className="text-[10px] text-slate-300">•</span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {activity.timestamp}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="p-4 mt-auto border-t border-slate-100">
        <button className="w-full text-center text-sm font-bold text-[#3A29FF] hover:underline">
          View All Logs
        </button>
      </div>
    </Card>
  );
};