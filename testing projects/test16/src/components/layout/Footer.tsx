import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, Layout, MapPin, Phone } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Company: [
      { name: 'About', path: '/about' },
      { name: 'Blog', path: '/blog' },
      { name: 'Contact', path: '/contact' },
    ],
    Platform: [
      { name: 'Products', path: '/products' },
      { name: 'Services', path: '/services' },
      { name: 'Portfolio', path: '/portfolio' },
      { name: 'Dashboard', path: '/dashboard' },
    ],
    Account: [
      { name: 'Login', path: '/login' },
      { name: 'Profile', path: '/profile' },
      { name: 'Search', path: '/search' },
      { name: 'Cart', path: '/cart' },
    ],
  };

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <div className="flex items-center gap-2">
              <Layout className="text-[#3A29FF]" size={32} />
              <span className="text-xl font-bold text-white tracking-tight">
                Enterprise Portal Framework
              </span>
            </div>
            <p className="text-slate-400 text-base max-w-xs">
              Next-generation framework for building scalable enterprise-grade portals with ease.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-white transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Company</h3>
                <ul className="mt-4 space-y-4">
                  {footerLinks.Company.map((link) => (
                    <li key={link.name}>
                      <Link to={link.path} className="text-base hover:text-white transition-colors">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Platform</h3>
                <ul className="mt-4 space-y-4">
                  {footerLinks.Platform.map((link) => (
                    <li key={link.name}>
                      <Link to={link.path} className="text-base hover:text-white transition-colors">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Account</h3>
                <ul className="mt-4 space-y-4">
                  {footerLinks.Account.map((link) => (
                    <li key={link.name}>
                      <Link to={link.path} className="text-base hover:text-white transition-colors">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Contact</h3>
                <ul className="mt-4 space-y-4 text-base">
                  <li className="flex items-start gap-2">
                    <MapPin size={18} className="text-[#3A29FF] shrink-0" />
                    <span>123 Enterprise Way, Tech Valley, CA 94043</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone size={18} className="text-[#3A29FF] shrink-0" />
                    <span>+1 (555) 123-4567</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-base text-slate-500">
            &copy; {currentYear} Enterprise Portal Framework. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <Link to="*" className="hover:text-white">Privacy Policy</Link>
            <Link to="*" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};