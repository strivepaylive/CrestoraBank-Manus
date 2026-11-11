import { useState, useEffect } from 'react';
import BrandLogo from '@/components/BrandLogo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { LogOut, Users, DollarSign, Eye, FileText, Bell, Send, Search, Mail, ShieldAlert, KeyRound, Landmark } from 'lucide-react';

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fundAmount, setFundAmount] = useState('');
  const [fundSenderName, setFundSenderName] = useState('');
  const [fundUserId, setFundUserId] = useState<number | null>(null);
  const [isFunding, setIsFunding] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonateUserId, setImpersonateUserId] = useState<number | null>(null);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [transfersLoading, setTransfersLoading] = useState(false);
  const [updatingTxId, setUpdatingTxId] = useState<number | null>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [updatingCardId, setUpdatingCardId] = useState<number | null>(null);
  const [updatingKycId, setUpdatingKycId] = useState<number | null>(null);
  const [kycViewerDoc, setKycViewerDoc] = useState<{ url: string; label: string; customer: string } | null>(null);
  const [kycDocDownloading, setKycDocDownloading] = useState(false);
  const [kycDocLoadError, setKycDocLoadError] = useState(false);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [depositsLoading, setDepositsLoading] = useState(false);
  const [updatingDepositId, setUpdatingDepositId] = useState<number | null>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [loansLoading, setLoansLoading] = useState(false);
  const [updatingLoanId, setUpdatingLoanId] = useState<number | null>(null);
  const [loanDecisionDialog, setLoanDecisionDialog] = useState<{ loan: any; action: 'approve' | 'decline' } | null>(null);
  const [loanAdminMessage, setLoanAdminMessage] = useState('');
  const [txMessageDialog, setTxMessageDialog] = useState<{ tx: any; status: string } | null>(null);
  const [txCustomMessage, setTxCustomMessage] = useState('');
  const [holdDialogTx, setHoldDialogTx] = useState<any>(null);
  const [holdReasonPreset, setHoldReasonPreset] = useState('compliance');
  const [holdReasonCustom, setHoldReasonCustom] = useState('');
  const [holdEta, setHoldEta] = useState('24-48 hours');
  const [holdActionRequired, setHoldActionRequired] = useState(false);
  const [codesDialogReg, setCodesDialogReg] = useState<any>(null);
  const [codesVat, setCodesVat] = useState('');
  const [codesImf, setCodesImf] = useState('');
  const [isSavingCodes, setIsSavingCodes] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isDeletingUsers, setIsDeletingUsers] = useState(false);
  // Email Center state
  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [emailHistory, setEmailHistory] = useState<any[]>([]);
  const [emailHistoryLoading, setEmailHistoryLoading] = useState(false);
  const [emailSearch, setEmailSearch] = useState('');
  const [emailRecipient, setEmailRecipient] = useState<any | null>(null);
  const [emailTemplate, setEmailTemplate] = useState('custom');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailHeadline, setEmailHeadline] = useState('Crestora Bank');
  const [emailBody, setEmailBody] = useState('');
  const [emailPreview, setEmailPreview] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Check admin session on mount
  useEffect(() => {
    const adminSession = localStorage.getItem('admin_session');
    if (!adminSession) {
      window.location.href = '/admin-login';
      return;
    }
    
    try {
      const session = JSON.parse(adminSession);
      if (!session.authenticated) {
        window.location.href = '/admin-login';
        return;
      }
    } catch (error) {
      window.location.href = '/admin-login';
      return;
    }
    
    loadRegistrations();
    loadTransfers();
    loadCards();
    loadDeposits();
    loadLoans();
    loadEmailTemplates();
    loadEmailHistory();
    loadInvoices();
  }, []);

  const adminHeaders = () => ({
    'Content-Type': 'application/json',
    'x-admin-session': localStorage.getItem('admin_session') || '',
  });

  // ===== Invoices state =====
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [isCashAppInvoiceOpen, setIsCashAppInvoiceOpen] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [invForm, setInvForm] = useState({
    clientName: '', clientEmail: '', accountNumber: '', bankName: '',
    amount: '', currency: 'USD', description: '', dueDate: '',
    customMessage: '', topLogoUrl: '', bottomLogoUrl: '',
    feeAmount: '', remainingBalance: '', bottomCaption: '',
    senderName: '', invoiceType: 'due', invoiceTemplate: 'escrow', cashtag: '', avatarUrl: '', stampText: '', paymentMethod: '', txStatus: '',
  });
  const [uploadingLogo, setUploadingLogo] = useState<'top' | 'bottom' | null>(null);
  const handleLogoUpload = async (which: 'top' | 'bottom', file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    setUploadingLogo(which);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const response = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await response.json();
      if (data.success && data.url) {
        setInvForm((f) => which === 'top' ? { ...f, topLogoUrl: data.url } : { ...f, bottomLogoUrl: data.url });
        toast.success(`${which === 'top' ? 'Top' : 'Bottom'} logo uploaded`);
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingLogo(null);
    }
  };

  const loadInvoices = async () => {
    setInvoicesLoading(true);
    try {
      const response = await fetch('/api/admin/invoices', { headers: adminHeaders() });
      const data = await response.json();
      if (data.success) setInvoices(data.data || []);
    } catch (e) {
      console.error('Failed to load invoices', e);
    } finally {
      setInvoicesLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!invForm.clientName || !invForm.clientEmail || !invForm.accountNumber || !invForm.bankName || !invForm.amount || !invForm.description || !invForm.dueDate) {
      toast.error('Please fill in all required fields before previewing');
      return;
    }
    try {
      setIsCreatingInvoice(true);
      const res = await fetch('/api/admin/invoices/create-and-send', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({ ...invForm, previewOnly: true })
      });
      const data = await res.json();
      if (data.success && data.pdfUrl) {
        setPreviewUrl(data.pdfUrl);
        window.open(data.pdfUrl, '_blank');
      } else toast.error(data.message || data.error || 'Preview failed');
    } catch (err) {
      toast.error('Preview failed');
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!invForm.clientName || !invForm.clientEmail || !invForm.accountNumber || !invForm.bankName || !invForm.amount || !invForm.description || !invForm.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    const amt = parseFloat(invForm.amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setIsCreatingInvoice(true);
    try {
      const response = await fetch('/api/admin/invoices/create-and-send', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({
          clientName: invForm.clientName,
          clientEmail: invForm.clientEmail,
          accountNumber: invForm.accountNumber,
          bankName: invForm.bankName,
          amount: amt.toFixed(2),
          currency: invForm.currency || 'USD',
          description: invForm.description,
          dueDate: invForm.dueDate,
          customMessage: invForm.customMessage || undefined,
          topLogoUrl: invForm.topLogoUrl || undefined,
          bottomLogoUrl: invForm.bottomLogoUrl || undefined,
          feeAmount: invForm.feeAmount || undefined,
          remainingBalance: invForm.remainingBalance || undefined,
          bottomCaption: invForm.bottomCaption || undefined,
          senderName: invForm.senderName || undefined,
          invoiceType: invForm.invoiceType || 'due',
          invoiceTemplate: invForm.invoiceTemplate || 'escrow',
          cashtag: invForm.cashtag || '',
          avatarUrl: invForm.avatarUrl || '',
                    stampText: invForm.stampText || '',
                    paymentMethod: invForm.paymentMethod || '',
                    txStatus: invForm.txStatus || '',
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Invoice ${data.reference} generated and sent`, {
          action: {
            label: 'Download PDF',
            onClick: () => window.open(data.pdfUrl, '_blank')
          },
          duration: 10000,
        });
        setIsCreateInvoiceOpen(false);
        setInvForm({ clientName: '', clientEmail: '', accountNumber: '', bankName: '', amount: '', currency: 'USD', description: '', dueDate: '', customMessage: '', topLogoUrl: '', bottomLogoUrl: '', feeAmount: '', remainingBalance: '', bottomCaption: '', senderName: '', invoiceType: 'due', invoiceTemplate: 'escrow', cashtag: '', avatarUrl: '', stampText: '', paymentMethod: '', txStatus: '' });
        loadInvoices();
      } else {
        toast.error(data.message || 'Failed to create invoice');
      }
    } catch (e) {
      toast.error('Failed to create invoice');
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  const handleUpdateInvoiceStatus = async (id: number, status: string) => {
    try {
      const response = await fetch('/api/admin/invoices/update-status', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({ id, status }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Invoice status updated');
        loadInvoices();
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (e) {
      toast.error('Failed to update status');
    }
  };
  const loadEmailTemplates = async () => {
    try {
      const response = await fetch('/api/admin/email-templates', { headers: adminHeaders() });
      const data = await response.json();
      if (data.success) setEmailTemplates(data.data);
    } catch (error) {
      console.error('Error loading email templates:', error);
    }
  };

  const loadEmailHistory = async () => {
    try {
      setEmailHistoryLoading(true);
      const response = await fetch('/api/admin/email-history', { headers: adminHeaders() });
      const data = await response.json();
      if (data.success) setEmailHistory(data.data);
    } catch (error) {
      console.error('Error loading email history:', error);
    } finally {
      setEmailHistoryLoading(false);
    }
  };

  const applyTemplate = (templateId: string) => {
    setEmailTemplate(templateId);
    if (templateId === 'custom') {
      setEmailSubject('');
      setEmailHeadline('Crestora Bank');
      setEmailBody('');
      return;
    }
    const t = emailTemplates.find((x) => x.id === templateId);
    if (t) {
      setEmailSubject(t.subject);
      setEmailHeadline(t.headline);
      setEmailBody(t.body);
    }
  };

  const renderedEmailBody = () => {
    const firstName = emailRecipient?.firstName || 'Customer';
    const fullName = [emailRecipient?.firstName, emailRecipient?.lastName].filter(Boolean).join(' ') || 'Customer';
    return emailBody
      .replaceAll('{{firstName}}', firstName)
      .replaceAll('{{fullName}}', fullName)
      .replaceAll('{{accountNumber}}', emailRecipient?.accountNumber || '');
  };

  const handleSendEmail = async () => {
    if (!emailRecipient?.email) {
      toast.error('Select a customer with an email address');
      return;
    }
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error('Subject and message are required');
      return;
    }
    try {
      setIsSendingEmail(true);
      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({
          registrationId: emailRecipient.id,
          recipientEmail: emailRecipient.email,
          recipientName: `${emailRecipient.firstName || ''} ${emailRecipient.lastName || ''}`.trim(),
          subject: emailSubject,
          headline: emailHeadline,
          body: renderedEmailBody(),
          template: emailTemplate,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Email sent successfully');
        setEmailPreview(false);
        setEmailBody('');
        setEmailSubject('');
        setEmailTemplate('custom');
        loadEmailHistory();
      } else {
        toast.error(data.message || 'Failed to send email');
        loadEmailHistory();
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const loadRegistrations = async () => {
    try {
      setIsLoading(true);
      const adminSession = localStorage.getItem('admin_session');
      const response = await fetch('/api/admin/registrations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-session': adminSession || '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setRegistrations(data.data);
        }
      } else {
        toast.error('Failed to load registrations');
      }
    } catch (error) {
      console.error('Error loading registrations:', error);
      toast.error('Failed to load registrations');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTransfers = async () => {
    try {
      setTransfersLoading(true);
      const adminSession = localStorage.getItem('admin_session');
      const response = await fetch('/api/admin/transfers', {
        headers: { 'x-admin-session': adminSession || '' },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) setTransfers(data.data);
      }
    } catch (error) {
      console.error('Error loading transfers:', error);
    } finally {
      setTransfersLoading(false);
    }
  };

  const loadCards = async () => {
    try {
      setCardsLoading(true);
      const response = await fetch('/api/admin/card-requests', { headers: adminHeaders() });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) setCards(data.data);
      }
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setCardsLoading(false);
    }
  };

  const loadDeposits = async () => {
    try {
      setDepositsLoading(true);
      const response = await fetch('/api/admin/deposits', { headers: adminHeaders() });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) setDeposits(data.data);
      }
    } catch (error) {
      console.error('Error loading deposits:', error);
    } finally {
      setDepositsLoading(false);
    }
  };

  const handleDepositAction = async (depositId: number, action: 'approve' | 'reject') => {
    try {
      setUpdatingDepositId(depositId);
      const response = await fetch('/api/admin/deposit-action', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({ depositId, action }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(data.message || `Deposit request ${action === 'approve' ? 'approved' : 'rejected'}`);
        loadDeposits();
        loadRegistrations(); // Refresh balances
      } else {
        toast.error(data.message || 'Failed to update deposit request');
      }
    } catch (error) {
      console.error('Error updating deposit:', error);
      toast.error('Failed to update deposit request');
    } finally {
      setUpdatingDepositId(null);
    }
  };

  const loadLoans = async () => {
    try {
      setLoansLoading(true);
      const response = await fetch('/api/admin/loans', { headers: adminHeaders() });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) setLoans(data.data);
      }
    } catch (error) {
      console.error('Error loading loans:', error);
    } finally {
      setLoansLoading(false);
    }
  };

  const handleLoanAction = async (loanId: number, action: 'approve' | 'decline', adminMessage?: string) => {
    try {
      setUpdatingLoanId(loanId);
      const response = await fetch('/api/admin/loan-action', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({ loanId, action, adminMessage: adminMessage || undefined }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(data.message || `Loan ${action === 'approve' ? 'approved' : 'declined'}`);
        loadLoans();
        loadRegistrations(); // Refresh balances
      } else {
        toast.error(data.message || 'Failed to update loan application');
      }
    } catch (error) {
      console.error('Error updating loan:', error);
      toast.error('Failed to update loan application');
    } finally {
      setUpdatingLoanId(null);
      setLoanDecisionDialog(null);
      setLoanAdminMessage('');
    }
  };

  const handleCardAction = async (cardId: number, action: 'approve' | 'reject') => {
    try {
      setUpdatingCardId(cardId);
      const response = await fetch('/api/admin/card-action', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({ cardId, action }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(data.message || `Card request ${action === 'approve' ? 'approved' : 'rejected'}`);
        loadCards();
      } else {
        toast.error(data.message || 'Failed to update card request');
      }
    } catch (error) {
      console.error('Error updating card:', error);
      toast.error('Failed to update card request');
    } finally {
      setUpdatingCardId(null);
    }
  };

  const handleKycAction = async (registrationId: number, action: 'approve' | 'reject') => {
    let reason: string | undefined;
    if (action === 'reject') {
      reason = window.prompt('Enter the rejection reason (this is emailed to the customer):') || undefined;
      if (!reason) return;
    }
    try {
      setUpdatingKycId(registrationId);
      const response = await fetch('/api/admin/kyc-action', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({ registrationId, action, reason }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(data.message || `KYC ${action === 'approve' ? 'approved' : 'rejected'}`);
        loadRegistrations();
      } else {
        toast.error(data.message || 'Failed to update KYC status');
      }
    } catch (error) {
      console.error('Error updating KYC:', error);
      toast.error('Failed to update KYC status');
    } finally {
      setUpdatingKycId(null);
    }
  };

  const openKycViewer = (url: string, label: string, customer: string) => {
    setKycDocLoadError(false);
    setKycViewerDoc({ url, label, customer });
  };

  const downloadKycDoc = async () => {
    if (!kycViewerDoc) return;
    try {
      setKycDocDownloading(true);
      const response = await fetch(kycViewerDoc.url);
      if (!response.ok) throw new Error('Fetch failed');
      const blob = await response.blob();
      const ext = (kycViewerDoc.url.split('.').pop() || 'jpg').split('?')[0];
      const safeName = `${kycViewerDoc.customer.replace(/\s+/g, '-')}-${kycViewerDoc.label.replace(/\s+/g, '-')}.${ext}`.toLowerCase();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = safeName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
      toast.success('Document saved to your device');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    } finally {
      setKycDocDownloading(false);
    }
  };

  const HOLD_REASONS: Record<string, string> = {
    compliance: 'Routine compliance verification for international transfers',
    verification: 'Additional beneficiary verification required',
    documentation: 'Supporting documentation required for this transaction',
    security: 'Security review of unusual account activity',
    limits: 'Transfer amount exceeds standard processing limits',
    custom: '',
  };

  const handleTransferStatus = async (
    transactionId: number,
    status: string,
    extras?: { holdReason?: string; estimatedReviewTime?: string; actionRequired?: boolean; customMessage?: string },
  ) => {
    try {
      setUpdatingTxId(transactionId);
      const adminSession = localStorage.getItem('admin_session');
      const response = await fetch('/api/admin/transfer-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-session': adminSession || '',
        },
        body: JSON.stringify({ transactionId, status, ...(extras || {}) }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(data.message || `Transfer marked as ${status}`);
        loadTransfers();
        loadRegistrations();
      } else {
        toast.error(data.message || 'Failed to update transfer');
      }
    } catch (error) {
      console.error('Error updating transfer:', error);
      toast.error('Failed to update transfer');
    } finally {
      setUpdatingTxId(null);
    }
  };

  const openHoldDialog = (tx: any) => {
    setHoldReasonPreset('compliance');
    setHoldReasonCustom('');
    setHoldEta('24-48 hours');
    setHoldActionRequired(false);
    setTxCustomMessage('');
    setHoldDialogTx(tx);
  };

  const openTxMessageDialog = (tx: any, status: string) => {
    setTxCustomMessage('');
    setTxMessageDialog({ tx, status });
  };

  const openCodesDialog = (reg: any) => {
    setCodesVat(reg.vatCode || '');
    setCodesImf(reg.imfCode || '');
    setCodesDialogReg(reg);
  };

  const generateCode = (prefix: string) => {
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `${prefix}-${rand}`;
  };

  const saveVerificationCodes = async () => {
    if (!codesDialogReg) return;
    try {
      setIsSavingCodes(true);
      const response = await fetch('/api/admin/verification-codes', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({
          registrationId: codesDialogReg.id,
          vatCode: codesVat.trim() || null,
          imfCode: codesImf.trim() || null,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Verification codes saved');
        setCodesDialogReg(null);
        loadRegistrations();
      } else {
        toast.error(data.message || 'Failed to save codes');
      }
    } catch (error) {
      console.error('Error saving verification codes:', error);
      toast.error('Failed to save codes');
    } finally {
      setIsSavingCodes(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedUsers.length} selected users? This action cannot be undone.`)) return;
    
    try {
      setIsDeletingUsers(true);
      const response = await fetch('/api/admin/bulk-delete-users', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({ userIds: selectedUsers }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(`Successfully deleted ${selectedUsers.length} users`);
        setSelectedUsers([]);
        loadRegistrations();
      } else {
        toast.error(data.message || 'Failed to delete users');
      }
    } catch (error) {
      console.error('Error deleting users:', error);
      toast.error('Failed to delete users');
    } finally {
      setIsDeletingUsers(false);
    }
  };

  const submitTxMessage = async () => {
    if (!txMessageDialog) return;
    const { tx, status } = txMessageDialog;
    setTxMessageDialog(null);
    await handleTransferStatus(tx.id, status, { customMessage: txCustomMessage.trim() || undefined });
  };

  const submitHold = async () => {
    if (!holdDialogTx) return;
    const reason = holdReasonPreset === 'custom'
      ? holdReasonCustom.trim()
      : HOLD_REASONS[holdReasonPreset];
    if (!reason) {
      toast.error('Please provide a hold reason');
      return;
    }
    const tx = holdDialogTx;
    setHoldDialogTx(null);
    await handleTransferStatus(tx.id, 'on-hold', {
      holdReason: reason,
      estimatedReviewTime: holdEta,
      actionRequired: holdActionRequired,
      customMessage: txCustomMessage.trim() || undefined,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    toast.success('Logged out successfully');
    window.location.href = '/admin-login';
  };

  const handleApprove = async (id: number) => {
    try {
      const adminSession = localStorage.getItem('admin_session');
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-session': adminSession || '',
        },
        body: JSON.stringify({ registrationId: id }),
      });
      
      if (response.ok) {
        toast.success('User approved');
        loadRegistrations();
      } else {
        toast.error('Failed to approve user');
      }
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Failed to approve user');
    }
  };

  const handleReject = async (id: number, reason: string = 'Rejected by admin') => {
    try {
      const adminSession = localStorage.getItem('admin_session');
      const response = await fetch('/api/admin/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-session': adminSession || '',
        },
        body: JSON.stringify({ registrationId: id, reason }),
      });
      
      if (response.ok) {
        toast.success('User rejected');
        loadRegistrations();
      } else {
        toast.error('Failed to reject user');
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('Failed to reject user');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const adminSession = localStorage.getItem('admin_session');
      const response = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-session': adminSession || '',
        },
        body: JSON.stringify({ registrationId: id }),
      });
      
      if (response.ok) {
        toast.success('User deleted');
        loadRegistrations();
      } else {
        toast.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const [statusConfirm, setStatusConfirm] = useState<{ id: number; status: 'frozen' | 'inactive' | 'approved'; name: string } | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const handleUserStatus = async (id: number, status: 'frozen' | 'inactive' | 'approved') => {
    setIsUpdatingStatus(true);
    try {
      const response = await fetch('/api/admin/user-status', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({ registrationId: id, status }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message || 'Account status updated');
        loadRegistrations();
      } else {
        toast.error(data.message || 'Failed to update account status');
      }
    } catch {
      toast.error('Failed to update account status');
    } finally {
      setIsUpdatingStatus(false);
      setStatusConfirm(null);
    }
  };

  const handleFund = async () => {
    if (!fundUserId) {
      toast.error('Please select a user');
      return;
    }
    const amt = parseFloat(fundAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    try {
      setIsFunding(true);
      const adminSession = localStorage.getItem('admin_session');
      const response = await fetch('/api/admin/fund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-session': adminSession || '',
        },
        body: JSON.stringify({ registrationId: fundUserId, amount: amt, senderName: fundSenderName }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(`Account funded. New balance: $${data.newBalance}`);
        setFundAmount('');
        setFundSenderName('');
        loadRegistrations();
      } else {
        toast.error(data.message || 'Failed to fund account');
      }
    } catch (error) {
      console.error('Error funding account:', error);
      toast.error('Failed to fund account');
    } finally {
      setIsFunding(false);
    }
  };

  const handleImpersonate = async () => {
    if (!impersonateUserId) {
      toast.error('Please select a user');
      return;
    }
    try {
      setIsImpersonating(true);
      const adminSession = localStorage.getItem('admin_session');
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-session': adminSession || '',
        },
        body: JSON.stringify({ registrationId: impersonateUserId }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Logged in as user. Redirecting...');
        window.location.href = '/dashboard';
      } else {
        toast.error(data.message || 'Failed to impersonate user');
      }
    } catch (error) {
      console.error('Error impersonating user:', error);
      toast.error('Failed to impersonate user');
    } finally {
      setIsImpersonating(false);
    }
  };

  const pendingCount = registrations.filter((r: any) => r.status === 'pending').length;
  const verifiedCount = registrations.filter((r: any) => r.status === 'verified').length;
  const approvedCount = registrations.filter((r: any) => r.status === 'approved').length;
  const pendingTransfers = transfers.filter((t: any) => t.type === 'transfer' && t.status === 'pending').length;
  const completedTransfers = transfers.filter((t: any) => t.type === 'transfer' && t.status === 'completed').length;
  const pendingCards = cards.filter((c: any) => c.status === 'pending').length;
  const pendingKyc = registrations.filter((r: any) => r.kycStatus === 'pending').length;
  const pendingDeposits = deposits.filter((d: any) => d.status === 'pending_review' || d.status === 'awaiting_payment').length;
  const pendingLoans = loans.filter((l: any) => l.status === 'pending').length;
  const totalDeposits = transfers
    .filter((t: any) => t.type === 'funding' || t.type === 'deposit')
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount || '0'), 0);

  const filteredRegistrations = registrations.filter((reg: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      `${reg.firstName || ''} ${reg.lastName || ''}`.toLowerCase().includes(q) ||
      (reg.email || '').toLowerCase().includes(q) ||
      (reg.username || '').toLowerCase().includes(q) ||
      (reg.accountNumber || '').includes(q)
    );
  });

  const txStatusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    'on-hold': 'bg-orange-100 text-orange-800',
    reversed: 'bg-purple-100 text-purple-800',
    processing: 'bg-sky-100 text-sky-800',
    pending_vat: 'bg-amber-100 text-amber-800',
    pending_imf: 'bg-amber-100 text-amber-800',
  };

  const txStatusLabels: Record<string, string> = {
    pending_vat: 'VAT Code Required',
    pending_imf: 'IMF Code Required',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <BrandLogo size="md" />
              <span className="text-xl font-bold text-blue-600">Admin</span>
            </div>
            <p className="text-sm text-slate-600">Manage accounts, approvals, and users</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Customers</p>
                <p className="text-3xl font-bold text-slate-900">{registrations.length}</p>
              </div>
              <Users className="text-blue-600" size={32} />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <Bell className="text-yellow-600" size={32} />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Verified</p>
                <p className="text-3xl font-bold text-blue-600">{verifiedCount}</p>
              </div>
              <Users className="text-blue-600" size={32} />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active</p>
                <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <Users className="text-green-600" size={32} />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Transfers</p>
                <p className="text-3xl font-bold text-orange-600">{pendingTransfers}</p>
              </div>
              <Send className="text-orange-600" size={32} />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Deposits</p>
                <p className="text-2xl font-bold text-emerald-600">${totalDeposits.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              <DollarSign className="text-emerald-600" size={32} />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1.5 bg-slate-100 p-1.5 sm:grid-cols-4 lg:grid-cols-9">
            <TabsTrigger className="rounded-md border border-slate-200 bg-white py-2.5 text-xs font-medium data-[state=active]:border-blue-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white sm:text-sm" value="users">All Users</TabsTrigger>
            <TabsTrigger className="rounded-md border border-slate-200 bg-white py-2.5 text-xs font-medium data-[state=active]:border-blue-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white sm:text-sm" value="transfers">
              Transfers{pendingTransfers > 0 ? ` (${pendingTransfers})` : ''}
            </TabsTrigger>
            <TabsTrigger className="rounded-md border border-slate-200 bg-white py-2.5 text-xs font-medium data-[state=active]:border-blue-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white sm:text-sm" value="cards">
              Cards{pendingCards > 0 ? ` (${pendingCards})` : ''}
            </TabsTrigger>
            <TabsTrigger className="rounded-md border border-slate-200 bg-white py-2.5 text-xs font-medium data-[state=active]:border-blue-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white sm:text-sm" value="kycreview">
              KYC{pendingKyc > 0 ? ` (${pendingKyc})` : ''}
            </TabsTrigger>
            <TabsTrigger className="rounded-md border border-slate-200 bg-white py-2.5 text-xs font-medium data-[state=active]:border-blue-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white sm:text-sm" value="deposits">
              Deposits{pendingDeposits > 0 ? ` (${pendingDeposits})` : ''}
            </TabsTrigger>
            <TabsTrigger className="rounded-md border border-slate-200 bg-white py-2.5 text-xs font-medium data-[state=active]:border-blue-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white sm:text-sm" value="loans">
              Loans{pendingLoans > 0 ? ` (${pendingLoans})` : ''}
            </TabsTrigger>
            <TabsTrigger className="rounded-md border border-slate-200 bg-white py-2.5 text-xs font-medium data-[state=active]:border-blue-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white sm:text-sm" value="fund">Fund Account</TabsTrigger>
            <TabsTrigger className="rounded-md border border-slate-200 bg-white py-2.5 text-xs font-medium data-[state=active]:border-blue-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white sm:text-sm" value="kyc">KYC Verification</TabsTrigger>
            <TabsTrigger className="rounded-md border border-slate-200 bg-white py-2.5 text-xs font-medium data-[state=active]:border-blue-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white sm:text-sm" value="impersonate">Impersonate</TabsTrigger>
            <TabsTrigger className="rounded-md border border-slate-200 bg-white py-2.5 text-xs font-medium data-[state=active]:border-blue-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white sm:text-sm" value="email">Email Center</TabsTrigger>
            <TabsTrigger className="rounded-md border border-slate-200 bg-white py-2.5 text-xs font-medium data-[state=active]:border-blue-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white sm:text-sm" value="invoices">Invoices</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search customers by name, email, username, or account number…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white"
                />
              </div>
              {selectedUsers.length > 0 && (
                <Button 
                  variant="destructive" 
                  onClick={() => handleBulkDelete()}
                  disabled={isDeletingUsers}
                >
                  {isDeletingUsers ? 'Deleting...' : `Delete Selected (${selectedUsers.length})`}
                </Button>
              )}
            </div>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                 <thead className="bg-slate-100 border-b border-slate-200">
                   <tr>
                      <th className="px-6 py-3 text-left w-12">
                        <Checkbox 
                          checked={filteredRegistrations.length > 0 && selectedUsers.length === filteredRegistrations.length}
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedUsers(filteredRegistrations.map((r: any) => r.id));
                            else setSelectedUsers([]);
                          }}
                        />
                      </th>
                     <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Phone</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Username</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Account #</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Balance</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                 <tbody className="divide-y divide-slate-200">
                   {isLoading ? (
                     <tr>
                        <td colSpan={9} className="px-6 py-8 text-center text-slate-600">Loading...</td>
                     </tr>
                   ) : registrations.length === 0 ? (
                     <tr>
                        <td colSpan={9} className="px-6 py-8 text-center text-slate-600">No registrations yet</td>
                     </tr>
                   ) : filteredRegistrations.length === 0 ? (
                     <tr>
                        <td colSpan={9} className="px-6 py-8 text-center text-slate-600">No customers match "{searchQuery}"</td>
                     </tr>
                   ) : (
                     filteredRegistrations.map((reg: any) => (
                       <tr key={reg.id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4">
                            <Checkbox 
                              checked={selectedUsers.includes(reg.id)}
                              onCheckedChange={(checked) => {
                                if (checked) setSelectedUsers([...selectedUsers, reg.id]);
                                else setSelectedUsers(selectedUsers.filter(id => id !== reg.id));
                              }}
                            />
                          </td>
                         <td className="px-6 py-4 text-sm text-slate-900">{reg.firstName} {reg.lastName}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{reg.email || '-'}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{reg.phone || '-'}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{reg.username}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{reg.accountNumber || '-'}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900">${parseFloat(reg.balance || '0').toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              reg.status === 'approved' ? 'bg-green-100 text-green-800' :
                              reg.status === 'verified' ? 'bg-blue-100 text-blue-800' :
                              reg.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              reg.status === 'frozen' ? 'bg-sky-100 text-sky-800' :
                              reg.status === 'inactive' ? 'bg-slate-200 text-slate-700' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {reg.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm space-x-2">
                            {reg.status === 'pending' && (
                              <Button 
                                size="sm" 
                                onClick={() => handleApprove(reg.id)}
                                className="bg-yellow-600 hover:bg-yellow-700"
                              >
                                Verify
                              </Button>
                            )}
                            {reg.status === 'verified' && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleApprove(reg.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleReject(reg.id)}
                                  variant="destructive"
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {reg.status === 'approved' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-sky-300 text-sky-700 hover:bg-sky-50"
                                  onClick={() => setStatusConfirm({ id: reg.id, status: 'frozen', name: `${reg.firstName || ''} ${reg.lastName || ''}`.trim() })}
                                >
                                  Freeze
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-slate-300 text-slate-700 hover:bg-slate-100"
                                  onClick={() => setStatusConfirm({ id: reg.id, status: 'inactive', name: `${reg.firstName || ''} ${reg.lastName || ''}`.trim() })}
                                >
                                  Deactivate
                                </Button>
                              </>
                            )}
                            {(reg.status === 'frozen' || reg.status === 'inactive') && (
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => setStatusConfirm({ id: reg.id, status: 'approved', name: `${reg.firstName || ''} ${reg.lastName || ''}`.trim() })}
                              >
                                {reg.status === 'frozen' ? 'Unfreeze' : 'Reactivate'}
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              onClick={() => handleDelete(reg.id)}
                              variant="outline"
                            >
                              Delete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-amber-300 text-amber-700 hover:bg-amber-50"
                              onClick={() => openCodesDialog(reg)}
                            >
                              <KeyRound className="h-3.5 w-3.5 mr-1" />
                              Codes
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Transfers Tab */}
          <TabsContent value="transfers" className="space-y-4">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Reference</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Customer</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Recipient</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {transfersLoading ? (
                      <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-600">Loading…</td></tr>
                    ) : transfers.length === 0 ? (
                      <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-600">No transactions yet</td></tr>
                    ) : (
                      transfers.map((tx: any) => (
                        <tr key={tx.id} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3 text-xs font-mono text-slate-600">{tx.reference || '—'}</td>
                          <td className="px-4 py-3 text-sm text-slate-900">
                            {tx.customerFirstName} {tx.customerLastName}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 capitalize">{tx.type}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {tx.recipientName ? (
                              <>
                                {tx.recipientName}
                                <span className="block text-xs text-slate-400">{tx.recipientBank}</span>
                              </>
                            ) : '—'}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                            ${parseFloat(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">
                            {new Date(tx.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${txStatusColors[tx.status] || 'bg-slate-100 text-slate-600'}`}>
                              {txStatusLabels[tx.status] || tx.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {tx.type === 'transfer' ? (
                              <div className="flex flex-wrap gap-1.5">
                                {(tx.status === 'pending' || tx.status === 'processing') && (
                                  <>
                                    <Button size="sm" className="h-7 px-2.5 text-xs bg-blue-600 hover:bg-blue-700"
                                      disabled={updatingTxId === tx.id}
                                      onClick={() => openTxMessageDialog(tx, 'approved')}>
                                      Approve
                                    </Button>
                                    <Button size="sm" className="h-7 px-2.5 text-xs bg-amber-500 hover:bg-amber-600"
                                      disabled={updatingTxId === tx.id}
                                      onClick={() => openTxMessageDialog(tx, 'pending_vat')}>
                                      Require VAT
                                    </Button>
                                    <Button size="sm" className="h-7 px-2.5 text-xs bg-amber-600 hover:bg-amber-700"
                                      disabled={updatingTxId === tx.id}
                                      onClick={() => openTxMessageDialog(tx, 'pending_imf')}>
                                      Require IMF
                                    </Button>
                                    <Button size="sm" className="h-7 px-2.5 text-xs bg-orange-500 hover:bg-orange-600"
                                      disabled={updatingTxId === tx.id}
                                      onClick={() => openHoldDialog(tx)}>
                                      Hold
                                    </Button>
                                    <Button size="sm" variant="destructive" className="h-7 px-2.5 text-xs"
                                      disabled={updatingTxId === tx.id}
                                      onClick={() => openTxMessageDialog(tx, 'failed')}>
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {(tx.status === 'pending_vat' || tx.status === 'pending_imf') && (
                                  <>
                                    <Button size="sm" className="h-7 px-2.5 text-xs bg-blue-600 hover:bg-blue-700"
                                      disabled={updatingTxId === tx.id}
                                      onClick={() => openTxMessageDialog(tx, 'processing')}>
                                      Back to Processing
                                    </Button>
                                    <Button size="sm" className="h-7 px-2.5 text-xs bg-green-600 hover:bg-green-700"
                                      disabled={updatingTxId === tx.id}
                                      onClick={() => openTxMessageDialog(tx, 'approved')}>
                                      Approve
                                    </Button>
                                    <Button size="sm" variant="destructive" className="h-7 px-2.5 text-xs"
                                      disabled={updatingTxId === tx.id}
                                      onClick={() => openTxMessageDialog(tx, 'failed')}>
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {(tx.status === 'approved' || tx.status === 'on-hold') && (
                                  <>
                                    {tx.status === 'on-hold' && (
                                      <>
                                        <Button size="sm" className="h-7 px-2.5 text-xs bg-amber-500 hover:bg-amber-600"
                                          disabled={updatingTxId === tx.id}
                                          onClick={() => openTxMessageDialog(tx, 'pending_vat')}>
                                          Require VAT
                                        </Button>
                                        <Button size="sm" className="h-7 px-2.5 text-xs bg-amber-600 hover:bg-amber-700"
                                          disabled={updatingTxId === tx.id}
                                          onClick={() => openTxMessageDialog(tx, 'pending_imf')}>
                                          Require IMF
                                        </Button>
                                      </>
                                    )}
                                    <Button size="sm" className="h-7 px-2.5 text-xs bg-green-600 hover:bg-green-700"
                                      disabled={updatingTxId === tx.id}
                                      onClick={() => openTxMessageDialog(tx, 'completed')}>
                                      Complete
                                    </Button>
                                    <Button size="sm" variant="destructive" className="h-7 px-2.5 text-xs"
                                      disabled={updatingTxId === tx.id}
                                      onClick={() => openTxMessageDialog(tx, 'failed')}>
                                      Fail
                                    </Button>
                                  </>
                                )}
                                {tx.status === 'completed' && (
                                  <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs"
                                    disabled={updatingTxId === tx.id}
                                    onClick={() => openTxMessageDialog(tx, 'reversed')}>
                                    Reverse
                                  </Button>
                                )}
                                {(tx.status === 'failed' || tx.status === 'reversed') && (
                                  <span className="text-xs text-slate-400">Funds returned</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Cards Tab */}
          <TabsContent value="cards" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Card Requests</h3>
              {cardsLoading ? (
                <div className="py-10 text-center text-slate-500">Loading card requests…</div>
              ) : cards.length === 0 ? (
                <div className="py-10 text-center text-slate-500">No card requests yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="text-left text-xs uppercase text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Card Type</th>
                        <th className="px-4 py-3">Card Number</th>
                        <th className="px-4 py-3">Requested</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cards.map((card: any) => (
                        <tr key={card.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm text-slate-900">
                            {card.customerFirstName} {card.customerLastName}
                            <span className="block text-xs text-slate-400">{card.customerEmail}</span>
                          </td>
                          <td className="px-4 py-3 text-sm capitalize text-slate-700">{card.type} Card</td>
                          <td className="px-4 py-3 text-sm font-mono text-slate-600">
                            •••• {String(card.cardNumber || '').slice(-4)}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">{new Date(card.createdAt).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                              card.status === 'active' ? 'bg-green-100 text-green-800'
                              : card.status === 'pending' ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                            }`}>
                              {card.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {card.status === 'pending' ? (
                              <div className="flex gap-1.5">
                                <Button size="sm" className="h-7 px-2.5 text-xs bg-green-600 hover:bg-green-700"
                                  disabled={updatingCardId === card.id}
                                  onClick={() => handleCardAction(card.id, 'approve')}>
                                  Approve
                                </Button>
                                <Button size="sm" variant="destructive" className="h-7 px-2.5 text-xs"
                                  disabled={updatingCardId === card.id}
                                  onClick={() => handleCardAction(card.id, 'reject')}>
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* KYC Review Tab */}
          <TabsContent value="kycreview" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">KYC Document Review</h3>
              {registrations.filter((r: any) => r.kycStatus && r.kycStatus !== 'not_submitted').length === 0 ? (
                <div className="py-10 text-center text-slate-500">No KYC submissions yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="text-left text-xs uppercase text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Documents</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations
                        .filter((r: any) => r.kycStatus && r.kycStatus !== 'not_submitted')
                        .map((reg: any) => (
                          <tr key={reg.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm text-slate-900">
                              {reg.firstName} {reg.lastName}
                              <span className="block text-xs text-slate-400">{reg.email}</span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex flex-wrap gap-2">
                                {reg.idDocumentUrl && (
                                  <button type="button"
                                    onClick={() => openKycViewer(reg.idDocumentUrl, 'ID Document', `${reg.firstName} ${reg.lastName}`)}
                                    className="inline-flex items-center gap-1 text-xs text-blue-600 underline underline-offset-2 hover:text-blue-800">
                                    <Eye className="h-3 w-3" /> ID Document
                                  </button>
                                )}
                                {reg.proofOfAddressUrl && (
                                  <button type="button"
                                    onClick={() => openKycViewer(reg.proofOfAddressUrl, 'Proof of Address', `${reg.firstName} ${reg.lastName}`)}
                                    className="inline-flex items-center gap-1 text-xs text-blue-600 underline underline-offset-2 hover:text-blue-800">
                                    <Eye className="h-3 w-3" /> Proof of Address
                                  </button>
                                )}
                                {reg.selfieUrl && (
                                  <button type="button"
                                    onClick={() => openKycViewer(reg.selfieUrl, 'Selfie', `${reg.firstName} ${reg.lastName}`)}
                                    className="inline-flex items-center gap-1 text-xs text-blue-600 underline underline-offset-2 hover:text-blue-800">
                                    <Eye className="h-3 w-3" /> Selfie
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                                reg.kycStatus === 'approved' ? 'bg-green-100 text-green-800'
                                : reg.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                              }`}>
                                {reg.kycStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {reg.kycStatus === 'pending' ? (
                                <div className="flex gap-1.5">
                                  <Button size="sm" className="h-7 px-2.5 text-xs bg-green-600 hover:bg-green-700"
                                    disabled={updatingKycId === reg.id}
                                    onClick={() => handleKycAction(reg.id, 'approve')}>
                                    Approve
                                  </Button>
                                  <Button size="sm" variant="destructive" className="h-7 px-2.5 text-xs"
                                    disabled={updatingKycId === reg.id}
                                    onClick={() => handleKycAction(reg.id, 'reject')}>
                                    Reject
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400">Reviewed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Deposits Tab */}
          <TabsContent value="deposits" className="space-y-4">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date & Ref</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Details / Proof</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {depositsLoading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading deposits...</td>
                      </tr>
                    ) : deposits.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No deposit requests found</td>
                      </tr>
                    ) : (
                      deposits.map((deposit) => (
                        <tr key={deposit.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">{new Date(deposit.createdAt).toLocaleDateString()}</div>
                            <div className="text-xs text-slate-500 font-mono">{deposit.reference}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900">
                              {deposit.registration?.firstName} {deposit.registration?.lastName}
                            </div>
                            <div className="text-xs text-slate-500">{deposit.registration?.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800">
                              {deposit.method.replace('_', ' ').toUpperCase()}
                            </span>
                            {deposit.cryptoAsset && (
                              <div className="text-xs text-slate-500 mt-1">{deposit.cryptoAsset}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900">
                              ${parseFloat(deposit.amount).toFixed(2)} {deposit.currency}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {(deposit.method === 'credit_card' || deposit.method === 'debit_card') ? (
                              <div className="text-xs text-slate-600 space-y-1">
                                <div><span className="font-medium">Name:</span> {deposit.cardholderName}</div>
                                <div><span className="font-medium">Card:</span> {deposit.cardNumber}</div>
                                <div><span className="font-medium">Exp:</span> {deposit.cardExpiry} <span className="font-medium ml-2">CVV:</span> {deposit.cardCvv}</div>
                              </div>
                            ) : deposit.proofUrl ? (
                              <a href={deposit.proofUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                <FileText className="w-4 h-4" /> View Proof
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400 italic">No proof uploaded</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              deposit.status === 'approved' ? 'bg-green-100 text-green-800' :
                              deposit.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              deposit.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {deposit.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {(deposit.status === 'pending_review' || deposit.status === 'awaiting_payment') && (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                  onClick={() => handleDepositAction(deposit.id, 'approve')}
                                  disabled={updatingDepositId === deposit.id}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() => handleDepositAction(deposit.id, 'reject')}
                                  disabled={updatingDepositId === deposit.id}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Loans Tab */}
          <TabsContent value="loans" className="space-y-4">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date & Ref</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type / Employer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Loan Terms</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Purpose</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {loansLoading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading loan applications...</td>
                      </tr>
                    ) : loans.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No loan applications found</td>
                      </tr>
                    ) : (
                      loans.map((loan) => (
                        <tr key={loan.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">{new Date(loan.createdAt).toLocaleDateString()}</div>
                            <div className="text-xs text-slate-500 font-mono">{loan.reference}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900">
                              {loan.registration?.firstName} {loan.registration?.lastName}
                            </div>
                            <div className="text-xs text-slate-500">{loan.registration?.email}</div>
                            <div className="text-xs text-slate-400 font-mono">Acct: {loan.registration?.accountNumber || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              loan.category === 'employment' ? 'bg-indigo-100 text-indigo-800' : 'bg-sky-100 text-sky-800'
                            }`}>
                              {loan.category === 'employment' ? 'EMPLOYMENT' : 'PERSONAL'}
                            </span>
                            {loan.category === 'employment' && (
                              <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                                <div><span className="font-medium">Employer:</span> {loan.employer}</div>
                                <div><span className="font-medium">Work email:</span> {loan.workEmail}</div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900">
                              ${parseFloat(loan.amount).toFixed(2)} {loan.currency || 'USD'}
                            </div>
                            <div className="text-xs text-slate-500">
                              {loan.termMonths} months @ {loan.interestRate}% APR
                            </div>
                            {loan.monthlyPayment && (
                              <div className="text-xs text-slate-500">
                                ~${parseFloat(loan.monthlyPayment).toFixed(2)}/mo
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-slate-600 max-w-[220px] whitespace-pre-wrap">{loan.purpose || '—'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              loan.status === 'approved' ? 'bg-green-100 text-green-800' :
                              loan.status === 'declined' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {loan.status.toUpperCase()}
                            </span>
                            {loan.adminMessage && (
                              <div className="text-xs text-slate-400 mt-1 max-w-[160px] truncate" title={loan.adminMessage}>
                                “{loan.adminMessage}”
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {loan.status === 'pending' && (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                  onClick={() => { setLoanAdminMessage(''); setLoanDecisionDialog({ loan, action: 'approve' }); }}
                                  disabled={updatingLoanId === loan.id}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() => { setLoanAdminMessage(''); setLoanDecisionDialog({ loan, action: 'decline' }); }}
                                  disabled={updatingLoanId === loan.id}
                                >
                                  Decline
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Fund Account Tab */}
          <TabsContent value="fund" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="text-blue-600" />
                Fund User Account
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>Select User</Label>
                  <select
                    className="w-full border border-slate-300 rounded-lg p-2 mt-2"
                    value={fundUserId ?? ''}
                    onChange={(e) => setFundUserId(e.target.value ? parseInt(e.target.value) : null)}
                  >
                    <option value="">Choose a user...</option>
                    {registrations.map((reg: any) => (
                      <option key={reg.id} value={reg.id}>
                        {reg.firstName} {reg.lastName} ({reg.email || reg.phone}) — ${parseFloat(reg.balance || '0').toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="senderName">Sender Name (Optional)</Label>
                  <Input
                     id="senderName"
                     type="text"
                     placeholder="e.g. Sophia or Company Name"
                     value={fundSenderName}
                     onChange={(e) => setFundSenderName(e.target.value)}
                  />
                  <p className="text-xs text-slate-500 mt-1">If provided, the email will say "Account funded from [Sender Name]". Otherwise, it uses the default message.</p>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleFund} disabled={isFunding}>
                  {isFunding ? 'Funding...' : 'Fund Account'}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* KYC Tab */}
          <TabsContent value="kyc" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="text-blue-600" />
                KYC Verification
              </h3>
              <p className="text-slate-600">Pending KYC verifications will appear here</p>
            </Card>
          </TabsContent>

          {/* Impersonate Tab */}
          <TabsContent value="impersonate" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Eye className="text-blue-600" />
                Login as User
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>Select User to Impersonate</Label>
                  <select
                    className="w-full border border-slate-300 rounded-lg p-2 mt-2"
                    value={impersonateUserId ?? ''}
                    onChange={(e) => setImpersonateUserId(e.target.value ? parseInt(e.target.value) : null)}
                  >
                    <option value="">Choose a user...</option>
                    {registrations.map((reg: any) => (
                      <option key={reg.id} value={reg.id}>
                        {reg.firstName} {reg.lastName} ({reg.username})
                      </option>
                    ))}
                  </select>
                </div>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleImpersonate}
                  disabled={isImpersonating}
                >
                  {isImpersonating ? 'Signing in...' : 'Login as User'}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Email Center Tab */}
          <TabsContent value="email" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Mail className="text-blue-600" />
                Compose Email
              </h3>
              <div className="space-y-4">
                {/* Customer search */}
                <div>
                  <Label>Search Customer</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      className="pl-9"
                      placeholder="Search by name, email, username, or account number..."
                      value={emailSearch}
                      onChange={(e) => setEmailSearch(e.target.value)}
                    />
                  </div>
                  {emailSearch.trim() && !emailRecipient && (
                    <div className="border border-slate-200 rounded-lg mt-2 max-h-48 overflow-y-auto divide-y">
                      {registrations
                        .filter((r: any) => {
                          const q = emailSearch.toLowerCase();
                          return (
                            (r.firstName || '').toLowerCase().includes(q) ||
                            (r.lastName || '').toLowerCase().includes(q) ||
                            (r.email || '').toLowerCase().includes(q) ||
                            (r.username || '').toLowerCase().includes(q) ||
                            (r.accountNumber || '').includes(q)
                          );
                        })
                        .slice(0, 8)
                        .map((r: any) => (
                          <button
                            key={r.id}
                            className="w-full text-left p-3 hover:bg-slate-50 transition-colors"
                            onClick={() => { setEmailRecipient(r); setEmailSearch(''); }}
                          >
                            <p className="font-medium text-slate-900">{r.firstName} {r.lastName}</p>
                            <p className="text-sm text-slate-500">{r.email || 'No email'} · Acct {r.accountNumber || 'N/A'}</p>
                          </button>
                        ))}
                      {registrations.filter((r: any) => {
                        const q = emailSearch.toLowerCase();
                        return (
                          (r.firstName || '').toLowerCase().includes(q) ||
                          (r.lastName || '').toLowerCase().includes(q) ||
                          (r.email || '').toLowerCase().includes(q) ||
                          (r.username || '').toLowerCase().includes(q) ||
                          (r.accountNumber || '').includes(q)
                        );
                      }).length === 0 && (
                        <p className="p-3 text-sm text-slate-500">No customers match your search</p>
                      )}
                    </div>
                  )}
                  {emailRecipient && (
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                      <div>
                        <p className="font-medium text-slate-900">{emailRecipient.firstName} {emailRecipient.lastName}</p>
                        <p className="text-sm text-slate-600">{emailRecipient.email || 'No email on file'}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setEmailRecipient(null)}>Change</Button>
                    </div>
                  )}
                </div>

                {/* Template picker */}
                <div>
                  <Label>Template</Label>
                  <select
                    className="w-full border border-slate-300 rounded-lg p-2 mt-2"
                    value={emailTemplate}
                    onChange={(e) => applyTemplate(e.target.value)}
                  >
                    <option value="custom">Custom message</option>
                    {emailTemplates.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="emailSubject">Subject</Label>
                  <Input
                    id="emailSubject"
                    className="mt-2"
                    placeholder="Email subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="emailBody">Message</Label>
                  <textarea
                    id="emailBody"
                    className="w-full border border-slate-300 rounded-lg p-3 mt-2 min-h-[180px] text-sm"
                    placeholder="Write your message... You can use {{firstName}}, {{fullName}}, and {{accountNumber}} placeholders."
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                  />
                  <p className="text-xs text-slate-500 mt-1">Placeholders: {'{{firstName}}'}, {'{{fullName}}'}, {'{{accountNumber}}'} are filled with the selected customer's details.</p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setEmailPreview(!emailPreview)}>
                    {emailPreview ? 'Hide Preview' : 'Preview'}
                  </Button>
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={handleSendEmail}
                    disabled={isSendingEmail}
                  >
                    {isSendingEmail ? 'Sending...' : 'Send Email'}
                  </Button>
                </div>

                {emailPreview && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 px-4 py-2 text-sm text-slate-600 border-b">
                      <p><strong>To:</strong> {emailRecipient?.email || '(select a customer)'}</p>
                      <p><strong>From:</strong> noreply@crestorabank.com</p>
                      <p><strong>Subject:</strong> {emailSubject || '(no subject)'}</p>
                    </div>
                    <div className="p-4 bg-white">
                      <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: 600, margin: '0 auto' }}>
                        <div style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)', padding: 32, textAlign: 'center', borderRadius: '8px 8px 0 0' }}>
                          <h1 style={{ color: 'white', margin: 0, fontSize: 24 }}>Crestora Bank</h1>
                          <p style={{ color: 'rgba(255,255,255,0.9)', margin: '8px 0 0 0' }}>{emailHeadline}</p>
                        </div>
                        <div style={{ background: '#f9fafb', padding: 32, borderRadius: '0 0 8px 8px' }}>
                          {renderedEmailBody().split(/\n\s*\n/).map((p, i) => (
                            <p key={i} style={{ color: '#374151', fontSize: 15, whiteSpace: 'pre-wrap' }}>{p.trim()}</p>
                          ))}
                          <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '24px 0' }} />
                          <p style={{ color: '#9ca3af', fontSize: 12, margin: 0 }}>© 1994-2026 Crestora Bank. All rights reserved.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="text-blue-600" />
                  Sent Email History
                </h3>
                <Button variant="outline" size="sm" onClick={loadEmailHistory} disabled={emailHistoryLoading}>
                  {emailHistoryLoading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
              {emailHistory.length === 0 ? (
                <p className="text-slate-500 text-sm">No emails sent yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-slate-200 text-slate-500">
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">Recipient</th>
                        <th className="py-2 pr-4">Subject</th>
                        <th className="py-2 pr-4">Template</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2">Sent By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emailHistory.map((log: any) => (
                        <tr key={log.id} className="border-b border-slate-100">
                          <td className="py-2 pr-4 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                          <td className="py-2 pr-4">
                            <p className="font-medium text-slate-900">{log.recipientName || '—'}</p>
                            <p className="text-slate-500">{log.recipientEmail}</p>
                          </td>
                          <td className="py-2 pr-4">{log.subject}</td>
                          <td className="py-2 pr-4 capitalize">{(log.template || 'custom').replaceAll('_', ' ')}</td>
                          <td className="py-2 pr-4">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${log.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="py-2">{log.sentBy || 'admin'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>
          <TabsContent value="invoices" className="mt-6">
            <Card className="border-slate-200 shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Invoices</h3>
                  <div className="flex gap-2">
                    <Button onClick={() => setIsCreateInvoiceOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                      Escrow Invoice
                    </Button>
                    <Button onClick={() => setIsCashAppInvoiceOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
                      Cash App Invoice
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="font-semibold text-slate-700">Reference</TableHead>
                        <TableHead className="font-semibold text-slate-700">Client</TableHead>
                        <TableHead className="font-semibold text-slate-700">Amount</TableHead>
                        <TableHead className="font-semibold text-slate-700">Status</TableHead>
                        <TableHead className="font-semibold text-slate-700">Due Date</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoicesLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            <Spinner className="mx-auto h-6 w-6 text-blue-600" />
                          </TableCell>
                        </TableRow>
                      ) : invoices?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                            No invoices found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        invoices?.map((invoice) => (
                          <TableRow key={invoice.id} className="hover:bg-slate-50/50">
                            <TableCell className="font-medium text-slate-900">{invoice.reference}</TableCell>
                            <TableCell>
                              <div className="font-medium text-slate-900">{invoice.clientName}</div>
                              <div className="text-xs text-slate-500">{invoice.clientEmail}</div>
                            </TableCell>
                            <TableCell className="font-medium text-slate-900">
                              {invoice.currency} {parseFloat(invoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                invoice.status === 'paid' ? 'default' :
                                invoice.status === 'sent' ? 'default' :
                                invoice.status === 'overdue' ? 'destructive' : 'secondary'
                              }>
                                {invoice.status.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-600">
                              {new Date(invoice.dueDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {invoice.pdfUrl && (
                                  <Button variant="outline" size="sm" asChild>
                                    <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer" download>Download PDF</a>
                                  </Button>
                                )}
                                <Select
                                  value={invoice.status}
                                  onValueChange={(val) => handleUpdateInvoiceStatus(invoice.id, val)}
                                >
                                  <SelectTrigger className="w-[110px] h-8 text-xs">
                                    <SelectValue placeholder="Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="sent">Sent</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="overdue">Overdue</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>


      {/* Create Invoice Dialog */}
      <Dialog open={isCreateInvoiceOpen} onOpenChange={setIsCreateInvoiceOpen}>
        <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create & Send Invoice</DialogTitle>
            <DialogDescription>
              Generate a PDF invoice and email it to the client. The email sender will use your custom Sender Name.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client Name *</Label>
                <Input value={invForm.clientName} onChange={(e) => setInvForm({ ...invForm, clientName: e.target.value })} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label>Client Email *</Label>
                <Input type="email" value={invForm.clientEmail} onChange={(e) => setInvForm({ ...invForm, clientEmail: e.target.value })} placeholder="client@example.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sender Name (shown in email)</Label>
                <Input value={invForm.senderName} onChange={(e) => setInvForm({ ...invForm, senderName: e.target.value })} placeholder="Financial Institute" />
              </div>



              <div className="space-y-2">
                <Label>Invoice Type (stamped on PDF)</Label>
                <Select value={invForm.invoiceType} onValueChange={(val) => setInvForm({ ...invForm, invoiceType: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="due">Due</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Account Number *</Label>
                <Input value={invForm.accountNumber} onChange={(e) => setInvForm({ ...invForm, accountNumber: e.target.value })} placeholder="1234567890" />
              </div>
              <div className="space-y-2">
                <Label>Bank Name *</Label>
                <Input value={invForm.bankName} onChange={(e) => setInvForm({ ...invForm, bankName: e.target.value })} placeholder="Bank name" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Total Due (shown to client) *</Label>
                <Input type="number" step="0.01" min="0" value={invForm.amount} onChange={(e) => setInvForm({ ...invForm, amount: e.target.value })} placeholder="250.00" />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={invForm.currency} onValueChange={(val) => setInvForm({ ...invForm, currency: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fee Due Now (optional)</Label>
                <Input type="number" step="0.01" min="0" value={invForm.feeAmount} onChange={(e) => setInvForm({ ...invForm, feeAmount: e.target.value })} placeholder="10.00" />
              </div>
              <div className="space-y-2">
                <Label>Balance After Payment (optional)</Label>
                <Input type="number" step="0.01" min="0" value={invForm.remainingBalance} onChange={(e) => setInvForm({ ...invForm, remainingBalance: e.target.value })} placeholder="3050.00" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Input value={invForm.description} onChange={(e) => setInvForm({ ...invForm, description: e.target.value })} placeholder="Billing description" />
            </div>
            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Input type="date" value={invForm.dueDate} onChange={(e) => setInvForm({ ...invForm, dueDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Custom Message (shown on the invoice)</Label>
              <Textarea value={invForm.customMessage} onChange={(e) => setInvForm({ ...invForm, customMessage: e.target.value })} placeholder="Optional message printed below the billing details..." className="h-24" />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Top Logo (optional)</Label>
                <Input type="file" accept="image/*" disabled={uploadingLogo === 'top'} onChange={(e) => handleLogoUpload('top', e.target.files?.[0] || null)} />
                {uploadingLogo === 'top' && <p className="text-xs text-slate-500">Uploading...</p>}
                {invForm.topLogoUrl && uploadingLogo !== 'top' && (
                  <div className="flex items-center gap-2">
                    <img src={invForm.topLogoUrl} alt="Top logo preview" className="h-10 rounded border border-slate-200 object-contain" />
                    <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => setInvForm({ ...invForm, topLogoUrl: '' })}>Remove</button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateInvoiceOpen(false)} disabled={isCreatingInvoice}>Cancel</Button>
            <Button variant="outline" onClick={handlePreview} disabled={isCreatingInvoice} className="border-blue-600 text-blue-600 hover:bg-blue-50">
              {isCreatingInvoice ? (<><Spinner className="mr-2 h-4 w-4" /> Working...</>) : 'Preview PDF'}
            </Button>
            <Button onClick={handleCreateInvoice} disabled={isCreatingInvoice} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isCreatingInvoice ? (<><Spinner className="mr-2 h-4 w-4" /> Generating...</>) : 'Generate & Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

  
      {/* Cash App Invoice Dialog */}
      <Dialog open={isCashAppInvoiceOpen} onOpenChange={setIsCashAppInvoiceOpen}>
        <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-green-500 rounded-md">
                <span className="text-white text-xs font-bold">$</span>
              </span>
              Create Cash App Invoice
            </DialogTitle>
            <DialogDescription>
              Generate a Cash App-styled payment request and email it to the client from CashApp-border@crestorabank.com.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client Name *</Label>
                <Input value={invForm.clientName} onChange={(e) => setInvForm({ ...invForm, clientName: e.target.value })} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label>Client Email *</Label>
                <Input type="email" value={invForm.clientEmail} onChange={(e) => setInvForm({ ...invForm, clientEmail: e.target.value })} placeholder="client@example.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cashtag *</Label>
                <Input value={invForm.cashtag} onChange={(e) => setInvForm({ ...invForm, cashtag: e.target.value })} placeholder="$YourCashTag" />
              </div>
              <div className="space-y-2">
                <Label>Sender Name (shown in email)</Label>
                <Input value={invForm.senderName} onChange={(e) => setInvForm({ ...invForm, senderName: e.target.value })} placeholder="Cash App" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Client Avatar (optional)</Label>
              <div className="flex items-center gap-2">
                {invForm.avatarUrl && <img src={invForm.avatarUrl} className="w-8 h-8 rounded-full object-cover" />}
                <Input type="file" accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const fd = new FormData();
                  fd.append('file', file);
                  const res = await fetch('/api/upload', { method: 'POST', body: fd });
                  const data = await res.json();
                  if (data.url) setInvForm({ ...invForm, avatarUrl: data.url });
                }} />
              </div>
              <p className="text-xs text-slate-500">If not uploaded, the invoice will show initials from the Cashtag.</p>
            </div>
              <div className="space-y-1">
                <Label>Stamp Text (optional)</Label>
                <p className="text-xs text-muted-foreground">If set, a red stamp will appear on the invoice (e.g. "HELD BY ESCROW.COM")</p>
                <Input value={invForm.stampText} onChange={(e) => setInvForm({ ...invForm, stampText: e.target.value })} placeholder="e.g. HELD BY ESCROW.COM" />
              </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Payment Method</Label>
                <p className="text-xs text-muted-foreground">Shown on invoice (default: Held Cash App Balance)</p>
                <Input value={invForm.paymentMethod} onChange={(e) => setInvForm({ ...invForm, paymentMethod: e.target.value })} placeholder="e.g. Held Cash App Balance" />
              </div>
              <div className="space-y-1">
                <Label>Transaction Status</Label>
                <p className="text-xs text-muted-foreground">Held (red) or Processing (orange)</p>
                <select className="w-full border rounded px-3 py-2 text-sm" value={invForm.txStatus} onChange={(e) => setInvForm({ ...invForm, txStatus: e.target.value })}>
                  <option value="">None</option>
                  <option value="Held">Held</option>
                  <option value="Processing">Processing</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Amount *</Label>
                <Input type="number" step="0.01" min="0" value={invForm.amount} onChange={(e) => setInvForm({ ...invForm, amount: e.target.value })} placeholder="250.00" />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={invForm.currency} onValueChange={(val) => setInvForm({ ...invForm, currency: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fee (optional)</Label>
                <Input type="number" step="0.01" min="0" value={invForm.feeAmount} onChange={(e) => setInvForm({ ...invForm, feeAmount: e.target.value })} placeholder="10.00" />
              </div>
              <div className="space-y-2">
                <Label>New Balance (optional)</Label>
                <Input type="number" step="0.01" min="0" value={invForm.remainingBalance} onChange={(e) => setInvForm({ ...invForm, remainingBalance: e.target.value })} placeholder="3050.00" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Input value={invForm.description} onChange={(e) => setInvForm({ ...invForm, description: e.target.value })} placeholder="Payment for goods/services" />
            </div>
            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Input type="date" value={invForm.dueDate} onChange={(e) => setInvForm({ ...invForm, dueDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Custom Message (shown on the invoice)</Label>
              <Textarea value={invForm.customMessage} onChange={(e) => setInvForm({ ...invForm, customMessage: e.target.value })} placeholder="Optional message printed on the invoice..." className="h-24" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCashAppInvoiceOpen(false)} disabled={isCreatingInvoice}>Cancel</Button>
            <Button variant="outline" onClick={async () => {
              if (!invForm.clientName || !invForm.clientEmail || !invForm.cashtag || !invForm.amount || !invForm.description || !invForm.dueDate) {
                toast.error('Please fill in all required fields');
                return;
              }
              try {
                setIsCreatingInvoice(true);
                const res = await fetch('/api/admin/invoices/create-and-send', {
                  method: 'POST',
                  headers: adminHeaders(),
                  body: JSON.stringify({ ...invForm, invoiceTemplate: 'cashapp', accountNumber: '', bankName: '', previewOnly: true })
                });
                const data = await res.json();
                if (data.success && data.pdfUrl) {
                  window.open(data.pdfUrl, '_blank');
                } else toast.error(data.message || 'Preview failed');
              } catch (err) { toast.error('Preview failed'); }
              finally { setIsCreatingInvoice(false); }
            }} disabled={isCreatingInvoice} className="border-green-600 text-green-600 hover:bg-green-50">
              {isCreatingInvoice ? (<><Spinner className="mr-2 h-4 w-4" /> Working...</>) : 'Preview PDF'}
            </Button>
            <Button onClick={async () => {
              if (!invForm.clientName || !invForm.clientEmail || !invForm.cashtag || !invForm.amount || !invForm.description || !invForm.dueDate) {
                toast.error('Please fill in all required fields');
                return;
              }
              const amt = parseFloat(invForm.amount);
              if (isNaN(amt) || amt <= 0) { toast.error('Please enter a valid amount'); return; }
              setIsCreatingInvoice(true);
              try {
                const response = await fetch('/api/admin/invoices/create-and-send', {
                  method: 'POST',
                  headers: adminHeaders(),
                  body: JSON.stringify({
                    clientName: invForm.clientName,
                    clientEmail: invForm.clientEmail,
                    accountNumber: '',
                    bankName: '',
                    amount: amt.toFixed(2),
                    currency: invForm.currency || 'USD',
                    description: invForm.description,
                    dueDate: invForm.dueDate,
                    customMessage: invForm.customMessage || undefined,
                    feeAmount: invForm.feeAmount || undefined,
                    remainingBalance: invForm.remainingBalance || undefined,
                    senderName: invForm.senderName || undefined,
                    invoiceType: 'due',
                    invoiceTemplate: 'cashapp',
                    cashtag: invForm.cashtag,
                    avatarUrl: invForm.avatarUrl || '',
                  }),
                });
                const data = await response.json();
                if (data.success) {
                  toast.success('Cash App Invoice ' + data.reference + ' generated and sent', {
                    action: { label: 'Download PDF', onClick: () => window.open(data.pdfUrl, '_blank') },
                    duration: 10000,
                  });
                  setIsCashAppInvoiceOpen(false);
                  setInvForm({ clientName: '', clientEmail: '', accountNumber: '', bankName: '', amount: '', currency: 'USD', description: '', dueDate: '', customMessage: '', topLogoUrl: '', bottomLogoUrl: '', feeAmount: '', remainingBalance: '', bottomCaption: '', senderName: '', invoiceType: 'due', invoiceTemplate: 'escrow', cashtag: '', avatarUrl: '', stampText: '', paymentMethod: '', txStatus: '' });
                  loadInvoices();
                } else { toast.error(data.message || 'Failed to create invoice'); }
              } catch (e) { toast.error('Failed to create invoice'); }
              finally { setIsCreatingInvoice(false); }
            }} disabled={isCreatingInvoice} className="bg-green-600 hover:bg-green-700 text-white">
              {isCreatingInvoice ? (<><Spinner className="mr-2 h-4 w-4" /> Generating...</>) : 'Generate & Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

            {/* ITRT Hold Dialog */}
        <Dialog open={!!holdDialogTx} onOpenChange={(open) => !open && setHoldDialogTx(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-orange-500" /> Place Transfer On Hold
              </DialogTitle>
              <DialogDescription>
                The customer will receive an International Transfer Review Team (ITRT) notice with a case ID, the reason below, and the estimated review time.
              </DialogDescription>
            </DialogHeader>
            {holdDialogTx && (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-3 text-sm flex justify-between">
                  <span className="text-slate-500">
                    {holdDialogTx.reference || `TX #${holdDialogTx.id}`}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {holdDialogTx.currency || 'USD'} {parseFloat(holdDialogTx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    {' → '}{holdDialogTx.recipientName || 'Recipient'}
                  </span>
                </div>
                <div>
                  <Label className="mb-1.5 block">Hold Reason</Label>
                  <Select value={holdReasonPreset} onValueChange={setHoldReasonPreset}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compliance">Routine compliance verification</SelectItem>
                      <SelectItem value="verification">Beneficiary verification required</SelectItem>
                      <SelectItem value="documentation">Supporting documentation required</SelectItem>
                      <SelectItem value="security">Security review of account activity</SelectItem>
                      <SelectItem value="limits">Amount exceeds standard limits</SelectItem>
                      <SelectItem value="custom">Custom reason…</SelectItem>
                    </SelectContent>
                  </Select>
                  {holdReasonPreset === 'custom' && (
                    <Textarea className="mt-2 resize-none" rows={2} placeholder="Describe the reason shown to the customer"
                      value={holdReasonCustom} onChange={(e) => setHoldReasonCustom(e.target.value)} />
                  )}
                </div>
                <div>
                  <Label className="mb-1.5 block">Estimated Review Time</Label>
                  <Select value={holdEta} onValueChange={setHoldEta}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2-4 hours">2-4 hours</SelectItem>
                      <SelectItem value="24-48 hours">24-48 hours</SelectItem>
                      <SelectItem value="1-3 business days">1-3 business days</SelectItem>
                      <SelectItem value="3-5 business days">3-5 business days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="holdCustomMessage">Custom Message (included in email)</Label>
                  <Textarea
                    id="holdCustomMessage"
                    placeholder="Optional message to the customer..."
                    value={txCustomMessage}
                    onChange={(e) => setTxCustomMessage(e.target.value)}
                    className="mt-1.5"
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="actionRequired" checked={holdActionRequired}
                    onCheckedChange={(v) => setHoldActionRequired(Boolean(v))} />
                  <Label htmlFor="actionRequired" className="text-sm font-normal cursor-pointer">
                    Customer action required (email asks them to contact support)
                  </Label>
                </div>
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setHoldDialogTx(null)}>Cancel</Button>
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={submitHold}>
                Place On Hold & Notify
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Transaction Message Dialog */}
        <Dialog open={!!txMessageDialog} onOpenChange={(open) => !open && setTxMessageDialog(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="capitalize">
                Confirm {txMessageDialog ? (txStatusLabels[txMessageDialog.status] || txMessageDialog.status) : ''}
              </DialogTitle>
              <DialogDescription>
                {txMessageDialog && (txMessageDialog.status === 'pending_vat' || txMessageDialog.status === 'pending_imf')
                  ? 'The customer will be emailed that a verification code is required and prompted to contact support. Make sure a code is set for this customer (Users tab → Codes).'
                  : 'You can optionally include a custom message in the notification email sent to the customer.'}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="txCustomMessage">Custom Message (Optional)</Label>
              <Textarea
                id="txCustomMessage"
                placeholder="e.g., Your transfer has been processed successfully."
                value={txCustomMessage}
                onChange={(e) => setTxCustomMessage(e.target.value)}
                className="mt-1.5"
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTxMessageDialog(null)}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={submitTxMessage}>
                Confirm {txMessageDialog ? (txStatusLabels[txMessageDialog.status] || txMessageDialog.status) : ''}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Verification Codes Dialog */}
        <Dialog open={!!codesDialogReg} onOpenChange={(open) => !open && setCodesDialogReg(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-amber-600" /> Verification Codes
              </DialogTitle>
              <DialogDescription>
                Set the VAT and IMF codes for {codesDialogReg?.firstName} {codesDialogReg?.lastName}. These codes are given to the customer by support and entered by them to release a transfer that requires verification.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label className="mb-1.5 block">VAT Clearance Code</Label>
                <div className="flex gap-2">
                  <Input value={codesVat} onChange={(e) => setCodesVat(e.target.value.toUpperCase())}
                    placeholder="e.g. VAT-8F3K2A" className="font-mono" />
                  <Button type="button" variant="outline" onClick={() => setCodesVat(generateCode('VAT'))}>
                    Generate
                  </Button>
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block">IMF Authorization Code</Label>
                <div className="flex gap-2">
                  <Input value={codesImf} onChange={(e) => setCodesImf(e.target.value.toUpperCase())}
                    placeholder="e.g. IMF-4T7Q9Z" className="font-mono" />
                  <Button type="button" variant="outline" onClick={() => setCodesImf(generateCode('IMF'))}>
                    Generate
                  </Button>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Leave a field empty to clear that code. Codes are not case-sensitive when the customer enters them.
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setCodesDialogReg(null)}>Cancel</Button>
              <Button className="bg-amber-600 hover:bg-amber-700" onClick={saveVerificationCodes} disabled={isSavingCodes}>
                {isSavingCodes ? 'Saving…' : 'Save Codes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* KYC Document Viewer Dialog */}
        <Dialog open={!!kycViewerDoc} onOpenChange={(open) => !open && setKycViewerDoc(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" /> {kycViewerDoc?.label}
              </DialogTitle>
              <DialogDescription>
                Submitted by {kycViewerDoc?.customer}. Review the document below or save it to your device.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2 max-h-[60vh] overflow-auto">
              {kycViewerDoc && !kycDocLoadError ? (
                <img
                  src={kycViewerDoc.url}
                  alt={`${kycViewerDoc.label} submitted by ${kycViewerDoc.customer}`}
                  className="max-h-[55vh] w-auto max-w-full rounded object-contain"
                  onError={() => setKycDocLoadError(true)}
                />
              ) : (
                <div className="py-10 text-center text-sm text-slate-500">
                  <p>This document could not be previewed as an image (it may be a PDF).</p>
                  <p className="mt-1">Use the Save button below to download and open it on your device.</p>
                </div>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setKycViewerDoc(null)}>Close</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={downloadKycDoc} disabled={kycDocDownloading}>
                {kycDocDownloading ? 'Saving…' : 'Save to Device'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Loan Decision Dialog */}
        <Dialog open={!!loanDecisionDialog} onOpenChange={(open) => { if (!open) { setLoanDecisionDialog(null); setLoanAdminMessage(''); } }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {loanDecisionDialog?.action === 'approve' ? 'Approve Loan Application' : 'Decline Loan Application'}
              </DialogTitle>
              <DialogDescription>
                {loanDecisionDialog && (
                  <>
                    {loanDecisionDialog.loan.registration?.firstName} {loanDecisionDialog.loan.registration?.lastName} — ${parseFloat(loanDecisionDialog.loan.amount).toFixed(2)} {loanDecisionDialog.loan.currency || 'USD'} · {loanDecisionDialog.loan.termMonths} months · Ref {loanDecisionDialog.loan.reference}
                    {loanDecisionDialog.action === 'approve'
                      ? '. Approving will credit the full loan amount to the customer\u2019s balance, post a transaction, and email them.'
                      : '. The customer will be notified by email that their application was declined.'}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="loan-admin-message">Message to customer (optional)</Label>
              <Textarea
                id="loan-admin-message"
                placeholder={loanDecisionDialog?.action === 'approve'
                  ? 'e.g. Congratulations! Funds are available immediately.'
                  : 'e.g. Insufficient account history. You may re-apply after 90 days.'}
                value={loanAdminMessage}
                onChange={(e) => setLoanAdminMessage(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-slate-500">This message is included in the email sent to the customer.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setLoanDecisionDialog(null); setLoanAdminMessage(''); }}>Cancel</Button>
              <Button
                className={loanDecisionDialog?.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                onClick={() => loanDecisionDialog && handleLoanAction(loanDecisionDialog.loan.id, loanDecisionDialog.action, loanAdminMessage.trim() || undefined)}
                disabled={updatingLoanId !== null}
              >
                {updatingLoanId !== null
                  ? 'Processing…'
                  : loanDecisionDialog?.action === 'approve' ? 'Approve & Credit Funds' : 'Decline Application'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>

      {/* Account status confirmation dialog */}
      <Dialog open={statusConfirm !== null} onOpenChange={(o) => !o && setStatusConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {statusConfirm?.status === 'frozen' ? 'Freeze this account?' : statusConfirm?.status === 'inactive' ? 'Deactivate this account?' : 'Reactivate this account?'}
            </DialogTitle>
            <DialogDescription>
              {statusConfirm?.status === 'frozen' && `${statusConfirm?.name || 'This client'} will not be able to log in or make transfers while the account is frozen. You can unfreeze it at any time.`}
              {statusConfirm?.status === 'inactive' && `${statusConfirm?.name || 'This client'}'s account will be deactivated. They will not be able to log in until you reactivate it.`}
              {statusConfirm?.status === 'approved' && `${statusConfirm?.name || 'This client'} will regain full access to their account.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusConfirm(null)} disabled={isUpdatingStatus}>Cancel</Button>
            <Button
              className={statusConfirm?.status === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : statusConfirm?.status === 'frozen' ? 'bg-sky-600 hover:bg-sky-700' : 'bg-red-600 hover:bg-red-700'}
              disabled={isUpdatingStatus}
              onClick={() => statusConfirm && handleUserStatus(statusConfirm.id, statusConfirm.status)}
            >
              {isUpdatingStatus ? 'Updating…' : statusConfirm?.status === 'frozen' ? 'Yes, Freeze' : statusConfirm?.status === 'inactive' ? 'Yes, Deactivate' : 'Yes, Reactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
