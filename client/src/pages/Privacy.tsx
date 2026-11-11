import { Button } from '@/components/ui/button';

export default function Privacy() {
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
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-slate-300">Last Updated: July 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white p-8 md:p-12 rounded-xl shadow-sm border border-slate-100 prose prose-slate max-w-none">
          <h2>1. Introduction</h2>
          <p>At Crestora Bank, we are committed to protecting your privacy and ensuring the security of your personal and financial information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our digital banking services.</p>
          
          <h2>2. Information We Collect</h2>
          <p>We collect information that you provide directly to us when you open an account, apply for a loan, or use our services. This may include:</p>
          <ul>
            <li>Personal identification information (Name, Date of Birth, Social Security Number)</li>
            <li>Contact information (Email address, Phone number, Physical address)</li>
            <li>Financial information (Income, Assets, Transaction history)</li>
            <li>Digital footprint (IP address, Device information, Browser type)</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process your transactions and manage your accounts</li>
            <li>Verify your identity and prevent fraud</li>
            <li>Improve our digital banking platform and customer service</li>
            <li>Comply with legal and regulatory requirements</li>
          </ul>

          <h2>4. Information Sharing</h2>
          <p>We do not sell your personal information to third parties. We may share your information with trusted service providers who assist us in operating our bank, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.</p>

          <h2>5. Data Security</h2>
          <p>We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems.</p>

          <h2>6. Contact Us</h2>
          <p>If you have any questions regarding this Privacy Policy, you may contact us at our headquarters:</p>
          <p><strong>Crestora Bank</strong><br/>120 Wall Street<br/>New York, NY 10005, USA<br/>info@crestorabank.com</p>
        </div>
      </div>
    </div>
  );
}
