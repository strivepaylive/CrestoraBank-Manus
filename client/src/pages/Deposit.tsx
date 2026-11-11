import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/_core/hooks/useAuth';
import { QRCodeSVG } from 'qrcode.react';

export default function Deposit() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'debit_card' | 'credit_card' | 'bank_transfer' | 'crypto' | 'skrill'>('bank_transfer');
  const [cryptoAsset, setCryptoAsset] = useState('BTC');
  
  // Card details
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardErrors, setCardErrors] = useState<{ name?: string; number?: string; expiry?: string; cvv?: string }>({});
  const [step, setStep] = useState<1 | 2>(1);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofUrl, setProofUrl] = useState<string>('');

  const [isProcessing, setIsProcessing] = useState(false);
  
  const createDeposit = trpc.deposit.create.useMutation();

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount) {
      toast.error('Please enter an amount');
      return;
    }
    
    if (step === 1) {
      setStep(2);
      return;
    }

    if (method === 'debit_card' || method === 'credit_card') {
      const errors: { name?: string; number?: string; expiry?: string; cvv?: string } = {};
      
      if (!cardholderName.trim()) {
        errors.name = 'Cardholder name is required';
      } else if (cardholderName.trim().length < 3) {
        errors.name = 'Name must be at least 3 characters';
      }
      
      const cleanNumber = cardNumber.replace(/\s/g, '');
      if (!cleanNumber) {
        errors.number = 'Card number is required';
      } else if (!/^\d{13,19}$/.test(cleanNumber)) {
        errors.number = 'Invalid card number format';
      } else {
        // Luhn algorithm check
        let sum = 0;
        let isEven = false;
        for (let i = cleanNumber.length - 1; i >= 0; i--) {
          let digit = parseInt(cleanNumber.charAt(i), 10);
          if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
          }
          sum += digit;
          isEven = !isEven;
        }
        if (sum % 10 !== 0) {
          errors.number = 'Invalid card number';
        }
      }
      
      if (!cardExpiry) {
        errors.expiry = 'Expiry date is required';
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
        errors.expiry = 'Format must be MM/YY';
      } else {
        const [month, year] = cardExpiry.split('/');
        const expiryDate = new Date(2000 + parseInt(year, 10), parseInt(month, 10) - 1);
        const today = new Date();
        today.setDate(1); // Set to first of month for fair comparison
        today.setHours(0, 0, 0, 0);
        if (expiryDate < today) {
          errors.expiry = 'Card has expired';
        }
      }
      
      if (!cardCvv) {
        errors.cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(cardCvv)) {
        errors.cvv = 'CVV must be 3 or 4 digits';
      }
      
      if (Object.keys(errors).length > 0) {
        setCardErrors(errors);
        return;
      }
      setCardErrors({});
    }

    if ((method === 'bank_transfer' || method === 'crypto' || method === 'skrill') && !proofUrl) {
      toast.error('Please upload proof of payment');
      return;
    }

    setIsProcessing(true);
    
    try {
      let finalProofUrl = proofUrl;
      
      if (proofFile && !finalProofUrl) {
        setUploadingProof(true);
        const formData = new FormData();
        formData.append('file', proofFile);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalProofUrl = uploadData.url;
        } else {
          toast.error('Failed to upload proof of payment. Proceeding without it.');
        }
        setUploadingProof(false);
      }

      const result = await createDeposit.mutateAsync({
        method,
        amount: parseFloat(amount),
        currency: 'USD',
        cryptoAsset: method === 'crypto' ? cryptoAsset : undefined,
        cardholderName: (method === 'debit_card' || method === 'credit_card') ? cardholderName : undefined,
        cardNumber: (method === 'debit_card' || method === 'credit_card') ? cardNumber : undefined,
        cardExpiry: (method === 'debit_card' || method === 'credit_card') ? cardExpiry : undefined,
        cardCvv: (method === 'debit_card' || method === 'credit_card') ? cardCvv : undefined,
        proofUrl: finalProofUrl || undefined,
      });
      
      toast.success(`Deposit request created! Reference: ${result.reference}`);
      setAmount('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      setProofFile(null);
      
      // If bank transfer, crypto, or skrill, they need to upload proof
      setTimeout(() => setLocation('/dashboard'), 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Deposit failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setProofFile(file);
    setUploadingProof(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) throw new Error('Upload failed');
      
      const data = await res.json();
      setProofUrl(data.url);
      toast.success('Proof of payment uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload proof of payment. Please try again.');
    } finally {
      setUploadingProof(false);
    }
  };

  const cryptoWallets: Record<string, { address: string; network: string }> = {
    'BTC': { address: 'bc1qlrax4jyk833kzlf2ps0rmwy474uufkc78srnxh', network: 'Bitcoin Network' },
    'ETH': { address: '0x3357Fe76C2f07a8b98B838E223a5920Ad1581dE2', network: 'ERC-20' },
    'USDT_ERC20': { address: '0x3357Fe76C2f07a8b98B838E223a5920Ad1581dE2', network: 'ERC-20' },
    'USDT_TRC20': { address: 'TJXHFF5JREQDAxQ28pnYW1V7xPjA4Pv4T2', network: 'TRC-20' },
    'DOGE': { address: 'DJjT1i5zaY95ueU2Afj5oJLDRL7waVWvUR', network: 'Dogecoin Network' }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Deposit Funds</h1>
          <p className="text-slate-600 mb-6">Add money to your account</p>

          <form onSubmit={handleDeposit} className="space-y-6">
            {step === 1 ? (
              <>
                <div>
                  <Label htmlFor="amount">Amount ($) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Continue to Funding Method
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800">Deposit Amount: ${parseFloat(amount).toFixed(2)}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setStep(1)} type="button">
                    Change Amount
                  </Button>
                </div>
                <div>
                  <Label className="mb-3 block">Funding Method *</Label>
                  <Select value={method} onValueChange={(v: any) => setMethod(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer / ACH / Wire</SelectItem>
                      <SelectItem value="debit_card">Debit Card</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                      <SelectItem value="skrill">Skrill</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {method === 'crypto' && (
                  <div>
                    <Label className="mb-3 block">Select Cryptocurrency</Label>
                    <Select value={cryptoAsset} onValueChange={setCryptoAsset}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an asset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                        <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                        <SelectItem value="USDT_ERC20">Tether (USDT) - ERC20</SelectItem>
                        <SelectItem value="USDT_TRC20">Tether (USDT) - TRC20</SelectItem>
                        <SelectItem value="DOGE">Dogecoin (DOGE)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {method === 'crypto' && cryptoAsset && cryptoWallets[cryptoAsset] && (
                  <div className="mt-6 p-6 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <h4 className="font-semibold text-slate-800 mb-2">Send {cryptoAsset.split('_')[0]} to this address</h4>
                    <p className="text-sm text-slate-500 mb-4">Network: <span className="font-medium text-slate-700">{cryptoWallets[cryptoAsset].network}</span></p>
                    
                    <div className="flex justify-center mb-4 bg-white p-4 inline-block rounded-lg shadow-sm">
                      <QRCodeSVG value={cryptoWallets[cryptoAsset].address} size={160} />
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-slate-200 flex items-center justify-between mb-4">
                      <code className="text-xs text-slate-700 break-all">{cryptoWallets[cryptoAsset].address}</code>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-2 h-8 px-2"
                        onClick={() => {
                          navigator.clipboard.writeText(cryptoWallets[cryptoAsset].address);
                          toast.success('Address copied to clipboard');
                        }}
                        type="button"
                      >
                        Copy
                      </Button>
                    </div>
                    
                    <div className="text-left text-sm text-slate-600 bg-blue-50 p-3 rounded-md border border-blue-100">
                      <p className="font-medium text-blue-800 mb-1">Important Instructions:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Send exactly <strong>${parseFloat(amount).toFixed(2)}</strong> worth of {cryptoAsset.split('_')[0]}.</li>
                        <li>Only send via the <strong>{cryptoWallets[cryptoAsset].network}</strong> network.</li>
                        <li>After sending, upload a screenshot of the transaction confirmation below.</li>
                      </ul>
                    </div>
                  </div>
                )}
                {(method === 'debit_card' || method === 'credit_card') && (
                  <div className="space-y-4 border-t pt-4 mt-4">
                    <h3 className="font-semibold text-slate-800">Card Details</h3>
                    <p className="text-sm text-slate-500 mb-4">Your card details will be securely reviewed by our team.</p>
                    <div>
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <Input
                        id="cardName"
                        placeholder="John Doe"
                        value={cardholderName}
                        onChange={(e) => {
                          setCardholderName(e.target.value);
                          if (cardErrors.name) setCardErrors({ ...cardErrors, name: undefined });
                        }}
                        className={cardErrors.name ? 'border-red-500' : ''}
                      />
                      {cardErrors.name && <p className="text-red-500 text-xs mt-1">{cardErrors.name}</p>}
                    </div>
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={(e) => {
                          // Auto-format with spaces
                          const val = e.target.value.replace(/\D/g, '');
                          const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
                          setCardNumber(formatted);
                          if (cardErrors.number) setCardErrors({ ...cardErrors, number: undefined });
                        }}
                        maxLength={23} // 19 digits + 4 spaces
                        className={cardErrors.number ? 'border-red-500' : ''}
                      />
                      {cardErrors.number && <p className="text-red-500 text-xs mt-1">{cardErrors.number}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cardExpiry">Expiry Date (MM/YY)</Label>
                        <Input
                          id="cardExpiry"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => {
                            // Auto-format with slash
                            let val = e.target.value.replace(/\D/g, '');
                            if (val.length > 2) {
                              val = val.slice(0, 2) + '/' + val.slice(2, 4);
                            }
                            setCardExpiry(val);
                            if (cardErrors.expiry) setCardErrors({ ...cardErrors, expiry: undefined });
                          }}
                          maxLength={5}
                          className={cardErrors.expiry ? 'border-red-500' : ''}
                        />
                        {cardErrors.expiry && <p className="text-red-500 text-xs mt-1">{cardErrors.expiry}</p>}
                      </div>
                      <div>
                        <Label htmlFor="cardCvv">CVV</Label>
                        <Input
                          id="cardCvv"
                          placeholder="123"
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => {
                            setCardCvv(e.target.value.replace(/\D/g, ''));
                            if (cardErrors.cvv) setCardErrors({ ...cardErrors, cvv: undefined });
                          }}
                          className={cardErrors.cvv ? 'border-red-500' : ''}
                        />
                        {cardErrors.cvv && <p className="text-red-500 text-xs mt-1">{cardErrors.cvv}</p>}
                      </div>
                    </div>
                  </div>
                )}
                {(method === 'bank_transfer' || method === 'crypto' || method === 'skrill') && (
                  <div className="space-y-4 border-t pt-4 mt-4">
                    {method === 'bank_transfer' && (
                      <>
                        <h3 className="font-semibold text-slate-800">Bank Transfer Instructions</h3>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-800 space-y-2">
                          <p><span className="font-semibold">Bank Name:</span> Crestora Bank</p>
                          <p><span className="font-semibold">Account Name:</span> {user?.name || 'Crestora Financial Services'}</p>
                          <p><span className="font-semibold">Account Number:</span> {user?.id ? `884920${user.id.toString().padStart(4, '0')}` : '8849201193'}</p>
                          <p><span className="font-semibold">Routing Number:</span> 098765432</p>
                          <p><span className="font-semibold">SWIFT/BIC:</span> CRSTUS33</p>
                          <p><span className="font-semibold">Bank Address:</span> 120 Wall Street, New York, NY 10005, United States</p>
                          <div className="mt-4 pt-4 border-t border-slate-200">
                            <p className="font-semibold text-blue-700">Important:</p>
                            <p>Please include your name in the transfer reference/memo.</p>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {method === 'skrill' && (
                      <div className="mt-6 p-6 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-purple-600 font-bold text-xl">S</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800">Skrill Transfer</h4>
                            <p className="text-sm text-slate-500">International Payments Team</p>
                          </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded border border-slate-200 mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-slate-500">Send to Email:</span>
                            <span className="font-medium text-slate-800">ovienfx@gmail.com</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">Amount:</span>
                            <span className="font-medium text-slate-800">${parseFloat(amount).toFixed(2)} USD</span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-slate-600 bg-blue-50 p-3 rounded-md border border-blue-100">
                          <p className="font-medium text-blue-800 mb-1">Instructions:</p>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Log in to your Skrill account and send the exact amount to the email above.</li>
                            <li>Include your name in the transfer note.</li>
                            <li>Take a screenshot of the successful transfer and upload it below.</li>
                          </ul>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="proofFile">Upload Proof of Payment {method === 'bank_transfer' ? '*' : ''}</Label>
                      <Input
                        id="proofFile"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="mt-1"
                      />
                      {uploadingProof && <p className="text-xs text-blue-500 mt-1">Uploading...</p>}
                      {proofUrl && <p className="text-xs text-green-600 mt-1">Proof uploaded successfully.</p>}
                      <p className="text-xs text-slate-500 mt-1">Accepted formats: JPG, PNG, PDF. Max size: 5MB.</p>
                    </div>
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={isProcessing || uploadingProof}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing || uploadingProof ? 'Processing...' : 'Submit Deposit'}
                </Button>
              </>
            )}
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
