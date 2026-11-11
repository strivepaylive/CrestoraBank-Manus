import { z } from 'zod';
import { adminProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { invoices } from '../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { generateInvoicePdf } from '../invoicePdf';
import { sendInvoiceEmail } from '../invoiceEmail';
import { storagePut } from '../storage';

export const invoicesRouter = router({
  list: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }),

  createAndSend: adminProcedure
    .input(
      z.object({
        clientName: z.string().min(1),
        clientEmail: z.string().email(),
        accountNumber: z.string().min(1),
        bankName: z.string().min(1),
        amount: z.number().min(1), // in cents
        currency: z.string().default('USD'),
        description: z.string().min(1),
        dueDate: z.number(),
        customMessage: z.string().optional(),
        topLogoUrl: z.string().optional(),
        bottomLogoUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // Generate reference
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
      const reference = `ESCROW TAX-${Math.floor(Math.random() * 90 + 10)}`;
      // Filename-safe reference (no spaces — spaces in S3 keys break presigned URLs)
      const referenceSlug = reference.replace(/[^A-Za-z0-9._-]+/g, '-');

      // Insert draft
      const [result] = await db.insert(invoices).values({
        ...input, amount: input.amount.toString(),
        reference,
        status: 'draft',
        dueDate: new Date(input.dueDate),
      });

      const invoiceId = result.insertId;
      const [invoice] = await db.select().from(invoices).where(eq(invoices.id, invoiceId));

      // Generate PDF
      const pdfBuffer = await generateInvoicePdf(invoice);

      // Upload PDF to S3
      const pdfKey = `invoices/${referenceSlug}.pdf`;
      const { url: pdfUrl } = await storagePut(pdfKey, pdfBuffer, 'application/pdf');

      // Update invoice with PDF URL and mark as sent
      await db.update(invoices)
        .set({ pdfUrl, status: 'sent' })
        .where(eq(invoices.id, invoiceId));

      // Send Email
      await sendInvoiceEmail(invoice, pdfBuffer, pdfUrl);

      return { success: true, reference, pdfUrl };
    }),

  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(['draft', 'sent', 'paid', 'overdue']),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      await db.update(invoices)
        .set({ status: input.status })
        .where(eq(invoices.id, input.id));
      return { success: true };
    }),
});
