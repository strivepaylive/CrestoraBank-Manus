import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Globe, KeyRound, Landmark, Loader2, Printer, RefreshCw, Send } from 'lucide-react';
import { SiBitcoin, SiCashapp, SiPaypal, SiRevolut, SiVenmo, SiWise, SiZelle } from 'react-icons/si';

type MethodKey = 'wire' | 'crypto' | 'paypal' | 'wise' | 'cashapp' | 'zelle' | 'venmo' | 'revolut';

const METHOD_CONFIG: Record<MethodKey, {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  accountLabel: string;
  accountPlaceholder: string;
  bankLabel: string | null; // null = hide the bank field and auto-fill
  bankAutoValue: string;
  detailLabel?: string; // extra method-specific field (e.g. crypto network)
  detailPlaceholder?: string;
  detailOptions?: string[];
}> = {
  wire: {
    title: 'Wire Transfer', subtitle: 'Transfer funds directly to local or international bank accounts',
    icon: <Landmark className="h-5 w-5 text-blue-600" />, iconBg: 'bg-blue-50',
    accountLabel: 'Account Number *', accountPlaceholder: 'Recipient account number',
    bankLabel: 'Bank Name *', bankAutoValue: '',
  },
  crypto: {
    title: 'Cryptocurrency', subtitle: 'Send funds to your cryptocurrency wallet',
    icon: <SiBitcoin className="h-5 w-5 text-orange-500" />, iconBg: 'bg-orange-50',
    accountLabel: 'Wallet Address *', accountPlaceholder: 'Paste your wallet address',
    bankLabel: null, bankAutoValue: 'Crypto Wallet',
    detailLabel: 'Asset / Network *', detailPlaceholder: 'Select asset',
    detailOptions: ['Bitcoin (BTC)', 'Ethereum (ETH)', 'USDT (ERC-20)', 'USDT (TRC-20)', 'Dogecoin (DOGE)'],
  },
  paypal: {
    title: 'PayPal', subtitle: 'Transfer funds to your PayPal account',
    icon: <SiPaypal className="h-5 w-5 text-[#003087]" />, iconBg: 'bg-indigo-50',
    accountLabel: 'PayPal Email *', accountPlaceholder: 'name@example.com',
    bankLabel: null, bankAutoValue: 'PayPal',
  },
  wise: {
    title: 'Wise Transfer', subtitle: 'Transfer with lower fees using Wise',
    icon: <SiWise className="h-5 w-5 text-[#163300]" />, iconBg: 'bg-lime-50',
    accountLabel: 'Wise Email or Account ID *', accountPlaceholder: 'name@example.com',
    bankLabel: null, bankAutoValue: 'Wise',
  },
  cashapp: {
    title: 'Cash App', subtitle: 'Quick transfers to your Cash App account',
    icon: <SiCashapp className="h-5 w-5 text-[#00C244]" />, iconBg: 'bg-emerald-50',
    accountLabel: 'Cashtag *', accountPlaceholder: '$yourcashtag',
    bankLabel: null, bankAutoValue: 'Cash App',
  },
  zelle: {
    title: 'Zelle', subtitle: 'Send to a Zelle-enrolled email or U.S. mobile number',
    icon: <SiZelle className="h-5 w-5 text-[#6D1ED4]" />, iconBg: 'bg-purple-50',
    accountLabel: 'Zelle Email or Phone *', accountPlaceholder: 'name@example.com or +1 555 000 0000',
    bankLabel: null, bankAutoValue: 'Zelle',
  },
  venmo: {
    title: 'Venmo', subtitle: 'Transfer funds to your Venmo account',
    icon: <SiVenmo className="h-5 w-5 text-[#008CFF]" />, iconBg: 'bg-sky-50',
    accountLabel: 'Venmo Username *', accountPlaceholder: '@your-venmo',
    bankLabel: null, bankAutoValue: 'Venmo',
  },
  revolut: {
    title: 'Revolut', subtitle: 'Send funds to a Revolut account',
    icon: <SiRevolut className="h-5 w-5 text-slate-900" />, iconBg: 'bg-slate-100',
    accountLabel: 'Revtag or Phone *', accountPlaceholder: '@revtag or +44 7000 000000',
    bankLabel: null, bankAutoValue: 'Revolut',
  },
};

function getMethodFromUrl(): MethodKey {
  if (typeof window === 'undefined') return 'wire';
  const m = new URLSearchParams(window.location.search).get('method');
  if (m && m in METHOD_CONFIG) return m as MethodKey;
  return 'wire';
}

type ReceiptConversion = {
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: number;
  transferFee: number;
  recipientAmount: number;
  rateTimestamp: string;
};

