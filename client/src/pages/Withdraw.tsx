import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

export default function Withdraw() {
  const [, setLocation] = useLocation();
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !accountNumber) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Withdrawal request submitted! Pending approval.');
      setAmount('');
      setAccountNumber('');
      setTimeout(() => setLocation('/dashboard'), 2000);
    } catch (error) {
      toast.error('Withdrawal failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="outline" 
          onClick={() => setLocation('/dashboard')}
          className="mb-6"
        >
          ← Back to Dashboard
        </Button>

        <Card className="p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Withdraw Funds</h1>
          <p className="text-slate-600 mb-6">Withdraw money from your account</p>

          <form onSubmit={handleWithdraw} className="space-y-6">
            <div>
              <Label htmlFor="amount">Amount ($) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input
                id="accountNumber"
                placeholder="Your account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Status:</strong> Pending Approval
              </p>
            </div>

            <Button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? 'Processing...' : 'Submit Withdrawal'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
