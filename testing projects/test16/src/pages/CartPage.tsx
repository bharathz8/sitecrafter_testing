import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

const CartPage = () => {
  const [items, setItems] = useState([
    {
      id: 1,
      name: 'Sentinel-X Command Suite',
      price: 12500,
      qty: 1,
      image: 'https://images.unsplash.com/photo-1745248826143-66234c5b3f02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDczNjF8MHwxfHNlYXJjaHwxfHxBcm1vdXJlZCUyMENvcnBzJTIwbWFpbiUyMGJhdHRsZSUyMHRhbmt8ZW58MHx8fHwxNzY3ODAwOTk3fDA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      id: 2,
      name: 'Vanguard Tactical Laptop v4',
      price: 4200,
      qty: 2,
      image: 'https://images.unsplash.com/photo-1647154929385-6670c0191743?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDczNjF8MHwxfHNlYXJjaHwxfHxNaWxpdGFyeSUyMG9mZmljZXIlMjB1c2luZyUyMHNlY3VyZSUyMGxhcHRvcHxlbnwwfHx8fDE3Njc4MDA5OTl8MA&ixlib=rb-4.1.0&q=80&w=1080'
    }
  ]);

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const updateQty = (id: number, delta: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ));
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-indigo-600" />
          Procurement Cart
        </h1>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              {(items ?? []).map((item) => (
                <Card key={item.id} className="p-6 border-none shadow-sm flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{item.name}</h3>
                    <p className="text-slate-500 text-sm mb-4">Unit Price: ${item.price.toLocaleString()}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-4">
                      <div className="flex items-center bg-slate-100 rounded-lg p-1">
                        <button 
                          onClick={() => updateQty(item.id, -1)}
                          className="p-1 hover:bg-white rounded-md transition-colors"
                        >
                          <Minus className="w-4 h-4 text-slate-600" />
                        </button>
                        <span className="w-10 text-center font-bold text-slate-900">{item.qty}</span>
                        <button 
                          onClick={() => updateQty(item.id, 1)}
                          className="p-1 hover:bg-white rounded-md transition-colors"
                        >
                          <Plus className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-rose-500 hover:text-rose-600 text-sm font-medium flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900">
                      ${(item.price * item.qty).toLocaleString()}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-8 border-none shadow-lg bg-slate-900 text-white sticky top-24">
                <h2 className="text-xl font-bold mb-6 pb-6 border-b border-white/10">Procurement Summary</h2>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span className="text-white font-medium">${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>GST (18%)</span>
                    <span className="text-white font-medium">${tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Delivery</span>
                    <span className="text-emerald-400 font-medium">Free (Military Route)</span>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                    <span className="text-lg font-bold">Total Cost</span>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-indigo-400">${total.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Inclusive of all taxes</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-14 text-lg font-bold">
                    Checkout <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Secure Government Procurement Protocol Active
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="py-24 text-center border-dashed border-2 border-slate-200 shadow-none bg-transparent">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
            <p className="text-slate-600 mb-8">Ready to modernize? Start adding solutions to your procurement list.</p>
            <Button className="bg-indigo-600" onClick={() => window.location.href = '/products'}>
              View Solutions Catalog
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CartPage;