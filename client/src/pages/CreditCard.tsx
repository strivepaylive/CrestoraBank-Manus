import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

export default function CreditCard() {
  const [, setLocation] = useLocation();
  const [cardType, setCardType] = useState('standard');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Credit card application submitted! Review pending.');
      setTimeout(() => setLocation('/dashboard'), 2000);
    } catch (error) {
      toast.error('Application failed. Please try again.');
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Apply for Credit Card</h1>
          <p className="text-slate-600 mb-6">Choose your card type and apply</p>

          <form onSubmit={handleApply} className="space-y-6">
            <div>
              <Label className="mb-3 block">Card Type</Label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    value="standard"
                    checked={cardType === 'standard'}
                    onChange={(e) => setCardType(e.target.value)}
                  />
                  <div>
                    <p className="font-semibold">Standard Card</p>
                    <p className="text-sm text-slate-600">Annual Fee: $0</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    value="premium"
                    checked={cardType === 'premium'}
                    onChange={(e) => setCardType(e.target.value)}
                  />
                  <div>
                    <p className="font-semibold">Premium Card</p>
                    <p className="text-sm text-slate-600">Annual Fee: $99</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Status:</strong> Application Review Pending
              </p>
            </div>

            <Button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? 'Processing...' : 'Submit Application'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
