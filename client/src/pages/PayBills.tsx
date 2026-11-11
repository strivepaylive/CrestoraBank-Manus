import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { ArrowLeft, Receipt, Zap, Wifi, Phone, Home, Droplets, Tv } from 'lucide-react';

const billers = [
  { label: 'Electricity', icon: Zap, color: 'text-amber-500 bg-amber-50' },
  { label: 'Internet', icon: Wifi, color: 'text-blue-500 bg-blue-50' },
  { label: 'Phone', icon: Phone, color: 'text-emerald-500 bg-emerald-50' },
  { label: 'Rent / Mortgage', icon: Home, color: 'text-purple-500 bg-purple-50' },
  { label: 'Water', icon: Droplets, color: 'text-cyan-500 bg-cyan-50' },
  { label: 'Cable TV', icon: Tv, color: 'text-rose-500 bg-rose-50' },
];

export default function PayBills() {
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-2xl mx-auto py-6">
        <Button variant="ghost" onClick={() => setLocation('/dashboard')} className="mb-4 -ml-2 text-slate-600">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Dashboard
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Receipt className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Pay Bills</h1>
            <p className="text-sm text-slate-500">Pay utilities and services from your account</p>
          </div>
        </div>

        <Card className="p-6 border-0 shadow-sm rounded-2xl bg-white">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Choose a biller</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {billers.map((b) => (
              <button
                key={b.label}
                onClick={() => {
                  setSelected(b.label);
                  toast.info('Coming soon. We are working on bringing this service to your region. Stay tuned for any updates from us via email. Thank you for choosing Crestora Bank.');
                }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-150 active:scale-95 ${
                  selected === b.label ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${b.color}`}>
                  <b.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-slate-700">{b.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 text-center mt-6">
            Coming soon. We are working on bringing this service to your region. Stay tuned for any updates from us via email. Thank you for choosing Crestora Bank.
          </p>
          <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => setLocation('/transfer')}>
            Pay via Money Transfer
          </Button>
        </Card>
      </div>
    </div>
  );
}
