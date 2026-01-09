import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Hero } from '@/components/features/Hero';
import { FeatureGrid } from '@/components/features/FeatureGrid';
import { ArrowRight, Shield, Zap, Globe, Lock } from 'lucide-react';

// cn utility - ALWAYS define inline
const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

const HomePage = () => {
  const features = [
    {
      title: 'Secure Infrastructure',
      description: 'Military-grade encryption for all portal communications and data storage.',
      icon: <Lock className="w-6 h-6" />,
    },
    {
      title: 'Real-time Analytics',
      description: 'Instant insights into tactical operations and resource management.',
      icon: <Zap className="w-6 h-6" />,
    },
    {
      title: 'Global Connectivity',
      description: 'Seamless integration across international command centers and units.',
      icon: <Globe className="w-6 h-6" />,
    },
    {
      title: 'Strategic Defense',
      description: 'Advanced threat detection and automated response protocols.',
      icon: <Shield className="w-6 h-6" />,
    },
  ];

  const heroImage = "https://images.unsplash.com/photo-1630165213345-e5e25d423790?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDczNjF8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBOYXRpb25hbCUyMEZsYWclMjBmbHV0dGVyaW5nJTIwYXQlMjBoaWdoJTIwYWx0aXR1ZGV8ZW58MHx8fHwxNzY3ODAxMDAyfDA&ixlib=rb-4.1.0&q=80&w=1080";

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <Hero 
        title="Commanding the Future of Defense Technology"
        subtitle="Empowering the Indian Armed Forces with next-generation enterprise solutions for tactical superiority and operational excellence."
        ctaText="Explore Solutions"
        ctaLink="/products"
        imageUrl={heroImage}
      />

      {/* Feature Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Core Framework Capabilities</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our enterprise portal provides a unified interface for mission-critical operations, ensuring every unit stays connected and informed.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(features ?? []).map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-6">
                  {feature?.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature?.title ?? 'Feature'}</h3>
                <p className="text-slate-600 leading-relaxed">{feature?.description ?? 'Description'}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Protecting the Sovereignty of Data</h2>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                In the modern battlefield, information is the most valuable asset. The Enterprise Portal Framework is designed to safeguard this asset with uncompromising security and high-availability architecture.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  'End-to-end encrypted data pipelines',
                  'Multi-factor biometric authentication',
                  'Distributed ledger for audit trails',
                  'Low-latency edge computing support'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-slate-200">{item}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                View Security Protocols
              </Button>
            </div>
            <div className="flex-1 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1647154929385-6670c0191743?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDczNjF8MHwxfHNlYXJjaHwxfHxNaWxpdGFyeSUyMG9mZmljZXIlMjB1c2luZyUyMHNlY3VyZSUyMGxhcHRvcHxlbnwwfHx8fDE3Njc4MDA5OTl8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Military officer using secure laptop"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-indigo-900/20 mix-blend-multiply" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Modernize Your Operations?</h2>
          <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto">
            Join the elite units already leveraging our framework for superior tactical coordination.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-indigo-600 hover:bg-slate-100">
              Request a Demo
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;