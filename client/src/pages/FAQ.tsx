import { Button } from '@/components/ui/button';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { PlayCircle, TrendingUp, BookOpen, GraduationCap } from 'lucide-react';

const STOCK_VIDEOS = [
  {
    id: 'p7HKvqRI_Bo',
    title: 'How does the stock market work?',
    source: 'TED-Ed',
    description: 'A clear 5-minute animated explainer of what stocks are, how exchanges work, and why prices move.',
  },
  {
    id: 'ZCFkWDdmXG8',
    title: 'Explained: The Stock Market',
    source: 'Netflix / YouTube',
    description: 'A deep dive into the history and mechanics of the stock market, explained simply.',
  },
  {
    id: 'lNdOtlpmH5U',
    title: 'How to Invest for Beginners',
    source: 'Ali Abdaal',
    description: 'A comprehensive guide to getting started with investing, building wealth, and managing risk.',
  },
  {
    id: 'Xn7KWR9EOGQ',
    title: 'Basics of Stock Market For Beginners',
    source: 'CA Rachana Ranade',
    description: 'An introductory lecture covering the core concepts of the stock market and how to approach it.',
  },
];

export default function FAQ() {
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

      {/* Hero */}
      <div className="relative bg-slate-900 py-20">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1920&q=80"
            alt="FAQ Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/50" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-slate-300">Answers to common questions, plus a learning hub to help you understand stocks and investing.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Banking FAQs */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-900">Banking &amp; Accounts</h2>
          </div>
          <Accordion type="single" collapsible className="w-full bg-white rounded-xl border border-slate-100 px-6">
            <AccordionItem value="b-1">
              <AccordionTrigger className="text-left font-semibold">How do I open an account with Crestora Bank?</AccordionTrigger>
              <AccordionContent className="text-slate-600">
                Click "Get Started" and complete the registration form with your personal details, nationality, and date of birth. A unique account number is generated automatically. You can log in right away — full account activation is completed within 24 hours after bank approval.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="b-2">
              <AccordionTrigger className="text-left font-semibold">How long does an international wire transfer take?</AccordionTrigger>
              <AccordionContent className="text-slate-600">
                International wire transfers typically take 1-3 business days. Depending on the destination country and intermediary banks, it may take up to 5 business days. If your transfer requires VAT or IMF clearance codes, processing pauses until the codes are provided.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="b-3">
              <AccordionTrigger className="text-left font-semibold">What are VAT and IMF clearance codes?</AccordionTrigger>
              <AccordionContent className="text-slate-600">
                For certain high-value or international transactions, regulatory bodies require additional verification. A VAT (Value Added Tax) clearance code or IMF (International Monetary Fund) authorization code may be requested to ensure compliance with international financial regulations. You will be notified via email and on your dashboard if a code is required.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="b-4">
              <AccordionTrigger className="text-left font-semibold">How do I complete KYC verification?</AccordionTrigger>
              <AccordionContent className="text-slate-600">
                Log into your account, go to Settings, and open the Verification tab. Upload a valid government-issued ID, a proof of address, and a clear selfie. Verification is usually completed within 24 hours.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="b-5">
              <AccordionTrigger className="text-left font-semibold">How do I apply for a loan?</AccordionTrigger>
              <AccordionContent className="text-slate-600">
                From your dashboard, open the Loans section and choose Personal or Employment. Submit your application with the requested details and you will receive an email notification once it is approved or declined.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Stocks & Investing FAQs */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-900">Stocks &amp; Investing Basics</h2>
          </div>
          <Accordion type="single" collapsible className="w-full bg-white rounded-xl border border-slate-100 px-6">
            <AccordionItem value="s-1">
              <AccordionTrigger className="text-left font-semibold">What is a stock?</AccordionTrigger>
              <AccordionContent className="text-slate-600">
                A stock (or share) represents partial ownership of a company. When you buy a stock, you own a small piece of that business. If the company grows in value, your shares can become worth more; some companies also pay dividends — a share of their profits — to stockholders.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="s-2">
              <AccordionTrigger className="text-left font-semibold">How do I start investing in stocks?</AccordionTrigger>
              <AccordionContent className="text-slate-600">
                Most beginners start by setting a budget they can afford to leave invested for years, opening a brokerage account, and buying diversified investments such as index funds before picking individual stocks. Focus on learning first — the videos below are a great starting point.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="s-3">
              <AccordionTrigger className="text-left font-semibold">What is the difference between stocks and index funds?</AccordionTrigger>
              <AccordionContent className="text-slate-600">
                An individual stock is ownership in a single company, so its value depends entirely on that company's performance. An index fund holds hundreds of companies at once, spreading your risk. Index funds are generally considered a lower-risk way for beginners to get market exposure.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="s-4">
              <AccordionTrigger className="text-left font-semibold">What are the main risks of investing?</AccordionTrigger>
              <AccordionContent className="text-slate-600">
                Stock prices can go down as well as up, and you may get back less than you invested. Common risks include market downturns, individual company failures, and inflation. Diversifying, investing for the long term, and never investing money you need short-term are the standard ways to manage risk.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="s-5">
              <AccordionTrigger className="text-left font-semibold">Where can I learn more about the stock market?</AccordionTrigger>
              <AccordionContent className="text-slate-600">
                Watch the free video lessons in our Learning Hub below, curated from trusted educational channels on YouTube. They cover how the market works, beginner investing strategies, and advice from world-class investors.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Learning Hub: YouTube videos */}
        <section>
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-900">Learning Hub: Stocks &amp; Investing Videos</h2>
          </div>
          <p className="text-slate-600 mb-8">Hand-picked video lessons to help you understand the stock market before you invest.</p>
          <div className="grid md:grid-cols-2 gap-8">
            {STOCK_VIDEOS.map((v) => (
              <div key={v.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="aspect-video">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube-nocookie.com/embed/${v.id}`}
                    title={v.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                    <PlayCircle className="h-4 w-4" /> {v.source}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{v.title}</h3>
                  <p className="text-sm text-slate-600">{v.description}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-8">
            Educational content is provided for general information only and does not constitute financial advice. Investing involves risk, including possible loss of principal. Consider consulting a licensed financial advisor before making investment decisions.
          </p>
        </section>
      </div>

      {/* Footer strip */}
      <div className="bg-slate-900 py-10">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">Still have questions? Visit our <a href="/support" className="text-blue-400 hover:underline">Support Center</a> to get in touch.</p>
        </div>
      </div>
    </div>
  );
}
