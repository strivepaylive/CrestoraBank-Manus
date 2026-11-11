import { Button } from '@/components/ui/button';
import { Home, Car, GraduationCap } from 'lucide-react';

export default function Loans() {
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Flexible Loan Options</h1>
          <p className="text-xl text-slate-300 mb-8">Competitive rates and fast approval processes to help you achieve your dreams sooner.</p>
          <a href="/register"><Button className="bg-blue-600 hover:bg-blue-700 h-12 px-8 text-lg">Apply Now</Button></a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Mortgages</h3>
            <p className="text-slate-600">Fixed and adjustable-rate mortgages with low down payment options for first-time buyers.</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Auto Loans</h3>
            <p className="text-slate-600">Get pre-approved in minutes with competitive rates for both new and used vehicles.</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Personal Loans</h3>
            <p className="text-slate-600">Unsecured personal loans for debt consolidation, home improvements, or unexpected expenses.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
