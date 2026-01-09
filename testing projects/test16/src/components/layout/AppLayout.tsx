import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navigation Layer */}
      <Header />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      
      {/* Footer Layer */}
      <Footer />
    </div>
  );
};

export default AppLayout;