type Receipt = {
  reference: string;
  amount: string;
  currency: string;
  recipientName: string;
  recipientAccount: string;
  recipientBank: string;
  transferType: string;
  description: string;
  timestamp: Date;
  conversion: ReceiptConversion | null;
  methodTitle: string;
};

function fmt(n: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

export default function Transfer() {
  const [, setLocation] = useLocation();
  const [method] = useState<MethodKey>(() => getMethodFromUrl());
  const cfg = METHOD_CONFIG[method];
  const isWire = method === 'wire';
  const [transferType, setTransferType] = useState<'local' | 'international'>('local');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [recipientCurrency, setRecipientCurrency] = useState('USD');
  const [bankName, setBankName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [methodDetail, setMethodDetail] = useState('');
  const [description, setDescription] = useState('');
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [debouncedAmount, setDebouncedAmount] = useState<number | null>(null);
  const transferMutation = trpc.account.transfer.useMutation();
  const accountQuery = trpc.account.me.useQuery(undefined, { retry: false });
  const currenciesQuery = trpc.account.supportedCurrencies.useQuery(undefined, { staleTime: Infinity });
  const pinStatusQuery = trpc.account.pinStatus.useQuery(undefined, { retry: false });
  const utils = trpc.useUtils();
  const isProcessing = transferMutation.isPending;

  const setPinMutation = trpc.account.setPin.useMutation({
    onSuccess: () => {
      toast.success('Transfer PIN created. You can now authorize transfers.');
      setNewPin(''); setConfirmNewPin('');
      utils.account.pinStatus.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const availableBalance = accountQuery.data ? parseFloat(accountQuery.data.balance as string) : null;
  const currencies = currenciesQuery.data || [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
  ];

  // Debounce the amount for live quotes
  useEffect(() => {
    const amt = parseFloat(amount);
    const timer = setTimeout(() => {
      setDebouncedAmount(!isNaN(amt) && amt > 0 ? amt : null);
    }, 450);
    return () => clearTimeout(timer);
  }, [amount]);

  const crossCurrency = recipientCurrency !== currency;
  const quoteQuery = trpc.account.conversionQuote.useQuery(
    {
      amount: debouncedAmount ?? 1,
      fromCurrency: currency,
      toCurrency: recipientCurrency,
      transferType,
    },
    {
      enabled: crossCurrency && debouncedAmount !== null,
      staleTime: 60_000,
      refetchInterval: 60_000,
    },
  );
  const quote = crossCurrency && debouncedAmount !== null ? quoteQuery.data : null;

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    const effectiveBank = isWire ? bankName : cfg.bankAutoValue;
    if (!accountNumber || !amount || !effectiveBank || !recipientName) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (cfg.detailOptions && !methodDetail) {
      toast.error(`Please select ${cfg.detailLabel?.replace(' *', '') || 'an option'}`);
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!/^\d{4,6}$/.test(pin)) {
      toast.error('Enter your 4-6 digit transfer PIN to authorize this transfer');
      return;
    }

    try {
      const result = await transferMutation.mutateAsync({
        amount: amt,
        recipientName,
        recipientAccount: accountNumber,
        recipientBank: effectiveBank,
        transferType,
        transferMethod: method,
        methodDetail: methodDetail || undefined,
        pin,
        currency,
        recipientCurrency: crossCurrency ? recipientCurrency : undefined,
        description: description || undefined,
      });

      await utils.account.invalidate();
      setPin('');
      setReceipt({
        reference: result.reference || 'N/A',
        amount: amt.toFixed(2),
        currency,
        recipientName,
        recipientAccount: accountNumber,
        recipientBank: effectiveBank,
        transferType,
        description,
        timestamp: new Date(),
        conversion: result.conversion || null,
        methodTitle: cfg.title,
      });
    } catch (error: any) {
      const msg = error?.message || 'Transfer failed. Please try again.';
      if (msg.includes('Insufficient')) {
        toast.error('Insufficient funds for this transfer.');
      } else if (msg.toLowerCase().includes('pin')) {
        toast.error(msg);
        setPin('');
      } else {
        toast.error(msg);
      }
    }
  };

  // ===== First-time PIN setup gate =====
  if (pinStatusQuery.data && !pinStatusQuery.data.hasPin) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 border-0 shadow-xl rounded-2xl bg-white">
          <div className="text-center mb-6">
            <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="h-7 w-7 text-blue-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Create Your Transfer PIN</h1>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              For your security, a 4–6 digit PIN is required to authorize transfers.
              You only need to set this up once.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="setupPin">New PIN (4–6 digits) *</Label>
              <Input id="setupPin" type="password" inputMode="numeric" maxLength={6} value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))} className="mt-1.5 text-center tracking-[0.4em] font-mono" />
            </div>
            <div>
              <Label htmlFor="setupPinConfirm">Confirm PIN *</Label>
              <Input id="setupPinConfirm" type="password" inputMode="numeric" maxLength={6} value={confirmNewPin}
                onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, ''))} className="mt-1.5 text-center tracking-[0.4em] font-mono" />
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={setPinMutation.isPending}
              onClick={() => {
                if (!/^\d{4,6}$/.test(newPin)) { toast.error('PIN must be 4-6 digits.'); return; }
                if (newPin !== confirmNewPin) { toast.error('PINs do not match.'); return; }
                setPinMutation.mutate({ pin: newPin });
              }}
            >
              {setPinMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <KeyRound className="w-4 h-4 mr-2" />}
              Create PIN & Continue
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setLocation('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ===== Receipt view =====
  if (receipt) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <Card className="max-w-lg w-full p-8 border-0 shadow-xl rounded-2xl bg-white">
          <div className="text-center mb-6">
            <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-9 w-9 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Transfer Submitted</h1>
            <p className="text-slate-500 mt-1 flex items-center justify-center gap-1.5 text-sm">
              <Clock className="h-4 w-4 text-sky-500" /> Transaction processing
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-5 space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-200 pb-3">
              <span className="text-slate-500">Transaction Reference</span>
              <span className="font-mono font-semibold text-slate-900">{receipt.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount</span>
              <span className="font-bold text-slate-900">
                {receipt.currency} {parseFloat(receipt.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Beneficiary</span>
              <span className="font-medium text-slate-900">{receipt.recipientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Account</span>
              <span className="font-mono text-slate-900">{receipt.recipientAccount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Bank</span>
              <span className="text-slate-900">{receipt.recipientBank}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Method</span>
              <span className="text-slate-900">{receipt.methodTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Type</span>
              <span className="text-slate-900 capitalize">{receipt.transferType} transfer</span>
            </div>
            {receipt.description && (
              <div className="flex justify-between">
                <span className="text-slate-500">Description</span>
                <span className="text-slate-900 text-right max-w-[220px]">{receipt.description}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-200 pt-3">
              <span className="text-slate-500">Date & Time</span>
              <span className="text-slate-900">{receipt.timestamp.toLocaleString()}</span>
            </div>
          </div>

          {receipt.conversion && (
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-5 space-y-2.5 text-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" /> Currency Conversion
              </p>
              <div className="flex justify-between">
                <span className="text-slate-500">Exchange Rate</span>
                <span className="text-slate-900 font-medium">
                  1 {receipt.conversion.fromCurrency} = {receipt.conversion.exchangeRate.toFixed(4)} {receipt.conversion.toCurrency}
                </span>
              </div>
              {receipt.conversion.transferFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Transfer Fee</span>
                  <span className="text-slate-900">{fmt(receipt.conversion.transferFee, receipt.conversion.fromCurrency)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-blue-100 pt-2.5">
                <span className="text-slate-500">Recipient Receives (est.)</span>
                <span className="font-bold text-blue-900">{fmt(receipt.conversion.recipientAmount, receipt.conversion.toCurrency)}</span>
              </div>
            </div>
          )}

          <p className="text-xs text-slate-400 text-center mt-4">
            Your transaction is processing. A confirmation email has been sent to you, and you'll be notified by email at every stage. If additional verification is required, we'll let you know exactly what to do.
          </p>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" /> Print Receipt
            </Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => setLocation('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ===== Transfer form =====
  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-2xl mx-auto py-6">
        <Button variant="ghost" onClick={() => setLocation('/transfer-method')} className="mb-4 -ml-2 text-slate-600">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Change Transfer Method
        </Button>

        <Card className="p-6 sm:p-8 border-0 shadow-md rounded-2xl bg-white">
          <div className="flex items-center gap-3 mb-1">
            <div className={`h-10 w-10 rounded-xl ${cfg.iconBg} flex items-center justify-center`}>
              {cfg.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{cfg.title}</h1>
              <p className="text-sm text-slate-500">{cfg.subtitle}</p>
            </div>
          </div>

          {availableBalance !== null && (
            <div className="mt-4 mb-6 bg-blue-50 rounded-xl px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-blue-700">Available balance</span>
              <span className="font-bold text-blue-900">
                ${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          <form onSubmit={handleTransfer} className="space-y-5">
            {isWire && (
            <div>
              <Label className="mb-2 block">Transfer Type</Label>
              <div className="grid grid-cols-2 gap-3">
                {(['local', 'international'] as const).map((t) => (
                  <button
                    key={t} type="button"
                    onClick={() => setTransferType(t)}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150 active:scale-[0.98] ${
                      transferType === t
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {t === 'local' ? 'Local Transfer' : 'International Wire'}
                  </button>
                ))}
              </div>
            </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recipientName">{isWire ? 'Beneficiary Name *' : 'Recipient / Account Holder Name *'}</Label>
                <Input id="recipientName" placeholder="Full name" value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)} className="mt-1.5" />
              </div>
              {isWire ? (
              <div>
                <Label htmlFor="bankName">Bank Name *</Label>
                <Input id="bankName" placeholder="Recipient's bank" value={bankName}
                  onChange={(e) => setBankName(e.target.value)} className="mt-1.5" />
              </div>
              ) : cfg.detailOptions ? (
              <div>
                <Label>{cfg.detailLabel}</Label>
                <Select value={methodDetail} onValueChange={setMethodDetail}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder={cfg.detailPlaceholder} /></SelectTrigger>
                  <SelectContent>
                    {cfg.detailOptions.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              ) : null}
            </div>

            <div>
              <Label htmlFor="accountNumber">{cfg.accountLabel}</Label>
              <Input id="accountNumber" placeholder={cfg.accountPlaceholder} value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)} className="mt-1.5" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input id="amount" type="number" step="0.01" min="0.01" placeholder="0.00" value={amount}
                  onChange={(e) => setAmount(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>You Send In</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {currencies.map((c) => (
                      <SelectItem key={c.code} value={c.code}>{c.code} — {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Recipient Receives In</Label>
              <Select value={recipientCurrency} onValueChange={setRecipientCurrency}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c.code} value={c.code}>{c.code} — {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!crossCurrency && (
                <p className="text-xs text-slate-400 mt-1.5">Same currency — no conversion needed.</p>
              )}
            </div>

            {crossCurrency && (
              <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" /> Live Currency Conversion
                  </p>
                  {quoteQuery.isFetching && <RefreshCw className="h-3.5 w-3.5 text-blue-400 animate-spin" />}
                </div>
                {debouncedAmount === null ? (
                  <p className="text-sm text-slate-500">Enter an amount above to see the live exchange rate and what your recipient will receive.</p>
                ) : quoteQuery.isLoading ? (
                  <p className="text-sm text-slate-500">Fetching live exchange rate…</p>
                ) : quoteQuery.isError ? (
                  <p className="text-sm text-red-600">Could not fetch the exchange rate right now. You can still submit — the rate will be applied at processing time.</p>
                ) : quote ? (
                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-center justify-center gap-3 py-2">
                      <div className="text-center">
                        <p className="text-lg font-bold text-slate-900">{fmt(quote.amount, quote.fromCurrency)}</p>
                        <p className="text-[11px] text-slate-500">You send</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-blue-400 shrink-0" />
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-700">{fmt(quote.recipientAmount, quote.toCurrency)}</p>
                        <p className="text-[11px] text-slate-500">Recipient gets (est.)</p>
                      </div>
                    </div>
                    <div className="flex justify-between border-t border-blue-100 pt-2.5">
                      <span className="text-slate-500">Exchange rate</span>
                      <span className="font-medium text-slate-900">1 {quote.fromCurrency} = {quote.exchangeRate.toFixed(4)} {quote.toCurrency}</span>
                    </div>
                    {quote.transferFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Transfer fee (deducted)</span>
                        <span className="text-slate-900">{fmt(quote.transferFee, quote.fromCurrency)}</span>
                      </div>
                    )}
                    <p className="text-[11px] text-slate-400 pt-1">
                      Live mid-market rate · updates every minute · final rate locked when you submit
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea id="description" placeholder="What is this transfer for?" value={description}
                onChange={(e) => setDescription(e.target.value)} className="mt-1.5 resize-none" rows={2} />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <Label htmlFor="transferPin" className="flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-blue-600" /> Transfer PIN *
              </Label>
              <Input id="transferPin" type="password" inputMode="numeric" maxLength={6} placeholder="••••" value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="mt-1.5 max-w-[180px] text-center tracking-[0.4em] font-mono bg-white" />
              <p className="text-[11px] text-slate-400 mt-1.5">Enter your 4–6 digit PIN to authorize this transfer. Forgot it? Reset in Settings → Transfer PIN.</p>
            </div>

            <Button type="submit" disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base font-semibold active:scale-[0.98] transition-transform">
              {isProcessing ? 'Processing…' : 'Review & Submit Transfer'}
            </Button>
            <p className="text-xs text-slate-400 text-center">
              Transfers are reviewed for security and typically processed within 1 business day.
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
