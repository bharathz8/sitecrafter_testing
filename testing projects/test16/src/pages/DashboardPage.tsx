import React from 'react';
import { motion } from 'framer-motion';
import { StatCard } from '@/components/features/StatCard';
import { ActivityFeed } from '@/components/features/ActivityFeed';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Users, 
  Shield, 
  AlertTriangle, 
  Activity, 
  Bell, 
  Search,
  Filter,
  Download,
  Calendar
} from 'lucide-react';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

const DashboardPage = () => {
  const stats = [
    { label: 'Active Personnel', value: '12,840', change: '+2.4%', icon: <Users className="w-5 h-5" />, trend: 'up' },
    { label: 'Security Alerts', value: '4', change: '-12%', icon: <Shield className="w-5 h-5" />, trend: 'down' },
    { label: 'System Uptime', value: '99.98%', change: 'Stable', icon: <Activity className="w-5 h-5" />, trend: 'up' },
    { label: 'Critical Tasks', value: '12', change: '+5', icon: <AlertTriangle className="w-5 h-5" />, trend: 'neutral' },
  ];

  const recentAlerts = [
    { id: 1, type: 'Security', message: 'Unauthorized login attempt blocked from region IP 192.168.1.45', time: '12 mins ago', level: 'high' },
    { id: 2, type: 'System', message: 'Database optimization completed for Central Registry', time: '1 hour ago', level: 'low' },
    { id: 3, type: 'Mission', message: 'Unit 402 reported successful link with Aegis Comms', time: '3 hours ago', level: 'medium' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Operational Dashboard</h1>
            <p className="text-slate-500">Welcome back, Commander. Here is the current status.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="bg-white">
              <Download className="w-4 h-4 mr-2" /> Export Report
            </Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              <Calendar className="w-4 h-4 mr-2" /> Mission Planner
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {(stats ?? []).map((stat, i) => (
            <StatCard 
              key={i}
              label={stat.label}
              value={stat.value}
              trend={stat.change}
              icon={stat.icon}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Activity & Feed */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-6 border-none shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Network Activity</h2>
                <div className="flex gap-2">
                  <Badge variant="outline">Last 24h</Badge>
                  <Badge variant="outline">Real-time</Badge>
                </div>
              </div>
              <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <div className="text-center">
                  <Activity className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm italic">Activity visualization loading...</p>
                </div>
              </div>
            </Card>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Deployment Feed</h2>
                <Button variant="ghost" size="sm" className="text-indigo-600">View All</Button>
              </div>
              <ActivityFeed />
            </div>
          </div>

          {/* Sidebar: Alerts & Quick Actions */}
          <div className="space-y-8">
            <Card className="p-6 border-none shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Bell className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-slate-900">Security Alerts</h2>
              </div>
              <div className="space-y-4">
                {(recentAlerts ?? []).map((alert) => (
                  <div key={alert.id} className="p-4 rounded-xl bg-slate-50 border-l-4 border-indigo-500">
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "text-xs font-bold uppercase tracking-wider",
                        alert.level === 'high' ? "text-rose-600" : 
                        alert.level === 'medium' ? "text-amber-600" : "text-emerald-600"
                      )}>
                        {alert.type}
                      </span>
                      <span className="text-xs text-slate-400">{alert.time}</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-snug">{alert.message}</p>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white">
                Open Security Console
              </Button>
            </Card>

            <Card className="p-6 bg-indigo-600 text-white border-none shadow-lg">
              <h3 className="text-lg font-bold mb-2">Resource Status</h3>
              <p className="text-indigo-100 text-sm mb-6">Current fuel and supply levels across all active sectors.</p>
              <div className="space-y-4">
                {[
                  { label: 'Fuel Reserves', value: 82 },
                  { label: 'Medical Supplies', value: 64 },
                  { label: 'Ammunition', value: 91 },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{item.label}</span>
                      <span>{item.value}%</span>
                    </div>
                    <div className="w-full h-2 bg-indigo-900/30 rounded-full overflow-hidden">
                      <div className="h-full bg-white" style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;