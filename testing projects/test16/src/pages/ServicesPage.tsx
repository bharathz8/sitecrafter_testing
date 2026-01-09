import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Check, Activity, Shield, Users, Cloud, Terminal } from 'lucide-react';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

const services = [
  {
    title: 'Strategic Consulting',
    description: 'Expert guidance on digital transformation for defense organizations.',
    icon: <Users className="w-8 h-8" />,
    features: ['Legacy system audit', 'Roadmap development', 'Risk assessment']
  },
  {
    title: 'Custom Framework Development',
    description: 'Bespoke portal solutions tailored to specific regimental needs.',
    icon: <Terminal className="w-8 h-8" />,
    features: ['Scalable architecture', 'Microservices design', 'API integration']
  },
  {
    title: 'Cloud Managed Services',
    description: 'Secure, high-availability hosting on sovereign cloud infrastructure.',
    icon: <Cloud className="w-8 h-8" />,
    features: ['24/7 Monitoring', 'Auto-scaling', 'Disaster recovery']
  },
  {
    title: 'Cybersecurity Operations',
    description: 'Comprehensive threat management and penetration testing.',
    icon: <Shield className="w-8 h-8" />,
    features: ['Zero-trust security', 'SOC as a Service', 'Incident response']
  }
];

const ServicesPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Mission-Critical Services
          </motion.h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-10">
            Delivering end-to-end technical support and strategic implementation for the nation's most vital defense networks.
          </p>
          <Button size="lg" className="bg-indigo-500 hover:bg-indigo-600">
            Schedule a Consultation
          </Button>
        </div>
      </section>

      {/* Service Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(services ?? []).map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 h-full border-slate-100 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {service?.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-4">{service?.title}</h3>
                      <p className="text-slate-600 mb-6 leading-relaxed">
                        {service?.description}
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(service?.features ?? []).map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-slate-700">
                            <Check className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-medium">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Uptime', value: '99.99%' },
              { label: 'Response Time', value: '< 50ms' },
              { label: 'Units Served', value: '450+' },
              { label: 'Security Audits', value: 'Weekly' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2">{stat.value}</div>
                <div className="text-slate-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-indigo-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Partner with Excellence</h2>
            <p className="text-lg text-indigo-100 mb-10 max-w-2xl mx-auto">
              Our team of engineers and defense experts are ready to build the future of your regimental operations.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-indigo-600 hover:bg-indigo-50">
              Get Started Today
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;