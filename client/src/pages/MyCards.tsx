import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft, CreditCard as CreditCardIcon, Landmark, ShieldCheck, Loader2, Clock, CheckCircle2, Snowflake, XCircle, Eye, EyeOff, Ban,
} from 'lucide-react';

const CARD_FEE = 25.0;

const statusMeta: Record<string, { label: string; cls: string; icon: any }> = {
  pending: { label: 'Pending Approval', cls: 'bg-amber-100 text-amber-700', icon: Clock },
  approved: { label: 'Approved', cls: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
  active: { label: 'Active', cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  frozen: { label: 'Frozen', cls: 'bg-sky-100 text-sky-700', icon: Snowflake },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700', icon: XCircle },
  deactivated: { label: 'Deactivated', cls: 'bg-slate-200 text-slate-600', icon: Ban },
};

function formatCardNumber(num: string) {
  return num.replace(/(.{4})/g, '$1 ').trim();
}

function maskCard(num?: string | null) {
  if (!num) return '•••• •••• •••• ••••';
  return `•••• •••• •••• ${num.slice(-4)}`;
}

export default function MyCards() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [confirmType, setConfirmType] = useState<'debit' | 'credit' | null>(null);
  const [revealedCardId, setRevealedCardId] = useState<number | null>(null);
  const [deactivateCardId, setDeactivateCardId] = useState<number | null>(null);
  const utils = trpc.useUtils();

  const accountQuery = trpc.account.me.useQuery(undefined, {
    enabled: Boolean(user), retry: false, refetchOnWindowFocus: false,
  });
  const cardsQuery = trpc.cards.myCards.useQuery(undefined, {
    enabled: Boolean(user), retry: false, refetchOnWindowFocus: false,
  });

  const requestCard = trpc.cards.request.useMutation({
    onSuccess: (res) => {
      toast.success(`Card request submitted. $${res.feeCharged} issuance fee debited from your balance.`);
      setConfirmType(null);
      utils.cards.myCards.invalidate();
      utils.account.me.invalidate();
      utils.account.transactions.invalidate();
      utils.account.notifications.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || 'Card request failed');
      setConfirmType(null);
    },
  });

  const setCardStatus = trpc.cards.setStatus.useMutation({
    onSuccess: (res) => {
      const msg = res.status === 'frozen' ? 'Card frozen' : res.status === 'deactivated' ? 'Card deactivated' : 'Card reactivated';
      toast.success(msg);
      setDeactivateCardId(null);
      utils.cards.myCards.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update card');
      setDeactivateCardId(null);
    },
  });

  useEffect(() => {
    if (!loading && !user) setLocation('/login');
  }, [loading, user, setLocation]);

  if (loading || (user && accountQuery.isLoading)) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }
  if (!user) return null;

  const account = accountQuery.data;
  const balance = account ? parseFloat(account.balance as string) : 0;
  const myCards = cardsQuery.data || [];
  const hasPending = (type: string) => myCards.some((c: any) => c.type === type && c.status === 'pending');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top nav */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation('/dashboard')} title="Back to dashboard">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shrink-0">
                <Landmark className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">Crestora</span>
            </div>
          </div>
          <div className="text-sm text-slate-500">
            Balance: <span className="font-semibold text-slate-900">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">My Cards</h1>
          <p className="text-slate-500 mt-1">Apply for a debit or credit card. A one-time ${CARD_FEE.toFixed(2)} issuance fee is debited from your account balance.</p>
        </div>

        {/* Apply options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Debit */}
          <Card className="p-0 overflow-hidden border-0 shadow-md rounded-2xl">
            <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-6 text-white">
              <div className="flex items-center justify-between mb-8">
                <Landmark className="h-7 w-7 text-blue-200" />
                <span className="text-xs uppercase tracking-widest text-blue-200">Debit Card</span>
              </div>
              <p className="font-mono text-lg tracking-widest mb-4">•••• •••• •••• ••••</p>
              <p className="text-sm text-blue-200">Instant access to your account balance worldwide</p>
            </div>
            <div className="p-5 bg-white">
              <ul className="text-sm text-slate-600 space-y-1.5 mb-4">
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Zero liability fraud protection</li>
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> No monthly maintenance fees</li>
              </ul>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={hasPending('debit') || requestCard.isPending}
                onClick={() => setConfirmType('debit')}
              >
                {hasPending('debit') ? 'Request Pending' : `Apply — $${CARD_FEE.toFixed(2)} fee`}
              </Button>
            </div>
          </Card>

          {/* Credit */}
          <Card className="p-0 overflow-hidden border-0 shadow-md rounded-2xl">
            <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-black p-6 text-white">
              <div className="flex items-center justify-between mb-8">
                <CreditCardIcon className="h-7 w-7 text-amber-300" />
                <span className="text-xs uppercase tracking-widest text-amber-300">Credit Card</span>
              </div>
              <p className="font-mono text-lg tracking-widest mb-4">•••• •••• •••• ••••</p>
              <p className="text-sm text-slate-300">2% unlimited cash back on every purchase</p>
            </div>
            <div className="p-5 bg-white">
              <ul className="text-sm text-slate-600 space-y-1.5 mb-4">
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> No annual fee, no foreign transaction fees</li>
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Build credit with on-time payments</li>
              </ul>
              <Button
                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                disabled={hasPending('credit') || requestCard.isPending}
                onClick={() => setConfirmType('credit')}
              >
                {hasPending('credit') ? 'Request Pending' : `Apply — $${CARD_FEE.toFixed(2)} fee`}
              </Button>
            </div>
          </Card>
        </div>

        {/* My cards list */}
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Cards & Requests</h2>
        {cardsQuery.isLoading ? (
          <Skeleton className="h-24 w-full rounded-xl" />
        ) : myCards.length === 0 ? (
          <Card className="p-10 text-center border-dashed">
            <CreditCardIcon className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No cards yet. Apply for your first card above.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myCards.map((c: any) => {
              const meta = statusMeta[c.status] || statusMeta.pending;
              const MetaIcon = meta.icon;
              const hasDetails = Boolean(c.cardNumber) && ['approved', 'active', 'frozen'].includes(c.status);
              const revealed = revealedCardId === c.id;
              const isFrozen = c.status === 'frozen';
              return (
                <Card key={c.id} className="p-0 overflow-hidden border-0 shadow-md rounded-2xl">
                  {/* Virtual card face */}
                  <div className={`relative p-6 text-white ${
                    c.status === 'deactivated' ? 'bg-gradient-to-br from-slate-400 to-slate-600'
                    : c.type === 'credit' ? 'bg-gradient-to-br from-slate-800 via-slate-900 to-black'
                    : 'bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900'
                  }`}>
                    {isFrozen && (
                      <div className="absolute inset-0 bg-sky-200/20 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <span className="flex items-center gap-2 bg-white/90 text-sky-700 px-4 py-1.5 rounded-full text-sm font-semibold">
                          <Snowflake className="h-4 w-4" /> Card Frozen
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-md bg-white/15 flex items-center justify-center">
                          <Landmark className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold tracking-wide">Crestora Bank</span>
                      </div>
                      <span className={`text-xs uppercase tracking-widest ${c.type === 'credit' ? 'text-amber-300' : 'text-blue-200'}`}>
                        {c.type} Card
                      </span>
                    </div>
                    <p className="font-mono text-xl tracking-[0.15em] mb-5">
                      {hasDetails
                        ? (revealed ? formatCardNumber(c.cardNumber) : maskCard(c.cardNumber))
                        : '•••• •••• •••• ••••'}
                    </p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider opacity-70">Cardholder</p>
                        <p className="text-sm font-semibold">{c.cardholderName || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider opacity-70">Expires</p>
                        <p className="text-sm font-semibold font-mono">{hasDetails && revealed ? (c.expiryDate || '••/••') : '••/••'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider opacity-70">CVV</p>
                        <p className="text-sm font-semibold font-mono">{hasDetails && revealed ? (c.cvv || '•••') : '•••'}</p>
                      </div>
                    </div>
                  </div>
                  {/* Card info + actions */}
                  <div className="p-4 bg-white flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${meta.cls}`}>
                        <MetaIcon className="h-3.5 w-3.5" /> {meta.label}
                      </span>
                      <span className="text-xs text-slate-500">
                        Fee paid: <span className="font-medium text-slate-900">${parseFloat(c.issuanceFee || '0').toFixed(2)}</span>
                      </span>
                    </div>
                    {c.status === 'pending' && (
                      <p className="text-xs text-slate-500">Your card details will appear here once your request is approved.</p>
                    )}
                    {hasDetails && (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm" variant="outline"
                          onClick={() => setRevealedCardId(revealed ? null : c.id)}
                        >
                          {revealed ? <><EyeOff className="h-4 w-4 mr-1.5" /> Hide Details</> : <><Eye className="h-4 w-4 mr-1.5" /> Show Details</>}
                        </Button>
                        {!isFrozen ? (
                          <Button
                            size="sm" variant="outline"
                            className="border-sky-300 text-sky-700 hover:bg-sky-50"
                            disabled={setCardStatus.isPending}
                            onClick={() => setCardStatus.mutate({ cardId: c.id, action: 'freeze' })}
                          >
                            <Snowflake className="h-4 w-4 mr-1.5" /> Freeze
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-sky-600 hover:bg-sky-700 text-white"
                            disabled={setCardStatus.isPending}
                            onClick={() => setCardStatus.mutate({ cardId: c.id, action: 'unfreeze' })}
                          >
                            <Snowflake className="h-4 w-4 mr-1.5" /> Unfreeze
                          </Button>
                        )}
                        <Button
                          size="sm" variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          disabled={setCardStatus.isPending}
                          onClick={() => setDeactivateCardId(c.id)}
                        >
                          <Ban className="h-4 w-4 mr-1.5" /> Deactivate
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Deactivate confirmation dialog */}
      <AlertDialog open={deactivateCardId !== null} onOpenChange={(o) => !o && setDeactivateCardId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate this card?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently deactivate your card. It can no longer be used and cannot be reactivated.
              You would need to apply for a new card (a new issuance fee applies).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={setCardStatus.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={setCardStatus.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (deactivateCardId) setCardStatus.mutate({ cardId: deactivateCardId, action: 'deactivate' });
              }}
            >
              {setCardStatus.isPending ? 'Deactivating…' : 'Yes, Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Fee confirmation dialog */}
      <Dialog open={confirmType !== null} onOpenChange={(o) => !o && setConfirmType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm {confirmType === 'credit' ? 'Credit' : 'Debit'} Card Application</DialogTitle>
            <DialogDescription>
              A one-time <span className="font-semibold">${CARD_FEE.toFixed(2)}</span> card issuance fee will be debited
              from your account balance immediately. Your current balance is{' '}
              <span className="font-semibold">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>.
              You will receive an email confirmation of the debit, and your card request will be reviewed by our team.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmType(null)} disabled={requestCard.isPending}>Cancel</Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              disabled={requestCard.isPending}
              onClick={() => confirmType && requestCard.mutate({ type: confirmType })}
            >
              {requestCard.isPending ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing…</>) : `Pay $${CARD_FEE.toFixed(2)} & Apply`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
