import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { X, Headset } from 'lucide-react';

declare global {
  interface Window {
    smartsupp?: any;
    _smartsupp?: any;
  }
}

const SMARTSUPP_KEY = '236e770d78f9a40cbffffadeafd9094ec9c243b1';

let loaderInjected = false;

function injectSmartsupp() {
  if (loaderInjected || window.smartsupp) return;
  loaderInjected = true;
  window._smartsupp = window._smartsupp || {};
  window._smartsupp.key = SMARTSUPP_KEY;
  (function (d: Document) {
    const o: any = function (...args: any[]) { o._.push(args); };
    (window as any).smartsupp = o;
    o._ = [];
    const s = d.getElementsByTagName('script')[0];
    const c = d.createElement('script');
    c.type = 'text/javascript';
    c.charset = 'utf-8';
    c.async = true;
    c.src = 'https://www.smartsuppchat.com/loader.js?';
    s.parentNode?.insertBefore(c, s);
  })(document);
}

/**
 * Official Smartsupp Live Chat integration.
 * - Loads the Smartsupp widget on all customer-facing pages
 * - Hidden on admin pages so support chat stays customer-only
 * - Identifies logged-in customers by name/email so agents know who they're chatting with
 * - Shows a one-time welcome bubble from Support after login so users know where to get help
 *   (Smartsupp natively shows the agent "typing…" three-dot indicator inside the chat window)
 */
export default function LiveChatWidget() {
  const [location] = useLocation();
  const isAdminPage = location.startsWith('/admin');
  const [showWelcome, setShowWelcome] = useState(false);

  const meQuery = trpc.auth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const accountQuery = trpc.account.me.useQuery(undefined, {
    enabled: Boolean(meQuery.data), retry: false, refetchOnWindowFocus: false,
  });

  // Load / toggle widget by route
  useEffect(() => {
    if (isAdminPage) {
      if (window.smartsupp) window.smartsupp('chat:hide');
      return;
    }
    injectSmartsupp();
    if (window.smartsupp) window.smartsupp('chat:show');
  }, [isAdminPage]);

  // Identify logged-in customer to Smartsupp
  useEffect(() => {
    if (isAdminPage || !window.smartsupp) return;
    const account = accountQuery.data;
    if (account) {
      const fullName = `${account.firstName || ''} ${account.lastName || ''}`.trim();
      if (fullName) window.smartsupp('name', fullName);
      if (account.email) window.smartsupp('email', account.email);
      window.smartsupp('variables', {
        accountNumber: { label: 'Account Number', value: account.accountNumber || 'N/A' },
        username: { label: 'Username', value: account.username || 'N/A' },
        status: { label: 'Account Status', value: account.status || 'N/A' },
      });
    }
  }, [accountQuery.data, isAdminPage]);

  // Welcome bubble: appears once per session after the customer logs in,
  // styled as an incoming message from Support with an unread badge.
  useEffect(() => {
    if (isAdminPage || !accountQuery.data) return;
    if (sessionStorage.getItem('crestora_welcome_shown')) return;
    const timer = setTimeout(() => {
      setShowWelcome(true);
      sessionStorage.setItem('crestora_welcome_shown', '1');
    }, 2500);
    return () => clearTimeout(timer);
  }, [accountQuery.data, isAdminPage]);

  // Auto-hide after 25s so it never lingers forever
  useEffect(() => {
    if (!showWelcome) return;
    const t = setTimeout(() => setShowWelcome(false), 25000);
    return () => clearTimeout(t);
  }, [showWelcome]);

  const firstName = accountQuery.data?.firstName || '';

  const openChat = () => {
    setShowWelcome(false);
    if (window.smartsupp) window.smartsupp('chat:open');
  };

  if (isAdminPage || !showWelcome) return null;

  return (
    <div
      className="fixed z-[9999] bottom-24 right-4 sm:right-6 max-w-[320px] w-[calc(100vw-2rem)] sm:w-[320px]"
      style={{ animation: 'crestoraWelcomeIn 0.35s cubic-bezier(0.23, 1, 0.32, 1)' }}
    >
      <style>{`
        @keyframes crestoraWelcomeIn {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes crestoraPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
      <div
        role="button"
        tabIndex={0}
        onClick={openChat}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openChat(); }}
        className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 cursor-pointer hover:shadow-xl transition-shadow"
      >
        {/* Unread badge */}
        <span
          className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center shadow-md"
          style={{ animation: 'crestoraPulse 1.6s ease-in-out infinite' }}
        >
          1
        </span>
        {/* Close */}
        <button
          aria-label="Dismiss message"
          className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
          onClick={(e) => { e.stopPropagation(); setShowWelcome(false); }}
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3 pr-5">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <Headset className="w-5 h-5 text-white" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 leading-tight">Crestora Support</p>
            <p className="text-xs text-emerald-600 font-medium mb-1">Online now</p>
            <p className="text-sm text-slate-700 leading-snug">
              Hello{firstName ? ` ${firstName}` : ''}! 👋 How can we help you today? Tap here to chat with us.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
