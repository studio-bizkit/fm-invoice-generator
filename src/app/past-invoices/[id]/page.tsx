"use client";

import { use, useEffect, useState } from "react";
import InvoicePreviewPage from "@/components/preview";
import { getPastInvoices } from "@/lib/data";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PreviewPastInvoice({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: invoiceNumber } = use(params);
  const [invoice, setInvoice] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchInvoice() {
      const response = await getPastInvoices();
      if (response.message) {
        const result = response.data.find(
          (inv: any) => String(inv.invoiceNumber) === String(invoiceNumber)
        );
        if (result) setInvoice(result);
        else notFound();
      }
      setLoading(false);
    }

    fetchInvoice();
  }, [invoiceNumber]);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><div className="text-muted-foreground font-light">Loading...</div></div>;

  if (!invoice) return <div className="flex min-h-screen items-center justify-center bg-background"><div className="text-muted-foreground font-light">Invoice not found. {invoice}</div></div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/past-invoices")}
            className="w-fit h-12 px-4 text-base font-normal border hover:bg-muted/50 transition-colors touch-manipulation flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {pdfUrl && (
            <a
              href={pdfUrl}
              download="final_document.pdf"
              className="w-fit h-12 px-4 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity font-normal text-base touch-manipulation"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </a>
          )}
        </div>

        {/* PDF Viewer */}
        <div className="w-full border border-border rounded-lg overflow-hidden">
          <InvoicePreviewPage
            invoice={invoice}
            onPdfReady={(url: string) => setPdfUrl(url)}
          />
        </div>
      </div>
    </div>
  );
}