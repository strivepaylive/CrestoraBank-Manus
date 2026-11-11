import { Button } from '@/components/ui/button';

export default function About() {
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
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80"
            alt="About Us Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/50" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">We revolutionized Digital Banking</h1>
          <p className="text-xl text-slate-300">We've grown to become one of the largest digital banking providers, committed to inventing, simplifying, and humanizing the banking experience.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Mission</h2>
            <p className="text-lg text-slate-600 mb-6">At Crestora Bank, we believe that managing your finances should be simple, transparent, and accessible to everyone. Our mission is to empower individuals and businesses with innovative financial tools that help them achieve their goals.</p>
            <p className="text-lg text-slate-600">Founded on the principles of trust and technological excellence, we combine the security of traditional banking with the agility of a modern tech company.</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">18.5M+</div>
              <div className="text-slate-600 font-medium">Active Users</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">150+</div>
              <div className="text-slate-600 font-medium">Countries Served</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">$50B+</div>
              <div className="text-slate-600 font-medium">Assets Managed</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-slate-600 font-medium">Global Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
