import { Button } from '@/components/ui/button';

export default function Terms() {
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

      <div className="relative bg-slate-900 py-16">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-slate-300">Last Updated: July 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white p-8 md:p-12 rounded-xl shadow-sm border border-slate-100 prose prose-slate max-w-none">
          <h2>1. Agreement to Terms</h2>
          <p>By accessing or using the digital banking services provided by Crestora Bank, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
          
          <h2>2. Account Responsibilities</h2>
          <p>You are responsible for maintaining the confidentiality of your account login information and password. You agree to accept responsibility for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</p>

          <h2>3. Electronic Communications</h2>
          <p>When you use our digital banking services or send emails to us, you are communicating with us electronically. You consent to receive communications from us electronically. We will communicate with you by email or by posting notices on this site.</p>

          <h2>4. Funds Availability</h2>
          <p>Our general policy is to allow you to withdraw funds deposited in your account on the first business day after the day we receive your deposit. In some cases, we may delay your ability to withdraw funds beyond the first business day.</p>

          <h2>5. Limitation of Liability</h2>
          <p>Crestora Bank shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our services, including but not limited to reliance by a user on any information obtained from the service.</p>

          <h2>6. Governing Law</h2>
          <p>These terms and conditions are governed by and construed in accordance with the laws of the State of New York, and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>
        </div>
      </div>
    </div>
  );
}
