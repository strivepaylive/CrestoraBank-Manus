import { Button } from '@/components/ui/button';

export default function Careers() {
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Join Our Team</h1>
          <p className="text-xl text-slate-300">Help us build the future of digital banking. We're always looking for talented individuals who are passionate about technology and finance.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">No Open Positions</h2>
          <p className="text-slate-600 mb-8">We currently don't have any open positions, but we're always growing. Check back soon or send your resume to our HR department.</p>
          <Button variant="outline" className="h-12 px-8">Email Resume</Button>
        </div>
      </div>
    </div>
  );
}
