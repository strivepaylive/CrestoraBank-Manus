import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { MapPin, Mail, Phone, HelpCircle, FileText, ShieldAlert, CreditCard } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function Support() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent successfully! We will get back to you soon.");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Bar (Simplified for standalone page) */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Crestora Bank
          </a>
          <div className="flex items-center gap-4">
            <a href="/login">
              <Button variant="outline">Sign In</Button>
            </a>
            <a href="/register">
              <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-slate-900 py-24">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1556761175-5973dc0f32d7?auto=format&fit=crop&w=1920&q=80"
            alt="Contact Us Background"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/40" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Contact Us</h1>
          <div className="flex items-center justify-center gap-2 text-slate-300">
            <a href="/" className="hover:text-white transition">Home</a>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-blue-400">Contact Us</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {/* Contact Info Cards */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-6 p-6">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center shadow-inner">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Our Location</h3>
                <p className="text-slate-600">120 Wall Street,<br/>New York, NY 10005, USA</p>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-6 p-6">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center shadow-inner">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Email Us</h3>
                <p className="text-slate-600">info@crestorabank.com<br/>noreply@crestorabank.com</p>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-6 p-6">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center shadow-inner">
                <Phone className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Phone</h3>
                <p className="text-slate-600 uppercase tracking-wide">VIP ONLY<br/>VVIP DIAL</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Help Center Categories */}
        <div className="pt-8 border-t border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Help Center</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6 border border-slate-100 hover:border-blue-200 hover:shadow-md transition cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Accounts & Cards</h3>
                  <p className="text-sm text-slate-500">Managing your accounts, requesting new cards, and limits.</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 border border-slate-100 hover:border-blue-200 hover:shadow-md transition cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Transfers & Payments</h3>
                  <p className="text-sm text-slate-500">Wire transfers, crypto deposits, and transaction statuses.</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 border border-slate-100 hover:border-blue-200 hover:shadow-md transition cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Security & Verification</h3>
                  <p className="text-sm text-slate-500">KYC requirements, VAT/IMF codes, and account security.</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 border border-slate-100 hover:border-blue-200 hover:shadow-md transition cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">General Inquiries</h3>
                  <p className="text-sm text-slate-500">Branch locations, business hours, and other questions.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 mt-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input placeholder="Name*" required className="h-12" />
            </div>
            <div>
              <Input type="email" placeholder="Email*" required className="h-12" />
            </div>
            <div>
              <Input type="tel" placeholder="Phone*" required className="h-12" />
            </div>
            <div>
              <Textarea placeholder="Your Messages.." required className="min-h-[150px] resize-y" />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" required />
              <Label htmlFor="terms" className="text-sm font-normal text-slate-600">
                I agree to the <a href="/terms" className="text-blue-600 hover:underline">Terms & Conditions</a> and <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
              </Label>
            </div>

            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 h-auto text-base font-medium rounded-md">
              SEND MESSAGE <span className="ml-2">›</span>
            </Button>
          </form>
        </div>

        {/* FAQ Section */}
        <div className="pt-12 border-t border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full bg-white rounded-xl border border-slate-100 px-6">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left font-semibold">How long does an international wire transfer take?</AccordionTrigger>
              <AccordionContent className="text-slate-600">
                International wire transfers typically take 1-3 business days to process. However, depending on the destination country and intermediary banks, it may take up to 5 business days. If your transfer requires VAT or IMF clearance codes, processing will pause until the codes are provided.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left font-semibold">What are VAT and IMF clearance codes?</AccordionTrigger>
              <AccordionContent className="text-slate-600">
                For certain high-value or international transactions, regulatory bodies require additional verification. A VAT (Value Added Tax) clearance code or IMF (International Monetary Fund) authorization code may be requested to ensure compliance with international financial regulations. If your transaction requires one of these codes, you will be notified via email and on your dashboard.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left font-semibold">How do I complete my KYC verification?</AccordionTrigger>
              <AccordionContent className="text-slate-600">
                You can complete your KYC (Know Your Customer) verification by logging into your account, navigating to Settings, and selecting the Verification tab. You will need to upload a valid government-issued ID, a proof of address (such as a utility bill), and a clear selfie. Verification is usually completed within 24 hours.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left font-semibold">What should I do if I forget my transfer PIN?</AccordionTrigger>
              <AccordionContent className="text-slate-600">
                If you forget your transfer PIN, you can reset it from the Security section in your Settings. You will need to verify your identity using a One-Time Password (OTP) sent to your registered email address before you can set a new PIN.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
