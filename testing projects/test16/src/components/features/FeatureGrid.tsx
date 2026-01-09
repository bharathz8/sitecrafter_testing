import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Globe, Lock, Cpu, BarChart3 } from 'lucide-react';
import { Container } from '../ui/Container';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

interface Feature {
  icon: any;
  title: string;
  description: string;
}

export const FeatureGrid: React.FC = () => {
  const features: Feature[] = [
    {
      icon: Shield,
      title: "Tactical Security",
      description: "Multi-layered defense protocols ensuring zero-leak environment for sensitive operational data."
    },
    {
      icon: Zap,
      title: "Rapid Deployment",
      description: "Edge computing capabilities allowing for instantaneous sync across frontline mobile units."
    },
    {
      icon: Globe,
      title: "Global Intelligence",
      description: "Satellite-integrated data feeds providing real-time terrain and atmospheric intelligence."
    },
    {
      icon: Lock,
      title: "Encrypted Comms",
      description: "Quantum-resistant encryption for all inter-departmental and field transmissions."
    },
    {
      icon: Cpu,
      title: "AI Analysis",
      description: "Automated threat detection and predictive logistics powered by neural processing units."
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Dynamic dashboards visualizing personnel readiness and asset distribution globally."
    }
  ];

  return (
    <Container>
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-sm font-black text-[#3A29FF] uppercase tracking-[0.3em] mb-4">Core Capabilities</h2>
        <h3 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">Built for Mission Critical Performance</h3>
        <p className="text-lg text-slate-600">
          The framework provides a modular set of tools designed to withstand extreme operational environments.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {(features ?? []).map((feature, idx) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#3A29FF]/20 transition-all duration-300 group"
          >
            <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center text-[#3A29FF] mb-6 group-hover:bg-[#3A29FF] group-hover:text-white transition-colors duration-300">
              <feature.icon className="w-7 h-7" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
            <p className="text-slate-600 leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </Container>
  );
};