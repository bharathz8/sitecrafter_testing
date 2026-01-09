import React from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

interface Post {
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  imageUrl?: string;
  index?: number;
}

interface BlogCardProps {
  post: Post;
  compact?: boolean;
}

export const BlogCard: React.FC<BlogCardProps> = ({ 
  post = {
    title: 'Strategic Preparedness in High-Altitude Warfare',
    excerpt: 'Detailed analysis of logistical challenges and tactical advantages in the Himalayan theater of operations.',
    category: 'Doctrine',
    author: 'Maj. Gen. V. Singh',
    date: 'Oct 24, 2023',
    index: 0
  },
  compact = false 
}) => {
  const gradients = [
    'from-slate-700 to-slate-900',
    'from-indigo-600 to-blue-700',
    'from-emerald-600 to-teal-700',
  ];

  return (
    <Card className="flex flex-col h-full group">
      <div className="relative h-48 overflow-hidden">
        {post?.imageUrl ? (
          <img 
            src={post.imageUrl} 
            alt={post.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className={cn('w-full h-full bg-gradient-to-br', gradients[(post?.index ?? 0) % gradients.length])} />
        )}
        <div className="absolute top-4 left-4">
          <Badge variant="primary" className="shadow-lg bg-white/90 backdrop-blur-sm">
            {post?.category ?? 'Military'}
          </Badge>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-[#FF94B4]" />
            {post?.date ?? 'N/A'}
          </span>
          <span className="flex items-center gap-1.5">
            <User className="w-3 h-3 text-[#3A29FF]" />
            {post?.author ?? 'HQ'}
          </span>
        </div>
        
        <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-[#3A29FF] transition-colors leading-tight">
          {post?.title ?? 'Untitled Post'}
        </h3>
        
        {!compact && (
          <p className="text-slate-600 text-sm mb-6 line-clamp-3 leading-relaxed">
            {post?.excerpt ?? 'No description available for this strategic update.'}
          </p>
        )}
        
        <div className="mt-auto pt-4 border-t border-slate-50">
          <button className="flex items-center gap-2 text-sm font-black text-[#3A29FF] group-hover:gap-3 transition-all">
            Read Intelligence Report
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
};