import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Layout, Search, ShoppingCart, User, LogIn } from 'lucide-react';

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Services', path: '/services' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Blog', path: '/blog' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Testimonials', path: '/testimonials' },
  ];

  const actionLinks = [
    { name: 'Search', path: '/search', icon: <Search size={18} /> },
    { name: 'Cart', path: '/cart', icon: <ShoppingCart size={18} /> },
    { name: 'Profile', path: '/profile', icon: <User size={18} /> },
    { name: 'Login', path: '/login', icon: <LogIn size={18} /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-4 md:justify-start md:space-x-10">
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#3A29FF]">
                <Layout className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#3A29FF] to-indigo-600 hidden lg:block">
                Enterprise Portal
              </span>
            </Link>
          </div>

          <div className="-mr-2 -my-2 md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-white rounded-md p-2 inline-flex items-center justify-center text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none"
            >
              <span className="sr-only">Open menu</span>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <nav className="hidden md:flex space-x-6 items-center">
            {navLinks.slice(0, 5).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-medium text-slate-600 hover:text-[#3A29FF] transition-colors"
              >
                {link.name}
              </Link>
            ))}
            
            <div className="h-6 w-px bg-slate-200 mx-2" />

            <div className="flex items-center space-x-4">
              {actionLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="p-2 text-slate-500 hover:text-[#3A29FF] transition-colors"
                  title={link.name}
                >
                  {link.icon}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden">
          <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white divide-y-2 divide-slate-50">
            <div className="pt-5 pb-6 px-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layout className="text-[#3A29FF]" size={24} />
                  <span className="font-bold text-slate-900">Enterprise Portal</span>
                </div>
                <div className="-mr-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="bg-white rounded-md p-2 inline-flex items-center justify-center text-slate-400 hover:text-slate-500 hover:bg-slate-100"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              <div className="mt-6">
                <nav className="grid gap-y-4">
                  {[...navLinks, ...actionLinks].map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center p-3 rounded-md hover:bg-slate-50 text-base font-medium text-slate-900"
                    >
                      <span className="ml-3">{link.name}</span>
                    </Link>
                  ))}
                  <Link
                    to="*"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center p-3 rounded-md hover:bg-slate-50 text-base font-medium text-slate-900"
                  >
                    <span className="ml-3 text-red-500">404 Debug</span>
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};