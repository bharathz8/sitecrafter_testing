import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Search, Filter, ArrowRight, FileText, Package, Users, Globe } from 'lucide-react';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

const results = [
  { id: 1, type: 'Product', title: 'Aegis Comms Relay', desc: 'High-frequency communication hub for remote operations.', link: '/products' },
  { id: 2, type: 'Document', title: 'Protocol 742-B Security Standards', desc: 'Detailed whitepaper on the new encryption standards for 2024.', link: '#' },
  { id: 3, type: 'Personnel', title: 'Signals Intelligence Unit (Unit 4)', desc: 'Registry information for the northern command signals unit.', link: '#' },
  { id: 4, type: 'Service', title: 'Managed Cloud Deployment', desc: 'Sovereign cloud solutions for regimental data storage.', link: '/services' },
  { id: 5, type: 'Blog', title: 'Modernizing Battlefield Comms', desc: 'Insightful article on the future of tactical interactions.', link: '/blog' },
];

const SearchPage = () => {
  const [query, setQuery] = useState('');
  
  const filteredResults = (results ?? []).filter(r => 
    r.title.toLowerCase().includes(query.toLowerCase()) || 
    r.desc.toLowerCase().includes(query.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'Product': return <Package className="w-5 h-5" />;
      case 'Document': return <FileText className="w-5 h-5" />;
      case 'Personnel': return <Users className="w-5 h-5" />;
      default: return <Globe className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-12">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-600 w-6 h-6" />
            <Input 
              placeholder="Search the global defense directory..." 
              className="pl-16 h-20 text-xl rounded-3xl border-none shadow-2xl shadow-indigo-100 bg-white placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-100 transition-all"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-6 justify-center">
            <span className="text-sm text-slate-500 mr-2 py-1">Suggested:</span>
            {['Tactical', 'Encryption', 'Unit 402', 'Vajra', 'Manuals'].map(tag => (
              <button 
                key={tag} 
                onClick={() => setQuery(tag)}
                className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full hover:bg-indigo-600 hover:text-white transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-slate-900 font-bold">Search Results ({filteredResults.length})</h2>
            <Button variant="ghost" size="sm" className="text-slate-500">
              <Filter className="w-4 h-4 mr-2" /> Advanced Filters
            </Button>
          </div>

          {(filteredResults ?? []).map((result, index) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-6 border-none shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {getTypeIcon(result.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-slate-900">{result.title}</h3>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-400 border-slate-200">
                        {result.type}
                      </Badge>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      {result.desc}
                    </p>
                    <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      View Details <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}

          {filteredResults.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No matching records found</h3>
              <p className="text-slate-500">Try searching for broader terms or categories.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;