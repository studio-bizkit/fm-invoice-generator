"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { InvoiceFormData } from "@/lib/types";

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Item, InputData, OutputGroup } from "@/lib/types";

export default function InvoicePreviewPage({
  onPdfReady,
  invoice,
}: {
  onPdfReady: (url: string) => void;
  invoice: any;
}) {
  const router = useRouter();
  const [invoiceData, setInvoiceData] = useState<InvoiceFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedPdfUrl, setSavedPdfUrl] = useState<string | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // 1. Load invoice data
  useEffect(() => {
    setInvoiceData(invoice);
    if (!invoice) return;

    setIsLoading(false);
  }, []);

  // 2. Auto-generate PDF once data is ready
  useEffect(() => {
    if (invoiceData && !isGenerating && !savedPdfUrl) {
      generatePDF();
    }
  }, [invoiceData]);

  // Subtotal
  const calculateSubtotal = () => {
    if (!invoiceData) return 0;
    return invoiceData.items.reduce((total, item) => {
      return total + item.quantity * item.unitPrice;
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal();
  };

  // Data preprocessing
  function preprocessItems(data: InputData): OutputGroup[] {
    const grouped: Record<string, [string, string][]> = {};
    data.items.forEach(({ description, quantity, type }) => {
      const groupKey = type.toUpperCase();
      if (!grouped[groupKey]) grouped[groupKey] = [];
      grouped[groupKey].push([description, quantity.toString()]);
    });

    return Object.entries(grouped).map(([title, rows]) => ({ title, rows }));
  }

  function formatDaysOfShoot(days: number): string {
    const map: Record<number, string> = {
      1: "ONE DAY",
      2: "TWO DAYS",
      3: "THREE DAYS",
      4: "FOUR DAYS",
      5: "FIVE DAYS",
      6: "SIX DAYS",
      7: "SEVEN DAYS",
    };
    return map[days] || `${days} DAYS`;
  }

  // 3. Generate and preview PDF
  const generatePDF = async () => {
    if (!invoiceData) return;
    setIsGenerating(true);

    try {
      const [frontBytes, estimateBytes, deliverableBytes, lastBytes] =
        await Promise.all([
          fetch("/templates/front.pdf").then((res) => res.arrayBuffer()),
          fetch("/templates/estimate.pdf").then((res) => res.arrayBuffer()),
          fetch("/templates/deliverable.pdf").then((res) => res.arrayBuffer()),
          fetch("/templates/last.pdf").then((res) => res.arrayBuffer()),
        ]);

      const [frontPdf, estimatePdf, deliverablePdf, lastPdf] =
        await Promise.all([
          PDFDocument.load(frontBytes),
          PDFDocument.load(estimateBytes),
          PDFDocument.load(deliverableBytes),
          PDFDocument.load(lastBytes),
        ]);

      const mergedPdf = await PDFDocument.create();
      const font = await mergedPdf.embedFont(StandardFonts.TimesRoman);
      const totalFont = await mergedPdf.embedFont(StandardFonts.HelveticaBold);

      const [frontPage] = await mergedPdf.copyPages(frontPdf, [0]);
      mergedPdf.addPage(frontPage);
      const [aboutPage] = await mergedPdf.copyPages(frontPdf, [1]);
      mergedPdf.addPage(aboutPage);
      const [estimatePage] = await mergedPdf.copyPages(estimatePdf, [0]);
      mergedPdf.addPage(estimatePage);

      const fontSize = 26;
      const startX = 160;
      let cursorY = 870;

      const drawText = (text: string, x: number, y: number, options = {}) => {
        estimatePage.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(47 / 255, 58 / 255, 51 / 255),
          ...options,
        });
      };

      const itemData = preprocessItems({ items: invoiceData.items });

      itemData.forEach((group) => {
        drawText(group.title, startX, cursorY);
        cursorY -= 45;

        group.rows.forEach(([desc, qty]) => {
          drawText(desc, startX + 15, cursorY);
          drawText(qty, 620, cursorY);
          cursorY -= 37;
        });

        cursorY -= 20;
      });

      const total = calculateTotal();
      drawText(
        `TOTAL (${formatDaysOfShoot(invoiceData.daysOfShoot)})`,
        startX + 100,
        cursorY
      );
      cursorY -= 35;
      drawText(`${total.toLocaleString("en-IN")}`, startX + 150, cursorY, {
        font: totalFont,
      });

      // Deliverables
      const [deliverablePage] = await mergedPdf.copyPages(deliverablePdf, [0]);
      mergedPdf.addPage(deliverablePage);

      let currentY = 870 - 120;
      const lineFontSize = 32;
      for (const line of invoiceData.deliverables) {
        const textWidth = font.widthOfTextAtSize(line, lineFontSize);
        const textX = (800 - textWidth) / 2;

        deliverablePage.drawText(line, {
          x: textX,
          y: currentY,
          size: lineFontSize,
          font,
          color: rgb(47 / 255, 58 / 255, 51 / 255),
        });

        currentY -= 55;
      }

      const [lastPage] = await mergedPdf.copyPages(lastPdf, [0]);
      mergedPdf.addPage(lastPage);

      const finalBytes = await mergedPdf.save();
      const blob = new Blob([finalBytes], { type: "application/pdf" });

      const previewUrl = URL.createObjectURL(blob);
      setSavedPdfUrl(previewUrl);
      onPdfReady(previewUrl);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }

    setIsGenerating(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Loading invoice preview...
          </p>
        </div>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">
            No invoice data found.
          </p>
          <Link href="/new-invoice" className="mt-4 inline-block">
            <Button>Create New Invoice</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {savedPdfUrl && (
        <div className="container mx-auto py-8 px-4">
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">PDF Preview</h2>
            <iframe
              src={savedPdfUrl}
              width="100%"
              height="800px"
              className="border rounded shadow"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
