import { useAuth } from "@/_core/hooks/useAuth";
import BrandLogo from '@/components/BrandLogo';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Streamdown } from 'streamdown';
import { useTranslator } from "@/components/LanguageTranslator";

/**
 * All content in this page are only for example, replace with your own feature implementation
 * When building pages, remember your instructions in Frontend Workflow, Frontend Best Practices, Design Guide and Common Pitfalls
 */
export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();
  const { language, translate, changeLanguage } = useTranslator();

  // If theme is switchable in App.tsx, we can implement theme toggling like this:
  // const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandLogo size="md" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="/" className="text-slate-600 hover:text-slate-900 font-medium transition">Home</a>
            <a href="/business" className="text-slate-600 hover:text-slate-900 font-medium transition">Business</a>
            <a href="/personal" className="text-slate-600 hover:text-slate-900 font-medium transition">Personal</a>
            <a href="/credit-cards" className="text-slate-600 hover:text-slate-900 font-medium transition">Credit Cards</a>
            <a href="/loans" className="text-slate-600 hover:text-slate-900 font-medium transition">Loans</a>
            <a href="/support" className="text-slate-600 hover:text-slate-900 font-medium transition">Support</a>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button onClick={logout} variant="outline">Logout</Button>
            ) : (
              <>
                <a href="/login">
                  <Button variant="outline">Sign In</Button>
                </a>
                <a href="/register">
                  <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
                </a>
              </>
            )}
            <Select value={language} onValueChange={changeLanguage}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="pt">Português</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
                Banking Reimagined for <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Modern Life</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                Experience seamless, secure, and intelligent banking with Crestora Bank. Manage your finances with confidence, anywhere, anytime.
              </p>
            </div>
            <div className="flex gap-4">
              <a href="/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                  Open Account
                </Button>
              </a>
              <a href="/login">
                <Button size="lg" variant="outline" className="px-8">
                  Sign In
                </Button>
              </a>
            </div>
            
            {/* Support Team Avatar Stack */}
            <div className="flex items-center gap-4 pt-6">
              <div className="flex -space-x-3">
                <img 
                  className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover" 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" 
                  alt="Support Agent 1" 
                />
                <img 
                  className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover" 
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80" 
                  alt="Support Agent 2" 
                />
                <img 
                  className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover" 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" 
                  alt="Support Agent 3" 
                />
              </div>
              <div className="text-sm text-slate-600 max-w-[200px]">
                Need Help? Contact our <a href="/support" className="text-blue-600 hover:underline font-medium">digital support</a> & tell us about your query.
              </div>
            </div>
          </div>
          <div className="relative h-96 md:h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-2xl flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">💳</div>
              <p className="text-lg font-semibold">Secure Banking Platform</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Choose Crestora Bank?</h2>
            <p className="text-xl text-slate-600">Cutting-edge features designed for your financial success</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🔒', title: 'Bank-Level Security', desc: 'Military-grade encryption protects your data 24/7' },
              { icon: '⚡', title: 'Instant Transfers', desc: 'Send money globally in seconds, not days' },
              { icon: '📊', title: 'Smart Analytics', desc: 'Real-time insights into your spending patterns' },
              { icon: '💰', title: 'Competitive Rates', desc: 'Best-in-class interest rates on savings' },
              { icon: '📱', title: 'Mobile First', desc: 'Manage your finances on any device' },
              { icon: '🌍', title: 'Global Reach', desc: 'Access your account from anywhere in the world' },
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Trusted by Millions</h2>
            <p className="text-xl text-slate-600">See what our customers have to say</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Johnson', role: 'Entrepreneur', text: 'Crestora Bank has transformed how I manage my business finances. Highly recommended!' },
              { name: 'Michael Chen', role: 'Investor', text: 'The platform is intuitive and secure. I trust my investments with Crestora Bank.' },
              { name: 'Emma Rodriguez', role: 'Professional', text: 'Best banking experience I\'ve had. Customer service is exceptional and responsive.' },
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400">⭐</span>)}
                </div>
                <p className="text-slate-700 mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-bold text-slate-900">{testimonial.name}</p>
                  <p className="text-sm text-slate-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Banking?</h2>
          <p className="text-xl text-blue-100 mb-8">Join millions of satisfied customers and experience banking like never before.</p>
          <a href="/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8">
              Open Your Account Today
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <img src="/manus-storage/crestora-logo-white_576da4ab.png" alt="Crestora Bank Logo" className="h-8" />
              </div>
              <p className="text-sm">Revolutionizing digital banking for everyone.</p>
            </div>
            <div>
              <p className="text-white font-semibold mb-4">Company</p>
              <ul className="space-y-2 text-sm">
                <li><a href="/about" className="hover:text-white transition">About Us</a></li>
                <li><a href="/careers" className="hover:text-white transition">Careers</a></li>
                <li><a href="/blog" className="hover:text-white transition">Blog</a></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold mb-4">Contact & Support</p>
              <div className="space-y-4 text-sm">
                <ul className="space-y-2">
                  <li><a href="/help" className="hover:text-white transition">Help Center</a></li>
                  <li><a href="/support" className="hover:text-white transition">Contact Us</a></li>
                  <li><a href="/faq" className="hover:text-white transition">FAQ</a></li>
                </ul>
                <div className="pt-2">
                  <p className="text-white font-medium mb-1">Headquarters</p>
                  <p className="text-slate-400">120 Wall Street</p>
                  <p className="text-slate-400">New York, NY 10005</p>
                  <p className="text-slate-400">United States</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-white font-semibold mb-4">Legal</p>
              <ul className="space-y-2 text-sm">
                <li><a href="/privacy" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="/security" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 1994 Crestora Bank. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
