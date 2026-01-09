import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

interface HeroProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  title = "National Defense Operations Portal",
  subtitle = "Secure, enterprise-grade command and control infrastructure for the modern defense landscape. Integrated logistics and real-time intelligence monitoring.",
  ctaText = "Access Secure Portal",
  onCtaClick = () => {}
}) => {
  const heroImageUrl = "https://images.unsplash.com/photo-1615482319206-d2545553676e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDczNjF8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBBcm15JTIwc29sZGllciUyMGluJTIwY29tYmF0JTIwZ2VhcnxlbnwwfHx8fDE3Njc4MDA5OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080";

  return (
    <div className="relative min-h-[85vh] flex items-center overflow-hidden bg-slate-900">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImageUrl}
          alt="Defense Operations"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
      </div>

      <Container className="relative z-10">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3A29FF]/20 border border-[#3A29FF]/30 text-[#FF94B4] font-bold text-xs uppercase tracking-widest mb-6">
              <ShieldCheck className="w-4 h-4" />
              Classified Access Only
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
              {title}
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed">
              {subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={onCtaClick}
                className="group"
              >
                {ctaText}
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-slate-500 text-white hover:bg-slate-800"
              >
                Operational Status
              </Button>
            </div>
          </motion.div>
        </div>
      </Container>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-0 right-0 w-1/3 h-64 bg-gradient-to-t from-[#3A29FF]/10 to-transparent blur-3xl pointer-events-none" />
    </div>
  );
};