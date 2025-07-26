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

  if (loading) return <div>Loading...</div>;

  if (!invoice) return <div>Invoice not found. {invoice}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Row */}
      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/past-invoices")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {pdfUrl && (
          <a
            href={pdfUrl}
            download="final_document.pdf"
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </a>
        )}
      </div>

      {/* PDF Viewer */}
      <div className="w-full border rounded overflow-hidden shadow">
        <InvoicePreviewPage
          invoice={invoice}
          onPdfReady={(url: string) => setPdfUrl(url)}
        />
      </div>
    </div>
  );
}
