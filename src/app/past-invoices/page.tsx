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
    <>
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <h1>Loading</h1>
        </div>
      ) : (
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0 mb-6">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Past Invoices</h1>
            </div>
            <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search invoices..."
                  className="pl-8 w-full md:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="w-[150px] cursor-pointer"
                    onClick={() => requestSort("invoiceNumber")}
                  >
                    <div className="flex items-center">
                      Invoice #
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => requestSort("date")}
                  >
                    <div className="flex items-center">
                      Date
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Event Name</TableHead>
                  <TableHead
                    className="text-right cursor-pointer"
                    onClick={() => requestSort("total")}
                  >
                    <div className="flex items-center justify-end">
                      Estimate
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Preview</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedInvoices.length > 0 ? (
                  sortedInvoices.map((invoice) => (
                    <TableRow key={invoice.invoiceNumber}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {invoice.customerName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.eventDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{invoice.eventName}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{invoice.total.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/past-invoices/${invoice.invoiceNumber}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No invoices found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </>
  );
}
