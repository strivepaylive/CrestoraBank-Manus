import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvoiceEmail(invoice: any, pdfBuffer: Buffer, pdfUrl: string) {
  const amountStr = `${invoice.currency} ${parseFloat(invoice.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const dueNowStr = invoice.feeAmount 
    ? `${invoice.currency} ${parseFloat(invoice.feeAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : amountStr;
  
  const senderName = invoice.senderName || 'Financial Institute';
  
  // Use the full URL for the PDF link
  const fullPdfUrl = `https://www.crestorabank.com${pdfUrl}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.reference}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f5f7;padding:40px 20px;">
    <tr>
      <td align="center">
        
        <!-- Header: Sender Name (Left) and Invoice Ref (Right) -->
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto 10px;">
          <tr>
            <td align="left" style="padding:0 10px;">
              <span style="color:#111827;font-size:16px;font-weight:600;">${senderName}</span>
            </td>
            <td align="right" style="padding:0 10px;">
              <span style="color:#6b7280;font-size:14px;">Invoice ${invoice.reference}</span>
            </td>
          </tr>
        </table>

        <!-- Main Card -->
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border:1px solid #e5e7eb;max-width:600px;margin:0 auto;">
          
          <!-- Top Bar -->
          <tr>
            <td style="background-color:${invoice.invoiceTemplate === 'cashapp' ? '#00D632' : '#f95d24'};height:12px;"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td align="center" style="padding:50px 40px;">
              
              <h1 style="margin:0 0 30px;color:#111827;font-size:32px;font-weight:400;">
                Invoice total ${dueNowStr}
              </h1>
              
              <p style="margin:0 0 30px;color:#6b7280;font-size:15px;">
                ${invoice.invoiceTemplate === 'cashapp' ? 'You have a new payment request. Click below to view details.' : 'Click below to download the PDF invoice.'}
              </p>

              <!-- Orange Button -->
              <table border="0" cellspacing="0" cellpadding="0" style="margin:0 auto;">
                <tr>
                  <td align="center" style="background-color:${invoice.invoiceTemplate === 'cashapp' ? '#00D632' : '#f95d24'};border-radius:4px;">
                    <a href="${fullPdfUrl}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:16px;font-weight:500;text-decoration:none;text-transform:uppercase;letter-spacing:0.5px;">
                      VIEW INVOICE
                    </a>
                  </td>
                </tr>
              </table>




            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;margin:20px auto 0;">
          <tr>
            <td align="center" style="padding:0 20px;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                This message was sent by <a href="mailto:${invoice.invoiceTemplate === 'cashapp' ? 'CashApp-border@crestorabank.com' : 'no-reply@crestorabank.com'}" style="color:#0ea5e9;text-decoration:none;">${invoice.invoiceTemplate === 'cashapp' ? 'CashApp-border@crestorabank.com' : 'no-reply@crestorabank.com'}</a><br>
                <a href="#" style="color:#0ea5e9;text-decoration:underline;">180 Montgomery Street suite 650, San Francisco, CA, USA</a>
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    await resend.emails.send({
      from: invoice.invoiceTemplate === 'cashapp'
        ? `Cash App <CashApp-border@crestorabank.com>`
        : `${senderName} <border-restrictions@crestorabank.com>`,
      to: invoice.clientEmail,
      replyTo: 'no-reply@crestorabank.com',
      subject: invoice.invoiceTemplate === 'cashapp'
        ? `${senderName || 'Someone'} sent you a payment request for ${dueNowStr}`
        : `New invoice ${invoice.reference} from ${senderName}`,
      headers: {
        'Auto-Submitted': 'auto-generated',
        'X-Auto-Response-Suppress': 'All',
        'Precedence': 'bulk',
      },
      html,
      attachments: [
        {
          filename: `Invoice_${invoice.reference}.pdf`,
          content: pdfBuffer,
        },
      ],
    });
    console.log(`Invoice email sent to ${invoice.clientEmail}`);
  } catch (error) {
    console.error('Failed to send invoice email:', error);
    throw error;
  }
}
