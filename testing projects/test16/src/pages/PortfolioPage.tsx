import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ExternalLink, Eye, Filter } from 'lucide-react';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

const projects = [
  {
    id: 1,
    title: 'Project Vajra',
    category: 'Tactical Hardware',
    client: 'Armoured Corps',
    image: 'https://images.unsplash.com/photo-1745248826143-66234c5b3f02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDczNjF8MHwxfHNlYXJjaHwxfHxBcm1vdXJlZCUyMENvcnBzJTIwbWFpbiUyMGJhdHRsZSUyMHRhbmt8ZW58MHx8fHwxNzY3ODAwOTk3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Battle Management', 'AI', 'Encryption']
  },
  {
    id: 2,
    title: 'Project Himshakti',
    category: 'Electronic Warfare',
    client: 'Signal Corps',
    image: 'https://images.unsplash.com/photo-1637140360401-e52e9937d753?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDczNjF8MHwxfHNlYXJjaHwxfHxNb3VudGFpbiUyMHdhcmZhcmUlMjBzb2xkaWVycyUyMGluJTIwdGhlJTIwSGltYWxheWFzfGVufDB8fHx8MTc2NzgwMTAwNXww&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Signal Intel', 'Jamming', 'Mobile']
  },
  {
    id: 3,
    title: 'Project Akashvani',
    category: 'Communication',
    client: 'Air Force',
    image: 'https://images.unsplash.com/photo-1563195189-65627586d3de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDczNjF8MHwxfHNlYXJjaHwxfHxBcnRpbGxlcnklMjByZWdpbWVudCUyMGZpZWxkJTIwZ3VuJTIwZmlyaW5nfGVufDB8fHx8MTc2NzgwMTAwMXww&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Satcom', 'UHF/VHF', 'Encrypted']
  },
  {
    id: 4,
    title: 'Project Setu',
    category: 'Engineering',
    client: 'Corps of Engineers',
    image: 'https://images.unsplash.com/photo-1652249114984-a53465f6d4a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDczNjF8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBBcm15JTIwZW5naW5lZXJpbmclMjBjb3JwcyUyMGJyaWRnZSUyMGJ1aWxkaW5nfGVufDB8fHx8MTc2NzgwMTAwN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Logistics', 'Rapid Deploy', 'Planning']
  },
  {
    id: 5,
    title: 'Project Netra',
    category: 'Surveillance',
    client: 'Intelligence Bureau',
    image: 'https://images.unsplash.com/photo-1681135092730-b943082aeba5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDczNjF8MHwxfHNlYXJjaHwxfHxNaWxpdGFyeSUyMGNvbW1hbmQlMjBhbmQlMjBjb250cm9sJTIwY2VudGVyfGVufDB8fHx8MTc2NzgwMTAwOXww&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Big Data', 'Visual Intel', 'Real-time']
  },
  {
    id: 6,
    title: 'Project Dhruv',
    category: 'Aviation',
    client: 'Army Aviation',
    image: 'https://images.unsplash.com/photo-1585802540432-60662b65ca62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDczNjF8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBBcm15JTIwcGFyYXRyb29wZXJzJTIwaW4lMjB0cmFpbmluZ3xlbnwwfHx8fDE3Njc4MDEwMDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Avionics', 'Training', 'Sim']
  }
];

const PortfolioPage = () => {
  const [filter, setFilter] = useState('All');
  const categories = ['All', 'Tactical Hardware', 'Communication', 'Surveillance', 'Engineering'];

  const filteredProjects = (projects ?? []).filter(p => filter === 'All' || p.category === filter);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">Strategic Deployments</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            A showcase of mission-critical projects successfully implemented across various commands and corps.
          </p>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {(categories ?? []).map(cat => (
            <Button
              key={cat}
              variant={filter === cat ? 'default' : 'outline'}
              className={cn("rounded-full", filter === cat ? "bg-indigo-600" : "bg-white")}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Project Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {(filteredProjects ?? []).map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="group overflow-hidden border-none shadow-lg h-full flex flex-col">
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={project.image} 
                      alt={project.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-indigo-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <Button size="icon" variant="secondary" className="rounded-full bg-white text-indigo-600">
                        <Eye className="w-5 h-5" />
                      </Button>
                      <Button size="icon" variant="secondary" className="rounded-full bg-white text-indigo-600">
                        <ExternalLink className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-6">
                    <Badge className="mb-3 bg-indigo-50 text-indigo-600 border-none">
                      {project.category}
                    </Badge>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{project.title}</h3>
                    <p className="text-slate-500 text-sm mb-4">Client: {project.client}</p>
                    <div className="flex flex-wrap gap-2">
                      {(project.tags ?? []).map((tag, i) => (
                        <span key={i} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-slate-200 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default PortfolioPage;