'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, ArrowLeft, Loader2, Printer } from 'lucide-react';
import { toast } from 'sonner';

interface InvoiceToolbarProps {
  orderId: string;
}

export function InvoiceToolbar({ orderId }: { orderId: string }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);

      // Dynamically import to avoid server-side packaging errors
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas-pro')).default;

      const element = document.getElementById('invoice-sheet');
      if (!element) {
        toast.error('Invoice preview sheet not found.');
        return;
      }

      // Convert the HTML element to a canvas image
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution scale
        useCORS: true, // Allow remote assets
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add the first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Append new pages if content extends beyond A4 length
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const shortId = orderId.split('-')[0].toUpperCase();
      pdf.save(`invoice_INV-${shortId}.pdf`);
      toast.success('Invoice PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. You can still print or save using the Print option.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl bg-white border border-neutral-200 rounded-xl px-5 py-3 mb-6 flex items-center justify-between shadow-sm print:hidden">
      <Link
        href={`/orders/${orderId}`}
        className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 font-semibold transition"
      >
        <ArrowLeft size={16} />
        Back to Order Details
      </Link>
      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-primary-600 hover:bg-brand-primary-500 disabled:opacity-50 text-white rounded-lg transition font-semibold text-sm active:scale-95 shadow-sm"
        >
          {downloading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download size={16} />
              Download PDF
            </>
          )}
        </button>
        <button
          onClick={() => {
            if (typeof window !== 'undefined') window.print();
          }}
          className="flex items-center gap-1.5 px-4 py-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-lg transition font-semibold text-sm active:scale-95 shadow-sm"
        >
          <Printer size={16} />
          Print
        </button>
      </div>
    </div>
  );
}
