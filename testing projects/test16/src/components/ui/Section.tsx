import React from 'react';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  background?: 'white' | 'slate' | 'dark' | 'none';
}

export const Section: React.FC<SectionProps> = ({
  children,
  className = '',
  id,
  background = 'none'
}) => {
  const backgrounds = {
    white: 'bg-white',
    slate: 'bg-slate-50',
    dark: 'bg-slate-900 text-white',
    none: ''
  };

  return (
    <section 
      id={id}
      className={cn(
        'py-12 md:py-20 lg:py-24 overflow-hidden',
        backgrounds[background],
        className
      )}
    >
      {children}
    </section>
  );
};