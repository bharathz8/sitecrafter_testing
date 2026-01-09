import React from 'react';
import { motion } from 'framer-motion';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { History, Award, Target, Heart } from 'lucide-react';
import { Card } from '@/components/ui/Card'; // Assuming Card component is imported from '@/components/ui/Card'

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

const Shield = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const values = [
  {
    title: 'Integrity',
    description: 'Unwavering commitment to honesty and moral principles in every technical solution.',
    icon: <Shield className="w-6 h-6" />,
  },
  {
    title: 'Innovation',
    description: 'Constantly pushing the boundaries of what is possible in defense technology.',
    icon: <Target className="w-6 h-6" />,
  },
  {
    title: 'Excellence',
    description: 'Striving for perfection in code, security, and user experience.',
    icon: <Award className="w-6 h-6" />,
  },
  {
    title: 'Service',
    description: 'Dedicated to those who serve the nation, providing them the best tools for the job.',
    icon: <Heart className="w-6 h-6" />,
  }
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center overflow-hidden bg-slate-900">
        <img 
          src="https://images.unsplash.com/photo-1724602694320-8e15a3441d9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDczNjF8MHwxfHNlYXJjaHwxfHxLYXJnaWwlMjBXYXIlMjBNZW1vcmlhbCUyMERyYXN8ZW58MHx8fDE3Njc4MDA5OTh8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Kargil War Memorial"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent" />
        <Container className="relative z-10 text-center">
          <Badge className="mb-6 bg-indigo-500 text-white border-none">Our Story</Badge>
          <h1 className="text-4xl md:text-7xl font-bold text-white mb-6">Honoring the Past,<br />Engineering the Future</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            The Enterprise Portal Framework was born from a vision to modernize the digital landscape of the Indian Armed Forces.
          </p>
        </Container>
      </section>

      {/* Story Section */}
      <Section className="py-24">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-8">A Legacy of Innovation</h2>
            <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
              <p>
                Founded by a group of former defense engineers and tech visionaries, our mission has always been clear: to provide the most secure, efficient, and user-friendly portal framework for military operations.
              </p>
              <p>
                We understand that in the field, technology must be invisible yet invincible. Our framework is built on the pillars of resilience, adaptability, and high-performance engineering.
              </p>
              <div className="flex gap-8 pt-6">
                <div>
                  <div className="text-4xl font-bold text-indigo-600">15+</div>
                  <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Years Experience</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-indigo-600">100k+</div>
                  <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Active Users</div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 grid grid-cols-2 gap-4">
            <img 
              src="https://images.unsplash.com/photo-1615482319206-d2545553676e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDczNjF8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBBcm15JTIwc29sZGllciUyMGluJTIwY29tYmF0JTIwZ2VhcnxlbnwwfHx8fDE3Njc4MDA5OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080" 
              className="rounded-2xl shadow-lg w-full h-64 object-cover" 
              alt="Soldier in gear"
            />
            <img 
              src="https://images.unsplash.com/photo-1585802540432-60662b65ca62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDczNjF8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBBcm15JTIwaW5mYW50cnklMjBiYXR0YWxpb24lMjBvbiUyMHBhdHJvbHxlbnwwfHx8fDE3Njc4MDEwMDB8MA&ixlib=rb-4.1.0&q=80&w=1080" 
              className="rounded-2xl shadow-lg mt-8 w-full h-64 object-cover" 
              alt="Infantry patrol"
            />
          </div>
        </div>
      </Section>

      {/* Values */}
      <section className="py-24 bg-slate-50">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Our Core Values</h2>
            <p className="text-slate-600 max-w-xl mx-auto">The principles that guide every line of code we write and every system we deploy.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(values ?? []).map((value, i) => (
              <Card key={i} className="p-8 text-center bg-white border-none shadow-sm hover:-translate-y-1 transition-transform">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  {value?.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{value?.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{value?.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* History Timeline */}
      <Section className="py-24">
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 text-center mb-16">Our Journey</h2>
        <div className="max-w-4xl mx-auto space-y-12 relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-slate-200" />
          {[
            { year: '2010', event: 'Framework inception and first prototype' },
            { year: '2014', event: 'Deployment to Northern Command for field testing' },
            { year: '2018', event: 'Global award for excellence in defense tech' },
            { year: '2023', event: 'Launch of V2.0 with AI-driven threat analysis' },
          ].map((item, i) => (
            <div key={i} className={cn("relative flex flex-col md:flex-row items-center", i % 2 === 0 ? "md:flex-row-reverse" : "")}>
              <div className="hidden md:block w-1/2" />
              <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white z-10" />
              <div className="ml-12 md:ml-0 md:w-1/2 px-8">
                <div className="text-indigo-600 font-bold text-xl mb-1">{item.year}</div>
                <div className="text-slate-900 font-semibold text-lg">{item.event}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
};

export default AboutPage;