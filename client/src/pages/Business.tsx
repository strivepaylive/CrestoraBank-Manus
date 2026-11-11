import { Button } from '@/components/ui/button';
import { Briefcase, TrendingUp, ShieldCheck } from 'lucide-react';

export default function Business() {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Crestora Bank
          </a>
          <div className="flex items-center gap-4">
            <a href="/login"><Button variant="outline">Sign In</Button></a>
            <a href="/register"><Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button></a>
          </div>
        </div>
      </nav>

      <div className="relative bg-slate-900 py-24">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Business Banking</h1>
          <p className="text-xl text-slate-300 mb-8">Powerful financial tools designed to help your business scale and succeed in the digital economy.</p>
          <a href="/register"><Button className="bg-blue-600 hover:bg-blue-700 h-12 px-8 text-lg">Open Business Account</Button></a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Corporate Accounts</h3>
            <p className="text-slate-600">Manage payroll, vendor payments, and daily operations with zero monthly maintenance fees.</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Merchant Services</h3>
            <p className="text-slate-600">Accept payments globally with our integrated payment gateway and point-of-sale solutions.</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Fraud Protection</h3>
            <p className="text-slate-600">Advanced AI-driven security protocols to protect your business assets from unauthorized access.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
