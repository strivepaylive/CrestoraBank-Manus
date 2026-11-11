import { Button } from '@/components/ui/button';

export default function Blog() {
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Financial Insights</h1>
          <p className="text-xl text-slate-300">Expert advice, market trends, and tips to help you manage your money better.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition cursor-pointer">
            <div className="h-48 bg-slate-200">
              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80" alt="Business" className="w-full h-full object-cover" />
            </div>
            <div className="p-6">
              <div className="text-sm text-blue-600 font-medium mb-2">Corporate • May 22, 2026</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">5 Things You Need To Know Before Starting Business</h3>
              <p className="text-slate-600 line-clamp-2">Starting a business requires careful planning and financial foresight. Here are the essential steps to ensure your new venture starts on solid ground.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition cursor-pointer">
            <div className="h-48 bg-slate-200">
              <img src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80" alt="Consumer" className="w-full h-full object-cover" />
            </div>
            <div className="p-6">
              <div className="text-sm text-blue-600 font-medium mb-2">Consumer • May 13, 2026</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Effect Of Inflation On Our Daily Expenditure</h3>
              <p className="text-slate-600 line-clamp-2">Understanding how inflation impacts your purchasing power is crucial for long-term financial health. Learn strategies to protect your savings.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition cursor-pointer">
            <div className="h-48 bg-slate-200">
              <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80" alt="Finance" className="w-full h-full object-cover" />
            </div>
            <div className="p-6">
              <div className="text-sm text-blue-600 font-medium mb-2">Finance • Apr 15, 2026</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">7 Tips To Get Best Exchange Rate In Currency</h3>
              <p className="text-slate-600 line-clamp-2">Whether you're traveling or sending money abroad, securing a favorable exchange rate can save you significant amounts of money.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

