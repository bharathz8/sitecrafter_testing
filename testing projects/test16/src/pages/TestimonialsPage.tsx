import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Star, Quote } from 'lucide-react';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

const testimonials = [
  {
    name: 'Lt. Col. Sandeep Verma',
    role: 'Battalion Commander',
    text: 'The portal has revolutionized our internal communications. Information that used to take hours to disseminate now happens in real-time with zero latency.',
    rating: 5,
    avatar: 'S'
  },
  {
    name: 'Dr. Ramesh Iyer',
    role: 'Director, Defense Research',
    text: 'Security was our primary concern. The Framework exceeded our expectations with its multi-layered encryption and robust audit trails.',
    rating: 5,
    avatar: 'R'
  },
  {
    name: 'Maj. Priya Sharma',
    role: 'Logistics Officer',
    text: 'Managing supply lines across varied terrain was a nightmare until we implemented the Project Setu dashboard. Highly efficient and reliable.',
    rating: 4,
    avatar: 'P'
  },
  {
    name: 'Col. Amit Bhardwaj',
    role: 'Signals Division',
    text: 'Intuitive design meets high-performance engineering. It is rare to find a tool that is both powerful and easy for personnel to adopt.',
    rating: 5,
    avatar: 'A'
  }
];

const TestimonialsPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 pt-32 pb-24 text-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <header className="text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Voice of the Command
          </motion.h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Trusted by commanders and technical officers across all branches of service.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {(testimonials ?? []).map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 md:p-12 bg-slate-800 border-slate-700 relative h-full">
                <Quote className="absolute top-8 right-8 w-12 h-12 text-indigo-500/20" />
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, starIndex) => (
                    <Star 
                      key={starIndex} 
                      className={cn("w-5 h-5", starIndex < t.rating ? "text-amber-400 fill-amber-400" : "text-slate-600")} 
                    />
                  ))}
                </div>
                <p className="text-xl italic text-slate-100 mb-8 leading-relaxed">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{t.name}</h4>
                    <p className="text-slate-400 text-sm">{t.role}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Hero Image / Stats */}
        <section className="mt-32">
          <div className="relative rounded-3xl overflow-hidden h-96">
            <img 
              src="https://images.unsplash.com/photo-1613825787641-2dbbd4f96a1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDczNjF8MHwxfHNlYXJjaHwxfHxDbG9zZS11cCUyMG9mR2FsbGFudHJ5JTIwQXdhcmRzJTIwYW5kJTIwbWVkYWxzfGVufDB8fHx8MTc2NzgwMTAwN3ww&ixlib=rb-4.1.0&q=80&w=1080" 
              alt="Medals"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-indigo-900/40 flex items-center justify-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
                <div>
                  <div className="text-5xl font-bold mb-2">98%</div>
                  <div className="text-indigo-200 font-medium">User Satisfaction</div>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">24/7</div>
                  <div className="text-indigo-200 font-medium">Active Support</div>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">0</div>
                  <div className="text-indigo-200 font-medium">Security Breaches</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TestimonialsPage;