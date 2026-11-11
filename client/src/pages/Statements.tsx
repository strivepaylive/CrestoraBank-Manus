import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { ArrowLeft, FileText, Printer } from 'lucide-react';

export default function Statements() {
  const [, setLocation] = useLocation();
  const accountQuery = trpc.account.me.useQuery(undefined, { retry: false });
  const txQuery = trpc.account.transactions.useQuery(undefined, { retry: false });

  const account = accountQuery.data;
  const transactions = txQuery.data || [];

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-3xl mx-auto py-6">
        <div className="flex items-center justify-between mb-4 print:hidden">
          <Button variant="ghost" onClick={() => setLocation('/dashboard')} className="-ml-2 text-slate-600">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Dashboard
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print / Save PDF
          </Button>
        </div>

        <Card className="p-6 sm:p-8 border-0 shadow-sm rounded-2xl bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Account Statement</h1>
                <p className="text-sm text-slate-500">Generated {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold text-slate-900">Crestora Bank</p>
              <p className="text-slate-500">Member FDIC</p>
            </div>
          </div>

          {account && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-sm">
              <div>
                <p className="text-slate-400 text-xs">Account Holder</p>
                <p className="font-semibold text-slate-900">{account.firstName} {account.lastName}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Account Number</p>
                <p className="font-mono font-semibold text-slate-900">{account.accountNumber || '—'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Account Type</p>
                <p className="font-semibold text-slate-900">Premium Checking</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Current Balance</p>
                <p className="font-bold text-slate-900">
                  ${parseFloat(account.balance as string).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}

          {txQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-center text-slate-500 py-10">No transactions in this period</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs text-slate-400 uppercase tracking-wide">
                  <th className="py-2 pr-2">Date</th>
                  <th className="py-2 pr-2">Description</th>
                  <th className="py-2 pr-2">Reference</th>
                  <th className="py-2 pr-2">Status</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx: any) => (
                  <tr key={tx.id}>
                    <td className="py-2.5 pr-2 text-slate-600 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 pr-2 text-slate-900">
                      {tx.type === 'funding' ? 'Account Credit' :
                       tx.type === 'transfer' ? `Transfer to ${tx.recipientName || 'Recipient'}` :
                       tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                    </td>
                    <td className="py-2.5 pr-2 font-mono text-xs text-slate-500">{tx.reference || '—'}</td>
                    <td className="py-2.5 pr-2 capitalize text-slate-600">{tx.status}</td>
                    <td className={`py-2.5 text-right font-semibold ${
                      tx.type === 'funding' || tx.type === 'deposit' ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      {tx.type === 'funding' || tx.type === 'deposit' ? '+' : '−'}
                      ${parseFloat(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}
