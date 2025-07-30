"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Invoice } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ArrowLeft, Search, ArrowUpDown } from "lucide-react";
import { getPastInvoices } from "@/lib/data";

export const metadata = {
  title: "Past Invoices | FM Studios",
  description: "View and manage your past invoices.",
  openGraph: {
    title: "Past Invoices | FM Studios",
    description: "View and manage your past invoices.",
    images: [
      {
        url: "https://i.ibb.co/BH6FQDXf/Screenshot-2025-07-30-191859.jpg",
        width: 1200,
        height: 630,
        alt: "FM Studios Invoice Generator Thumbnail",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Past Invoices | FM Studios",
    description: "View and manage your past invoices.",
    images: ["https://i.ibb.co/BH6FQDXf/Screenshot-2025-07-30-191859.jpg"],
  },
};

export default function PastInvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Invoice | null;
    direction: "asc" | "desc";
  }>({
    key: null,
    direction: "asc",
  });
  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const response = await getPastInvoices();
        if (!response.message) {
          // console.error("Error fetching invoices:", response.data);
        } else {
          setInvoices(response.data as Invoice[]);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // Filter invoices based on search term and status
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = invoice.customerName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Sort invoices
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue =
      sortConfig.key === "date"
        ? new Date(a[sortConfig.key]).getTime()
        : sortConfig.key === "total"
        ? a[sortConfig.key]
        : a.invoiceNumber;

    const bValue =
      sortConfig.key === "date"
        ? new Date(b[sortConfig.key]).getTime()
        : sortConfig.key === "total"
        ? b[sortConfig.key]
        : b.invoiceNumber;

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Handle sort
  const requestSort = (key: keyof Invoice) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "overdue":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {loading ? (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-muted-foreground font-light">Loading...</div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Header Section */}
          <div className="flex flex-col space-y-6 sm:space-y-8 mb-8 sm:mb-10">
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <Button 
                    variant="outline" 
                    className="h-12 w-12 p-0 border hover:bg-muted/50 transition-colors touch-manipulation"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <h1 className="text-3xl font-light tracking-wide">Past Invoices</h1>
              </div>
              
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search invoices..."
                  className="pl-10 h-12 w-full sm:w-[280px] border hover:border-muted-foreground/50 transition-colors font-normal"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border">
                    <TableHead
                      className="cursor-pointer font-normal text-muted-foreground hover:text-foreground transition-colors h-12"
                      onClick={() => requestSort("invoiceNumber")}
                    >
                      <div className="flex items-center">
                        Invoice #
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="font-normal text-muted-foreground h-12">Customer</TableHead>
                    <TableHead
                      className="cursor-pointer font-normal text-muted-foreground hover:text-foreground transition-colors h-12"
                      onClick={() => requestSort("date")}
                    >
                      <div className="flex items-center">
                        Date
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="font-normal text-muted-foreground h-12">Event Name</TableHead>
                    <TableHead
                      className="text-right cursor-pointer font-normal text-muted-foreground hover:text-foreground transition-colors h-12"
                      onClick={() => requestSort("total")}
                    >
                      <div className="flex items-center justify-end">
                        Estimate
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-normal text-muted-foreground h-12">Preview</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedInvoices.length > 0 ? (
                    sortedInvoices.map((invoice) => (
                      <TableRow key={invoice.invoiceNumber} className="hover:bg-muted/30 transition-colors border-b border-border/50">
                        <TableCell className="font-normal h-16">
                          {invoice.invoiceNumber}
                        </TableCell>
                        <TableCell className="h-16">
                          <div className="font-normal">
                            {invoice.customerName}
                          </div>
                        </TableCell>
                        <TableCell className="font-normal text-muted-foreground h-16">
                          {new Date(invoice.eventDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="h-16">
                          <div className="font-normal">{invoice.eventName}</div>
                        </TableCell>
                        <TableCell className="text-right font-normal h-16">
                          ₹{invoice.total.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right h-16">
                          <Link href={`/past-invoices/${invoice.invoiceNumber}`}>
                            <Button 
                              variant="outline" 
                              className="h-10 px-4 text-sm font-normal border hover:bg-muted/50 transition-colors touch-manipulation"
                            >
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground font-light">
                        No invoices found matching your criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}