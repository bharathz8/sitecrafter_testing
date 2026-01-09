import React from 'react';
import { motion } from 'framer-motion';
import { ContactForm } from '@/components/features/ContactForm';
import { Card } from '@/components/ui/Card';
import { Mail, Phone, MapPin, Clock, Globe } from 'lucide-react';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

const ContactPage = () => {
  const contactInfo = [
    {
      icon: <Phone className="w-5 h-5" />,
      title: 'Emergency Support',
      value: '+91 11 2301-xxxx',
      sub: '24/7 Tactical Hotline'
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: 'Technical Inquiries',
      value: 'support@defenseportal.gov.in',
      sub: 'Response within 4 hours'
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: 'Headquarters',
      value: 'South Block, New Delhi',
      sub: 'India, 110011'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-4">Get in Touch</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Secure communication channels for regimental inquiries, technical support, and strategic partnerships.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info Column */}
          <div className="lg:col-span-1 space-y-6">
            {(contactInfo ?? []).map((info, i) => (
              <Card key={i} className="p-6 border-none shadow-sm flex items-start gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  {info?.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">{info?.title}</h3>
                  <p className="text-lg font-bold text-slate-900 mb-1">{info?.value}</p>
                  <p className="text-sm text-slate-500">{info?.sub}</p>
                </div>
              </Card>
            ))}

            <Card className="p-8 bg-slate-900 text-white border-none shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-4">Secure Messaging</h3>
                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                  All communications through this portal are end-to-end encrypted. For classified queries, please use the encrypted terminal access.
                </p>
                <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                  <Clock className="w-4 h-4" />
                  <span>Avg Response: 12 mins</span>
                </div>
              </div>
              <div className="absolute bottom-0 right-0 opacity-10">
                <Globe className="w-32 h-32 translate-x-1/4 translate-y-1/4" />
              </div>
            </Card>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-2">
            <Card className="p-8 md:p-12 border-none shadow-xl bg-white rounded-3xl">
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Send a Secure Message</h2>
                <p className="text-slate-600">Please provide your unit details for priority routing.</p>
              </div>
              <ContactForm />
            </Card>
          </div>
        </div>
      </div>

      {/* Map/Location Section */}
      <section className="mt-24 container mx-auto px-4 max-w-7xl">
        <div className="rounded-3xl overflow-hidden h-96 relative shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1681135092730-b943082aeba5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDczNjF8MHwxfHNlYXJjaHwxfHxNaWxpdGFyeSUyMGNvbW1hbmQlMjBhbmQlMjBjb250cm9sJTIwY2VudGVyfGVufDB8fHx8MTc2NzgwMTAwOXww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Command Center"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-[2px] flex items-center justify-center">
            <div className="bg-white/95 p-8 rounded-2xl shadow-2xl max-w-sm text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Central Operations Hub</h3>
              <p className="text-slate-600 mb-4 text-sm">Strategic Coordination Center, New Delhi Base</p>
              <div className="text-xs font-mono text-indigo-600 bg-indigo-50 py-2 rounded">
                COORD: 28.6139° N, 77.2090° E
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;