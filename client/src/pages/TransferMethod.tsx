import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { ArrowLeft, ChevronRight, Landmark, MoreHorizontal, ShieldCheck } from 'lucide-react';
import { SiBitcoin, SiCashapp, SiPaypal, SiRevolut, SiVenmo, SiWise, SiZelle } from 'react-icons/si';
import { useState } from 'react';

type MethodDef = {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
};

const mainMethods: MethodDef[] = [
  {
    key: 'wire',
    label: 'Wire Transfer',
    description: 'Transfer funds directly to local or international bank accounts.',
    icon: <Landmark className="h-6 w-6 text-blue-600" />,
    iconBg: 'bg-blue-50',
  },
  {
    key: 'crypto',
    label: 'Cryptocurrency',
    description: 'Send funds to your cryptocurrency wallet.',
    icon: <SiBitcoin className="h-6 w-6 text-orange-500" />,
    iconBg: 'bg-orange-50',
  },
  {
    key: 'paypal',
    label: 'PayPal',
    description: 'Transfer funds to your PayPal account.',
    icon: <SiPaypal className="h-6 w-6 text-[#003087]" />,
    iconBg: 'bg-indigo-50',
  },
  {
    key: 'wise',
    label: 'Wise Transfer',
    description: 'Transfer with lower fees using Wise.',
    icon: <SiWise className="h-6 w-6 text-[#163300]" />,
    iconBg: 'bg-lime-50',
  },
  {
    key: 'cashapp',
    label: 'Cash App',
    description: 'Quick transfers to your Cash App account.',
    icon: <SiCashapp className="h-6 w-6 text-[#00C244]" />,
    iconBg: 'bg-emerald-50',
  },
];

const moreMethods: MethodDef[] = [
  {
    key: 'zelle',
    label: 'Zelle',
    description: 'Send to a Zelle-enrolled email or U.S. mobile number.',
    icon: <SiZelle className="h-6 w-6 text-[#6D1ED4]" />,
    iconBg: 'bg-purple-50',
  },
  {
    key: 'venmo',
    label: 'Venmo',
    description: 'Transfer funds to your Venmo account.',
    icon: <SiVenmo className="h-6 w-6 text-[#008CFF]" />,
    iconBg: 'bg-sky-50',
  },
  {
    key: 'revolut',
    label: 'Revolut',
    description: 'Send funds to a Revolut account.',
    icon: <SiRevolut className="h-6 w-6 text-slate-900" />,
    iconBg: 'bg-slate-100',
  },
];

function MethodCard({ m, onClick }: { m: MethodDef; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-md transition-all duration-150 active:scale-[0.99] group"
    >
      <div className="flex items-center gap-4">
        <div className={`h-12 w-12 rounded-full ${m.iconBg} flex items-center justify-center shrink-0`}>
          {m.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 text-base">{m.label}</p>
          <p className="text-sm text-slate-500 mt-0.5">{m.description}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
      </div>
    </button>
  );
}

export default function TransferMethod() {
  const [, setLocation] = useLocation();
  const [showMore, setShowMore] = useState(false);

  const go = (key: string) => setLocation(`/transfer?method=${key}`);

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-2xl mx-auto py-6">
        <Button variant="ghost" onClick={() => setLocation('/dashboard')} className="mb-4 -ml-2 text-slate-600">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Dashboard
        </Button>

        <h1 className="text-2xl font-bold text-slate-900 mb-1">Select Transfer Method</h1>
        <p className="text-sm text-slate-500 mb-6">Choose how you'd like to withdraw or send your funds.</p>

        <div className="space-y-3">
          {mainMethods.map((m) => (
            <MethodCard key={m.key} m={m} onClick={() => go(m.key)} />
          ))}

          {!showMore ? (
            <button
              type="button"
              onClick={() => setShowMore(true)}
              className="w-full text-left bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-md transition-all duration-150 active:scale-[0.99] group"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                  <MoreHorizontal className="h-6 w-6 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-base">More Options</p>
                  <p className="text-sm text-slate-500 mt-0.5">Zelle, Venmo, Revolut, and more.</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
              </div>
            </button>
          ) : (
            moreMethods.map((m) => <MethodCard key={m.key} m={m} onClick={() => go(m.key)} />)
          )}
        </div>

        <Card className="mt-6 p-5 border-0 shadow-sm rounded-2xl bg-white">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900 text-sm">Secure Transaction</p>
              <p className="text-sm text-slate-500 mt-0.5">
                All transfers are encrypted and processed securely. Never share your PIN with anyone.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
