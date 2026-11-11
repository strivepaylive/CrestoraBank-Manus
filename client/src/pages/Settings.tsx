import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { APP_LANGUAGES } from '@shared/languages';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { Loader2, ShieldCheck, FileCheck2, KeyRound, Upload, CheckCircle2, MonitorSmartphone, X, Globe } from 'lucide-react';

function fileToBase64(file: File): Promise<{ base64: string; fileName: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve({ base64: result.split(',')[1], fileName: file.name, mimeType: file.type });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function KycStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    not_submitted: { label: 'Not Submitted', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
    pending: { label: 'Under Review', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
    approved: { label: 'Verified', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-800 border-red-200' },
  };
  const s = map[status] || map.not_submitted;
  return <Badge variant="outline" className={s.cls}>{s.label}</Badge>;
}

export default function Settings() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const { data: settings, isLoading } = trpc.security.settings.useQuery(undefined, { retry: false });
  const { data: kycStatus } = trpc.kyc.status.useQuery(undefined, { retry: false });
  const { data: pinStatus } = trpc.account.pinStatus.useQuery(undefined, { retry: false });
  const { data: sessions } = trpc.security.sessions.useQuery(undefined, { retry: false });
  const revokeSession = trpc.security.revokeSession.useMutation({
    onSuccess: () => { toast.success('Device removed from your account.'); utils.security.sessions.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  // ---- Password ----
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const changePassword = trpc.security.changePassword.useMutation({
    onSuccess: () => {
      toast.success('Password changed successfully. A confirmation email has been sent.');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    },
    onError: (e) => toast.error(e.message),
  });

  // ---- Contact ----
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactPassword, setContactPassword] = useState('');
  const updateContact = trpc.security.updateContact.useMutation({
    onSuccess: () => {
      toast.success('Contact details updated.');
      setContactEmail(''); setContactPhone(''); setContactPassword('');
      utils.security.settings.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  // ---- 2FA ----
  const [twoFaPassword, setTwoFaPassword] = useState('');
  const [pendingToggle, setPendingToggle] = useState<boolean | null>(null);

  // ---- Language ----
  const [selectedLang, setSelectedLang] = useState<string>('');
  const updateLanguage = trpc.security.updateLanguage.useMutation({
    onSuccess: (d) => {
      const l = APP_LANGUAGES.find(x => x.code === d.language);
      toast.success(`Language updated to ${l ? l.nativeLabel : d.language}. All emails will now arrive in this language.`);
      utils.security.settings.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });
  const toggleTwoFactor = trpc.security.toggleTwoFactor.useMutation({
    onSuccess: (d) => {
      toast.success(`Two-factor authentication ${d.enabled ? 'enabled' : 'disabled'}.`);
      setTwoFaPassword(''); setPendingToggle(null);
      utils.security.settings.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  // ---- KYC ----
  const idRef = useRef<HTMLInputElement>(null);
  const addrRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [addrFile, setAddrFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const submitKyc = trpc.kyc.submit.useMutation({
    onSuccess: () => {
      toast.success('Documents submitted for review. You will be notified once verified.');
      setIdFile(null); setAddrFile(null); setSelfieFile(null);
      utils.kyc.status.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleKycSubmit = async () => {
    if (!idFile || !addrFile || !selfieFile) {
      toast.error('Please attach all three documents.');
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if ([idFile, addrFile, selfieFile].some(f => f.size > maxSize)) {
      toast.error('Each file must be under 5 MB.');
      return;
    }
    try {
      const [idDocument, proofOfAddress, selfie] = await Promise.all([
        fileToBase64(idFile), fileToBase64(addrFile), fileToBase64(selfieFile),
      ]);
      submitKyc.mutate({ idDocument, proofOfAddress, selfie });
    } catch {
      toast.error('Could not read the selected files.');
    }
  };

  // ---- PIN ----
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [pinResetPassword, setPinResetPassword] = useState('');
  const [pinMode, setPinMode] = useState<'change' | 'reset'>('change');
  const setPin = trpc.account.setPin.useMutation({
    onSuccess: () => {
      toast.success('Transfer PIN created. It will be required for all transfers.');
      setNewPin(''); setConfirmPin('');
      utils.account.pinStatus.invalidate(); utils.security.settings.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });
  const changePin = trpc.account.changePin.useMutation({
    onSuccess: () => {
      toast.success('Transfer PIN changed.');
      setNewPin(''); setConfirmPin(''); setCurrentPin('');
      utils.account.pinStatus.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });
  const resetPin = trpc.account.resetPin.useMutation({
    onSuccess: () => {
      toast.success('Transfer PIN reset after identity verification.');
      setNewPin(''); setConfirmPin(''); setPinResetPassword('');
      utils.account.pinStatus.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const validatePinPair = () => {
    if (!/^\d{4,6}$/.test(newPin)) { toast.error('PIN must be 4-6 digits.'); return false; }
    if (newPin !== confirmPin) { toast.error('PINs do not match.'); return false; }
    return true;
  };

  const kycLocked = kycStatus?.kycStatus === 'pending' || kycStatus?.kycStatus === 'approved';

  const fileButton = (label: string, file: File | null, ref: React.RefObject<HTMLInputElement | null>, setFile: (f: File | null) => void, hint: string) => (
    <div className="border rounded-xl p-4 bg-slate-50">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="font-medium text-slate-900 text-sm">{label}</p>
          <p className="text-xs text-slate-500">{hint}</p>
        </div>
        <div className="flex items-center gap-2">
          {file && <span className="text-xs text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />{file.name.slice(0, 24)}</span>}
          <Button type="button" size="sm" variant="outline" className="bg-white" disabled={kycLocked} onClick={() => ref.current?.click()}>
            <Upload className="w-3.5 h-3.5 mr-1.5" />{file ? 'Replace' : 'Attach'}
          </Button>
        </div>
      </div>
      <input type="file" accept="image/*,.pdf" ref={ref} className="hidden"
        onChange={(e) => setFile(e.target.files?.[0] || null)} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-3xl mx-auto">
        <Button variant="outline" onClick={() => setLocation('/dashboard')} className="mb-6 bg-white">
          ← Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold text-slate-900 mb-1">Settings</h1>
        <p className="text-slate-600 mb-6">Manage your security, identity verification, and transfer PIN</p>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : (
          <Tabs defaultValue="security">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full mb-6 h-auto gap-1 p-1">
              <TabsTrigger value="security" className="py-2.5 whitespace-nowrap"><ShieldCheck className="w-4 h-4 mr-1.5 shrink-0" />Security</TabsTrigger>
              <TabsTrigger value="kyc" className="py-2.5 whitespace-nowrap"><FileCheck2 className="w-4 h-4 mr-1.5 shrink-0" />Verification</TabsTrigger>
              <TabsTrigger value="pin" className="py-2.5 whitespace-nowrap"><KeyRound className="w-4 h-4 mr-1.5 shrink-0" />Transfer PIN</TabsTrigger>
              <TabsTrigger value="language" className="py-2.5 whitespace-nowrap"><Globe className="w-4 h-4 mr-1.5 shrink-0" />Language</TabsTrigger>
            </TabsList>

            {/* ---------------- LANGUAGE ---------------- */}
            <TabsContent value="language" className="space-y-6">
              <Card className="p-6 bg-white">
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Preferred Language</h2>
                <p className="text-sm text-slate-500 mb-4">
                  All emails from Crestora Bank — transaction receipts, security alerts, verification codes, and notifications — will be sent in your selected language.
                </p>
                <div className="space-y-4 max-w-sm">
                  <div>
                    <Label htmlFor="langSelect">Email Language</Label>
                    <Select
                      value={selectedLang || settings?.preferredLanguage || 'en'}
                      onValueChange={(v) => setSelectedLang(v)}
                    >
                      <SelectTrigger id="langSelect" className="bg-white">
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                      <SelectContent>
                        {APP_LANGUAGES.map(l => (
                          <SelectItem key={l.code} value={l.code}>
                            {l.nativeLabel} — {l.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={updateLanguage.isPending || !selectedLang || selectedLang === settings?.preferredLanguage}
                    onClick={() => updateLanguage.mutate({ language: selectedLang })}
                  >
                    {updateLanguage.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Save Language
                  </Button>
                  <p className="text-xs text-slate-400">
                    If a translation is unavailable for any message, we automatically fall back to English.
                  </p>
                </div>
              </Card>
            </TabsContent>

            {/* ---------------- SECURITY ---------------- */}
            <TabsContent value="security" className="space-y-6">
              <Card className="p-6 bg-white">
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Contact Details</h2>
                <p className="text-sm text-slate-500 mb-4">Current: {settings?.email || '—'}{settings?.phone ? ` · ${settings.phone}` : ''}</p>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="newEmail">New Email (optional)</Label>
                    <Input id="newEmail" type="email" placeholder="you@example.com" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="newPhone">New Phone (optional)</Label>
                    <Input id="newPhone" type="tel" placeholder="+1 555 000 0000" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="contactPassword">Confirm With Password *</Label>
                    <Input id="contactPassword" type="password" placeholder="Your account password" value={contactPassword} onChange={e => setContactPassword(e.target.value)} />
                  </div>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={updateContact.isPending}
                    onClick={() => {
                      if (!contactEmail && !contactPhone) { toast.error('Enter a new email or phone number.'); return; }
                      if (!contactPassword) { toast.error('Enter your password to confirm.'); return; }
                      updateContact.mutate({
                        password: contactPassword,
                        email: contactEmail || undefined,
                        phone: contactPhone || undefined,
                      });
                    }}
                  >
                    {updateContact.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Update Contact Details
                  </Button>
                </div>
              </Card>

              <Card className="p-6 bg-white">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Change Password</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password *</Label>
                    <Input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password * (min 8 characters)</Label>
                    <Input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                    <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                  </div>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={changePassword.isPending}
                    onClick={() => {
                      if (!currentPassword || !newPassword) { toast.error('Fill in all password fields.'); return; }
                      if (newPassword.length < 8) { toast.error('New password must be at least 8 characters.'); return; }
                      if (newPassword !== confirmPassword) { toast.error('New passwords do not match.'); return; }
                      changePassword.mutate({ currentPassword, newPassword });
                    }}
                  >
                    {changePassword.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Update Password
                  </Button>
                </div>
              </Card>

              <Card className="p-6 bg-white">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Two-Factor Authentication</h2>
                    <p className="text-sm text-slate-500">Adds an extra verification step for sensitive actions.</p>
                  </div>
                  <Switch
                    checked={pendingToggle ?? Boolean(settings?.twoFactorEnabled)}
                    onCheckedChange={(v) => setPendingToggle(v)}
                  />
                </div>
                {pendingToggle !== null && pendingToggle !== Boolean(settings?.twoFactorEnabled) && (
                  <div className="mt-4 flex items-end gap-3 flex-wrap">
                    <div className="grow max-w-xs">
                      <Label htmlFor="twoFaPassword">Confirm With Password *</Label>
                      <Input id="twoFaPassword" type="password" value={twoFaPassword} onChange={e => setTwoFaPassword(e.target.value)} />
                    </div>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={toggleTwoFactor.isPending}
                      onClick={() => {
                        if (!twoFaPassword) { toast.error('Enter your password to confirm.'); return; }
                        toggleTwoFactor.mutate({ enabled: pendingToggle, password: twoFaPassword });
                      }}
                    >
                      {toggleTwoFactor.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      {pendingToggle ? 'Enable 2FA' : 'Disable 2FA'}
                    </Button>
                    <Button variant="ghost" onClick={() => { setPendingToggle(null); setTwoFaPassword(''); }}>Cancel</Button>
                  </div>
                )}
              </Card>

              <Card className="p-6 bg-white">
                <div className="flex items-center gap-2 mb-1">
                  <MonitorSmartphone className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Devices & Sessions</h2>
                </div>
                <p className="text-sm text-slate-500 mb-4">Devices that have signed in to your account recently.</p>
                {!sessions || sessions.length === 0 ? (
                  <p className="text-sm text-slate-500">No recorded sign-ins yet. New sign-ins will appear here.</p>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((s) => (
                      <div key={s.id} className="flex items-center justify-between gap-3 border border-slate-200 rounded-lg p-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                            {s.deviceLabel}
                            {s.isCurrent && <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">This device</Badge>}
                          </p>
                          <p className="text-xs text-slate-500">
                            {s.ipAddress ? `IP ${s.ipAddress} · ` : ''}Last active {new Date(s.lastSeenAt).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                          disabled={revokeSession.isPending}
                          onClick={() => revokeSession.mutate({ sessionId: s.id })}
                        >
                          <X className="w-4 h-4 mr-1" /> Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* ---------------- KYC ---------------- */}
            <TabsContent value="kyc" className="space-y-6">
              <Card className="p-6 bg-white">
                <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                  <h2 className="text-lg font-semibold text-slate-900">Identity Verification (KYC)</h2>
                  <KycStatusBadge status={kycStatus?.kycStatus || 'not_submitted'} />
                </div>
                <p className="text-sm text-slate-500 mb-5">
                  Submit a government-issued ID, a proof of address, and a selfie holding your ID. Our team reviews submissions within 1–2 business days.
                </p>

                {kycStatus?.kycStatus === 'rejected' && kycStatus.rejectionReason && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    <strong>Reason for rejection:</strong> {kycStatus.rejectionReason}
                  </div>
                )}
                {kycStatus?.kycStatus === 'approved' && (
                  <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
                    Your identity has been verified. No further action is required.
                  </div>
                )}
                {kycStatus?.kycStatus === 'pending' && (
                  <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                    Your documents are under review. We will notify you by email once the review is complete.
                  </div>
                )}

                <div className="space-y-3">
                  {fileButton('Government-Issued ID', idFile, idRef, setIdFile, 'Passport, driver\u2019s license, or national ID')}
                  {fileButton('Proof of Address', addrFile, addrRef, setAddrFile, 'Utility bill or bank statement (last 3 months)')}
                  {fileButton('Selfie With ID', selfieFile, selfieRef, setSelfieFile, 'A clear photo of you holding your ID')}
                </div>

                {!kycLocked && (
                  <Button
                    className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={submitKyc.isPending}
                    onClick={handleKycSubmit}
                  >
                    {submitKyc.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    {submitKyc.isPending ? 'Uploading Documents…' : 'Submit For Verification'}
                  </Button>
                )}
              </Card>
            </TabsContent>

            {/* ---------------- PIN ---------------- */}
            <TabsContent value="pin" className="space-y-6">
              <Card className="p-6 bg-white">
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Transfer PIN</h2>
                <p className="text-sm text-slate-500 mb-5">
                  {pinStatus?.hasPin
                    ? 'A transfer PIN is set on your account. It is required to authorize every transfer.'
                    : 'Create a 4–6 digit PIN. It will be required to authorize every transfer you make.'}
                </p>

                {!pinStatus?.hasPin ? (
                  <div className="space-y-4 max-w-sm">
                    <div>
                      <Label htmlFor="newPin">New PIN (4–6 digits) *</Label>
                      <Input id="newPin" type="password" inputMode="numeric" maxLength={6} value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))} />
                    </div>
                    <div>
                      <Label htmlFor="confirmPin">Confirm PIN *</Label>
                      <Input id="confirmPin" type="password" inputMode="numeric" maxLength={6} value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))} />
                    </div>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                      disabled={setPin.isPending}
                      onClick={() => { if (validatePinPair()) setPin.mutate({ pin: newPin }); }}
                    >
                      {setPin.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <KeyRound className="w-4 h-4 mr-2" />}
                      Create Transfer PIN
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-sm">
                    <div className="flex gap-2">
                      <Button size="sm" variant={pinMode === 'change' ? 'default' : 'outline'} className={pinMode === 'change' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-white'} onClick={() => setPinMode('change')}>Change PIN</Button>
                      <Button size="sm" variant={pinMode === 'reset' ? 'default' : 'outline'} className={pinMode === 'reset' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-white'} onClick={() => setPinMode('reset')}>Forgot PIN</Button>
                    </div>
                    {pinMode === 'change' ? (
                      <div>
                        <Label htmlFor="currentPin">Current PIN *</Label>
                        <Input id="currentPin" type="password" inputMode="numeric" maxLength={6} value={currentPin} onChange={e => setCurrentPin(e.target.value.replace(/\D/g, ''))} />
                      </div>
                    ) : (
                      <div>
                        <Label htmlFor="pinResetPassword">Account Password *</Label>
                        <Input id="pinResetPassword" type="password" value={pinResetPassword} onChange={e => setPinResetPassword(e.target.value)} />
                      </div>
                    )}
                    <div>
                      <Label htmlFor="newPin2">New PIN (4–6 digits) *</Label>
                      <Input id="newPin2" type="password" inputMode="numeric" maxLength={6} value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))} />
                    </div>
                    <div>
                      <Label htmlFor="confirmPin2">Confirm New PIN *</Label>
                      <Input id="confirmPin2" type="password" inputMode="numeric" maxLength={6} value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))} />
                    </div>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                      disabled={changePin.isPending || resetPin.isPending}
                      onClick={() => {
                        if (!validatePinPair()) return;
                        if (pinMode === 'change') {
                          if (!currentPin) { toast.error('Enter your current PIN.'); return; }
                          changePin.mutate({ currentPin, newPin });
                        } else {
                          if (!pinResetPassword) { toast.error('Enter your account password.'); return; }
                          resetPin.mutate({ password: pinResetPassword, newPin });
                        }
                      }}
                    >
                      {(changePin.isPending || resetPin.isPending) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <KeyRound className="w-4 h-4 mr-2" />}
                      {pinMode === 'change' ? 'Change PIN' : 'Reset PIN'}
                    </Button>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
