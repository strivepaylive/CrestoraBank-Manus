import { useState } from 'react';
import BrandLogo from '@/components/BrandLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

type RegistrationStep = 'personal' | 'contact' | 'security' | 'otp' | 'complete';

export default function Register() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<RegistrationStep>('personal');
  const [registrationId, setRegistrationId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    username: '',
    contactMethod: 'email' as 'email' | 'phone',
    email: '',
    phone: '',
    nationality: '',
    dateOfBirth: '',
    address: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });

  const startRegistration = trpc.registration.startRegistration.useMutation();
  const submitContact = trpc.registration.submitContactDetails.useMutation();
  const verifyOTP = trpc.registration.verifyOTP.useMutation();
  const completeReg = trpc.registration.completeRegistration.useMutation();
  const resendOTP = trpc.registration.resendOTP.useMutation();
  const createSupport = trpc.support.create.useMutation();
  const [otpResendTimer, setOtpResendTimer] = useState(0);

  const handlePersonalInfo = async () => {
    if (!formData.firstName || !formData.lastName || !formData.username) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const result = await startRegistration.mutateAsync({
        firstName: formData.firstName,
        middleName: formData.middleName || undefined,
        lastName: formData.lastName,
        username: formData.username,
        browserLanguage: typeof navigator !== 'undefined' ? navigator.language : undefined,
      });
      setRegistrationId(result.registrationId);
      setStep('contact');
      toast.success('Personal info saved');
    } catch (error) {
      toast.error('Failed to save personal info');
    }
  };

  const handleContactDetails = async () => {
    if (formData.contactMethod === 'email' && !formData.email) {
      toast.error('Please enter your email');
      return;
    }
    if (!formData.phone) {
      toast.error('Please enter your phone number');
      return;
    }
    if (!formData.nationality) {
      toast.error('Please enter your nationality');
      return;
    }
    if (!formData.dateOfBirth) {
      toast.error('Please enter your date of birth');
      return;
    }
    if (!formData.address) {
      toast.error('Please enter your residential address');
      return;
    }

    if (!registrationId) return;

    try {
      await submitContact.mutateAsync({
        registrationId,
        contactMethod: formData.contactMethod,
        email: formData.email || undefined,
        phone: formData.phone,
        nationality: formData.nationality,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
      });
      setStep('otp');
      toast.success(`OTP sent to your ${formData.contactMethod}`);
    } catch (error) {
      toast.error('Failed to send OTP');
    }
  };

  const handleOTPVerification = async () => {
    if (!formData.otp) {
      toast.error('Please enter the OTP code');
      return;
    }

    if (!registrationId) return;

    try {
      await verifyOTP.mutateAsync({
        registrationId,
        code: formData.otp,
      });
      setStep('security');
      toast.success('OTP verified successfully');
    } catch (error) {
      toast.error('Invalid OTP code');
    }
  };

  const handleSecuritySetup = async () => {
    if (!formData.password || formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!registrationId) return;

    try {
      await completeReg.mutateAsync({
        registrationId,
        password: formData.password,
      });
      setStep('complete');
    } catch (error) {
      toast.error('Failed to complete registration');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <a href="/" className="inline-block mb-3">
              <div className="flex justify-center"><BrandLogo size="lg" /></div>
            </a>
            <p className="text-slate-600">Create Your Account</p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-between mb-8">
            {(['personal', 'contact', 'otp', 'security'] as const).map((s, idx) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full mx-1 ${
                  ['personal', 'contact', 'otp', 'security'].indexOf(step) >= idx
                    ? 'bg-blue-600'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          {/* Step 1: Personal Information */}
          {step === 'personal' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  placeholder="David"
                  value={formData.middleName}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Smith"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  placeholder="johnsmith123"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              <Button
                onClick={handlePersonalInfo}
                disabled={startRegistration.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {startRegistration.isPending ? 'Saving...' : 'Next'}
              </Button>
            </div>
          )}

          {/* Step 2: Contact Details */}
          {step === 'contact' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <p className="text-xs text-slate-500 mt-1">Include your country code, e.g. +1</p>
              </div>

              <div>
                <Label htmlFor="nationality">Nationality *</Label>
                <Input
                  id="nationality"
                  placeholder="e.g. American"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="address">Residential Address *</Label>
                <Input
                  id="address"
                  placeholder="123 Main Street, City, State, Country"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('personal')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleContactDetails}
                  disabled={submitContact.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {submitContact.isPending ? 'Sending...' : 'Send OTP'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: OTP Verification */}
          {step === 'otp' && (
            <div className="space-y-4">
              <div>
                <Label>Enter Verification Code *</Label>
                <p className="text-sm text-slate-600 mb-3">
                  We sent a code to your {formData.contactMethod}
                </p>
                <Input
                  placeholder="000000"
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                  maxLength={6}
                />
              </div>

              <div className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    if (!registrationId) return;
                    try {
                      await resendOTP.mutateAsync({ registrationId });
                      toast.success('OTP resent successfully');
                      setOtpResendTimer(60);
                      const timer = setInterval(() => {
                        setOtpResendTimer(prev => {
                          if (prev <= 1) {
                            clearInterval(timer);
                            return 0;
                          }
                          return prev - 1;
                        });
                      }, 1000);
                    } catch (error) {
                      toast.error('Failed to resend OTP');
                    }
                  }}
                  disabled={otpResendTimer > 0 || resendOTP.isPending}
                >
                  {otpResendTimer > 0 ? `Resend in ${otpResendTimer}s` : 'Resend OTP'}
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('contact')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleOTPVerification}
                  disabled={verifyOTP.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {verifyOTP.isPending ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Security Setup */}
          {step === 'security' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <p className="text-xs text-slate-600 mt-1">Minimum 8 characters</p>
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('otp')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSecuritySetup}
                  disabled={completeReg.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {completeReg.isPending ? 'Creating...' : 'Create Account'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Complete */}
          {step === 'complete' && (
            <div className="text-center space-y-4">
              <div className="text-5xl mb-4">✓</div>
              <h2 className="text-2xl font-bold text-slate-900">Registration Complete!</h2>
              <p className="text-slate-600">
                Your account has been created successfully!
              </p>
              <p className="text-sm text-slate-500">
                Please wait for bank approval within 15 minutes to a few hours. We have sent you a message on your email. Once your account is approved, you'll receive a notification and can log in.
              </p>
              <Button
                onClick={() => setLocation('/')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Go to Login
              </Button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold" target="_blank">
              Sign In
            </a>
            <div className="pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500">
              <p>Crestora Bank Headquarters</p>
              <p>120 Wall Street, New York, NY 10005, United States</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
