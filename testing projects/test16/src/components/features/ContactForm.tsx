import React, { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

interface ContactFormProps {
  onSubmit?: (data: any) => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSuccess(true);
    onSubmit?.(formData);
  };

  if (isSuccess) {
    return (
      <Card className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">Transmission Received</h3>
        <p className="text-slate-600 max-w-sm">
          Your secure message has been routed to the appropriate department. 
          Expect a response within 24 operational hours.
        </p>
        <Button 
          variant="outline" 
          className="mt-8"
          onClick={() => setIsSuccess(false)}
        >
          Send Another Message
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-8 shadow-xl border-t-4 border-[#3A29FF]">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Full Name" 
            placeholder="e.g. Capt. Vikram Batra"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <Input 
            label="Official Email" 
            type="email"
            placeholder="name@defense.gov.in"
            required
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>
        
        <Input 
          label="Department / Unit" 
          placeholder="e.g. Intelligence Corps, Northern Command"
          value={formData.department}
          onChange={(e) => setFormData({...formData, department: e.target.value})}
        />
        
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-slate-700 ml-1">Message Detail</label>
          <textarea 
            className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-200 bg-slate-50 focus:border-[#3A29FF] outline-none transition-all min-h-[150px] resize-none"
            placeholder="Describe the operational requirement..."
            required
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
          />
        </div>

        <Button 
          type="submit" 
          size="lg" 
          className="w-full"
          loading={isSubmitting}
        >
          <Send className="w-4 h-4 mr-2" />
          Send Secure Transmission
        </Button>
        
        <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest font-bold">
          Encrypted with 256-bit AES protocol
        </p>
      </form>
    </Card>
  );
};