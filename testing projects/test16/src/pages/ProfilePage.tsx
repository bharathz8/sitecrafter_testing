import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { User, Shield, Key, Bell, Globe, Camera, Save } from 'lucide-react';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Nav */}
          <div className="md:w-64 space-y-2">
            {[
              { label: 'General Info', icon: <User className="w-4 h-4" />, active: true },
              { label: 'Security & Access', icon: <Shield className="w-4 h-4" />, active: false },
              { label: 'Key Management', icon: <Key className="w-4 h-4" />, active: false },
              { label: 'Notifications', icon: <Bell className="w-4 h-4" />, active: false },
              { label: 'Privacy Settings', icon: <Globe className="w-4 h-4" />, active: false },
            ].map((item, i) => (
              <button
                key={i}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  item.active ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "bg-white text-slate-600 hover:bg-slate-100"
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Profile Header */}
            <Card className="p-8 border-none shadow-sm bg-white overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-600 to-purple-600" />
              <div className="relative z-10 pt-8 flex flex-col md:flex-row items-end gap-6">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-3xl border-4 border-white bg-slate-200 overflow-hidden shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1615482319206-d2545553676e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDczNjF8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBBcm15JTIwc29sZGllciUyMGluJTIwY29tYmF0JTIwZ2VhcnxlbnwwfHx8fDE3Njc4MDA5OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080" 
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button className="absolute bottom-2 right-2 p-2 bg-white rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold text-slate-900">Col. Vikram Rathore</h1>
                    <Badge className="bg-emerald-100 text-emerald-700 border-none">Verified</Badge>
                  </div>
                  <p className="text-slate-500 font-medium">Senior Tactical Operations Officer • ID: 884920</p>
                </div>
                <Button className="bg-slate-900 hover:bg-slate-800 text-white mb-2">
                  View Public Profile
                </Button>
              </div>
            </Card>

            {/* Form */}
            <Card className="p-8 border-none shadow-sm bg-white">
              <h2 className="text-xl font-bold text-slate-900 mb-8 border-b border-slate-100 pb-4">Personal Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                  <Input defaultValue="Vikram Singh Rathore" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Personnel ID</label>
                  <Input defaultValue="ID-884920" disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                  <Input defaultValue="v.rathore@defense.gov.in" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone Number</label>
                  <Input defaultValue="+91 98765 43210" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Assigned Regiment</label>
                  <Input defaultValue="14th Armoured Brigade, North Command" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Bio / Statement</label>
                  <textarea 
                    className="w-full min-h-[100px] rounded-xl border-slate-200 bg-white text-slate-900 p-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    defaultValue="Dedicated to strategic excellence and the modernization of digital defense assets. Over 20 years of active service in tactical communications."
                  />
                </div>
              </div>
              
              <div className="mt-10 flex justify-end gap-4 border-t border-slate-100 pt-8">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;