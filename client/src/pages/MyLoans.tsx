import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import DashboardLayout from '@/components/DashboardLayout';
import { Landmark, Briefcase, User, BadgeCheck, Clock, XCircle, ChevronLeft } from 'lucide-react';

const PERSONAL_APR = 12.5;
const EMPLOYMENT_APR = 8.5;

function calcMonthly(principal: number, aprPct: number, months: number): number {
  const r = aprPct / 100 / 12;
  if (!principal || !months) return 0;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

function fmtUSD(n: number | string): string {
  const v = typeof n === 'string' ? parseFloat(n) : n;
  if (isNaN(v)) return '$0.00';
  return v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function statusBadge(status: string) {
  if (status === 'approved') return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"><BadgeCheck className="w-3.5 h-3.5 mr-1" />Approved</Badge>;
  if (status === 'declined') return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><XCircle className="w-3.5 h-3.5 mr-1" />Declined</Badge>;
  return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100"><Clock className="w-3.5 h-3.5 mr-1" />Under Review</Badge>;
}

export default function MyLoans() {
  const [view, setView] = useState<'list' | 'apply'>('list');
  const [category, setCategory] = useState<'personal' | 'employment' | null>(null);
  const [employer, setEmployer] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [termMonths, setTermMonths] = useState('12');

  const utils = trpc.useUtils();
  const { data: myLoans, isLoading } = trpc.loans.myLoans.useQuery();
  const { data: employers } = trpc.loans.employers.useQuery();
  const submitLoan = trpc.loans.submit.useMutation({
    onSuccess: (res) => {
      toast.success(`Loan application submitted. Reference: ${res.reference}`);
      utils.loans.myLoans.invalidate();
      setView('list');
      setCategory(null);
      setEmployer(''); setWorkEmail(''); setAmount(''); setPurpose(''); setTermMonths('12');
    },
    onError: (err) => toast.error(err.message),
  });

  const apr = category === 'employment' ? EMPLOYMENT_APR : PERSONAL_APR;
  const estMonthly = useMemo(
    () => calcMonthly(parseFloat(amount || '0'), apr, parseInt(termMonths || '0')),
    [amount, apr, termMonths]
  );

  const hasPending = (myLoans || []).some(l => l.status === 'pending');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error('Please enter a valid loan amount'); return; }
    if (amt > 1000000) { toast.error('Maximum loan amount is $1,000,000'); return; }
    if (!purpose.trim() || purpose.trim().length < 3) { toast.error('Please describe the purpose of the loan'); return; }
    if (category === 'employment') {
      if (!employer) { toast.error('Please select your employer'); return; }
      if (!workEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(workEmail)) { toast.error('Please enter a valid work email address'); return; }
    }
    submitLoan.mutate({
      category,
      employer: category === 'employment' ? employer : undefined,
      workEmail: category === 'employment' ? workEmail : undefined,
      amount: amt,
      purpose: purpose.trim(),
      termMonths: parseInt(termMonths),
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        {view === 'list' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Loans</h1>
                <p className="text-slate-500 mt-1">Apply for a loan and track your applications</p>
              </div>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  if (hasPending) { toast.error('You already have an application under review'); return; }
                  setView('apply');
                }}
              >
                <Landmark className="w-4 h-4 mr-2" /> Apply for a Loan
              </Button>
            </div>

            {isLoading ? (
              <Card className="p-8 text-center text-slate-500">Loading your applications…</Card>
            ) : (myLoans || []).length === 0 ? (
              <Card className="p-10 text-center">
                <Landmark className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-900 mb-1">No loan applications yet</h3>
                <p className="text-slate-500 mb-5">Apply for a Personal or Employment loan — decisions are typically fast.</p>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setView('apply')}>Start an Application</Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {(myLoans || []).map((loan) => (
                  <Card key={loan.id} className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {loan.category === 'employment' ? <Briefcase className="w-4 h-4 text-blue-600" /> : <User className="w-4 h-4 text-blue-600" />}
                          <span className="font-semibold text-slate-900">{loan.category === 'employment' ? 'Employment Loan' : 'Personal Loan'}</span>
                          {statusBadge(loan.status)}
                        </div>
                        <p className="text-xs text-slate-500 font-mono">{loan.reference}</p>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">{fmtUSD(loan.amount)}</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">
                      <div><p className="text-slate-500">Term</p><p className="font-medium text-slate-900">{loan.termMonths} months</p></div>
                      <div><p className="text-slate-500">APR</p><p className="font-medium text-slate-900">{loan.interestRate}%</p></div>
                      <div><p className="text-slate-500">Est. Monthly</p><p className="font-medium text-slate-900">{fmtUSD(loan.monthlyPayment)}</p></div>
                      <div><p className="text-slate-500">Applied</p><p className="font-medium text-slate-900">{new Date(loan.createdAt).toLocaleDateString()}</p></div>
                    </div>
                    {loan.category === 'employment' && loan.employer && (
                      <p className="text-sm text-slate-500 mt-3"><span className="font-medium text-slate-700">Employer:</span> {loan.employer}{loan.workEmail ? ` · ${loan.workEmail}` : ''}</p>
                    )}
                    <p className="text-sm text-slate-500 mt-1"><span className="font-medium text-slate-700">Purpose:</span> {loan.purpose}</p>
                    {loan.adminMessage && (
                      <div className="mt-3 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg p-3">
                        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Message from the Bank</p>
                        <p className="text-sm text-slate-700">{loan.adminMessage}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {view === 'apply' && !category && (
          <>
            <button onClick={() => setView('list')} className="flex items-center text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Loans
            </button>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Choose Loan Type</h1>
            <p className="text-slate-500 mb-6">Select the loan that fits your situation.</p>
            <div className="grid sm:grid-cols-2 gap-5">
              <Card
                className="p-7 cursor-pointer border-2 hover:border-blue-600 transition-colors"
                onClick={() => setCategory('personal')}
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Personal Loan</h3>
                <p className="text-sm text-slate-500 mb-3">For personal expenses, debt consolidation, home improvement, and more.</p>
                <p className="text-sm font-semibold text-blue-700">{PERSONAL_APR}% APR</p>
              </Card>
              <Card
                className="p-7 cursor-pointer border-2 hover:border-blue-600 transition-colors"
                onClick={() => setCategory('employment')}
              >
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Employment Loan</h3>
                <p className="text-sm text-slate-500 mb-3">Preferential rate for employees of partner organizations. Verified against your employer.</p>
                <p className="text-sm font-semibold text-emerald-700">{EMPLOYMENT_APR}% APR — preferred rate</p>
              </Card>
            </div>
          </>
        )}

        {view === 'apply' && category && (
          <>
            <button onClick={() => setCategory(null)} className="flex items-center text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Loan Types
            </button>
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-1">
                {category === 'employment' ? <Briefcase className="w-6 h-6 text-emerald-600" /> : <User className="w-6 h-6 text-blue-600" />}
                <h1 className="text-2xl font-bold text-slate-900">{category === 'employment' ? 'Employment Loan' : 'Personal Loan'} Application</h1>
              </div>
              <p className="text-slate-500 mb-6 text-sm">{category === 'employment' ? `Preferred rate of ${EMPLOYMENT_APR}% APR for employees of partner organizations.` : `${PERSONAL_APR}% APR with flexible terms.`}</p>
              <form onSubmit={handleSubmit} className="space-y-5">
                {category === 'employment' && (
                  <>
                    <div>
                      <Label htmlFor="employer">Employer</Label>
                      <Select value={employer} onValueChange={setEmployer}>
                        <SelectTrigger id="employer" className="mt-1.5">
                          <SelectValue placeholder="Select your employer" />
                        </SelectTrigger>
                        <SelectContent>
                          {(employers || []).map((e) => (
                            <SelectItem key={e} value={e}>{e}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="workEmail">Work Email Address</Label>
                      <Input
                        id="workEmail" type="email" placeholder="you@company.com"
                        value={workEmail} onChange={(e) => setWorkEmail(e.target.value)}
                        className="mt-1.5"
                      />
                      <p className="text-xs text-slate-500 mt-1">We use this to verify your employment with the selected organization.</p>
                    </div>
                  </>
                )}
                <div>
                  <Label htmlFor="amount">Loan Amount (USD)</Label>
                  <Input
                    id="amount" type="number" min="100" step="0.01" placeholder="e.g. 5,000"
                    value={amount} onChange={(e) => setAmount(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="term">Repayment Term</Label>
                  <Select value={termMonths} onValueChange={setTermMonths}>
                    <SelectTrigger id="term" className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['6', '12', '24', '36', '48', '60'].map((m) => (
                        <SelectItem key={m} value={m}>{m} months</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="purpose">Purpose of Loan</Label>
                  <Textarea
                    id="purpose" rows={3} placeholder="Briefly describe what this loan is for"
                    value={purpose} onChange={(e) => setPurpose(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Estimated Terms</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div><p className="text-slate-500">APR</p><p className="font-bold text-slate-900">{apr}%</p></div>
                    <div><p className="text-slate-500">Term</p><p className="font-bold text-slate-900">{termMonths} months</p></div>
                    <div><p className="text-slate-500">Est. Monthly Payment</p><p className="font-bold text-blue-700">{fmtUSD(estMonthly)}</p></div>
                  </div>
                </div>
                <Button type="submit" disabled={submitLoan.isPending} className="w-full bg-blue-600 hover:bg-blue-700 h-11">
                  {submitLoan.isPending ? 'Submitting…' : 'Submit Application'}
                </Button>
                <p className="text-xs text-slate-500 text-center">Your application will be reviewed by our credit team. You will receive an email confirmation and a decision notification.</p>
              </form>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
