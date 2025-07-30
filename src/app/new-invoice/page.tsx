"use client";

import { useState } from "react";
import { Stepper } from "@/components/ui/stepper";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import InvoicePreviewPage from "@/components/preview";
import type { Invoice, InvoiceFormData } from "@/lib/types";
import invoiceFormSchema from "@/lib/schema";
import { createInvoice } from "@/lib/data";
import Link from "next/link";

// Stepper steps configuration
const steps = [
  { title: "Client Details" },
  { title: "Estimate and Invoice Details" },
  { title: "Preview" },
];

export const metadata = {
  title: "Create New Invoice | FM Studios",
  description: "Generate professional invoices in simple steps.",
  openGraph: {
    title: "Create New Invoice | FM Studios",
    description: "Generate professional invoices in simple steps.",
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
    title: "Create New Invoice | FM Studios",
    description: "Generate professional invoices in simple steps.",
    images: ["https://i.ibb.co/BH6FQDXf/Screenshot-2025-07-30-191859.jpg"],
  },
};

export default function StepperDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [invoiceData, setInvoiceData] = useState<InvoiceFormData | null>(null);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Initialize form with default values
  const form = useForm<z.infer<typeof invoiceFormSchema>>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      eventName: "",
      eventDate: new Date().toISOString().split("T")[0],
      daysOfShoot: 1,
      invoiceDate: new Date().toISOString().split("T")[0],
      items: [{ description: "", quantity: 1, unitPrice: 0, type: "" }],
      deliverables: [{ name: "" }],
    },
  });

  // Destructure useFieldArray for items
  const {
    fields: deliverableFields,
    append: appendDeliverable,
    remove: removeDeliverable,
  } = useFieldArray({
    control: form.control,
    name: "deliverables",
  });

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Calculate total amount for invoice items
  const calculateTotal = () => {
    const items = form.watch("items");
    return items.reduce((total, item) => {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice);
      return (
        total +
        (isNaN(quantity) ? 0 : quantity) * (isNaN(unitPrice) ? 0 : unitPrice)
      );
    }, 0);
  };

  // Handle form submission
  const onSubmit = (data: z.infer<typeof invoiceFormSchema>) => {
    setIsSubmitting(true);

    const invoice: InvoiceFormData = {
      ...data,
      items: data.items.map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
      deliverables: data.deliverables.map((item) => item.name.trim()),
    };
    setInvoiceData(invoice);

    handleNextStep();
  };

  // Handle navigation to the next step
  const handleNextStep = async () => {
    let isValid = false;
    if (currentStep === 0) {
      isValid = await form.trigger([
        "customerName",
        "customerPhone",
        "customerAddress",
      ]);
    } else if (currentStep === 1) {
      isValid = await form.trigger([
        "eventName",
        "eventDate",
        "invoiceDate",
        "items",
        "deliverables",
      ]);
    } else if (currentStep === 2) {
      isValid = true;
    }

    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => prev - 1);
    setIsSubmitting(false);
  };

  const handleSaveAndDownload = async () => {
    const response = await createInvoice({
      ...invoiceData,
      total: calculateTotal(),
    });
    if (response) {
      router.push("/");
    } else {
      alert("error");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl font-light tracking-wide mb-2">Create New Invoice</h1>
          <p className="text-muted-foreground font-light">Generate professional invoices in simple steps</p>
        </div>
        
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
        />
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-8 sm:mt-12">
            {currentStep === 0 && (
              <div className="flex justify-center">
                <div className="w-full max-w-xl">
                  <Card className="border border-border">
                    <CardHeader className="pb-6">
                      <CardTitle className="text-xl font-normal">Customer Information</CardTitle>
                      <CardDescription className="font-light">
                        Enter the customer details for this invoice.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Customer Name */}
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-normal text-muted-foreground">Customer Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="John Doe" 
                                className="h-12 border hover:border-muted-foreground/50 transition-colors font-normal" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Phone */}
                      <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-normal text-muted-foreground">Phone</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="9876543210" 
                                className="h-12 border hover:border-muted-foreground/50 transition-colors font-normal" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Address */}
                      <FormField
                        control={form.control}
                        name="customerAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-normal text-muted-foreground">Address</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="123 Main St, City, Country"
                                className="min-h-[100px] border hover:border-muted-foreground/50 transition-colors font-normal resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter className="pt-6">
                      <Button 
                        type="button" 
                        onClick={handleNextStep}
                        className="w-full h-12 font-normal hover:opacity-90 transition-opacity"
                      >
                        Next
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Event Details */}
                  <Card className="border border-border">
                    <CardHeader className="pb-6">
                      <CardTitle className="text-xl font-normal">Event Details</CardTitle>
                      <CardDescription className="font-light">
                        Enter the event information.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="eventName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-normal text-muted-foreground">Event Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Wedding Ceremony" 
                                className="h-12 border hover:border-muted-foreground/50 transition-colors font-normal"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="eventDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-normal text-muted-foreground">Event Date</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                className="h-12 border hover:border-muted-foreground/50 transition-colors font-normal"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="daysOfShoot"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-normal text-muted-foreground">No. of Days</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="1" 
                                className="h-12 border hover:border-muted-foreground/50 transition-colors font-normal"
                                {...field}
                                onChange={e => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Deliverables */}
                  <Card className="border border-border">
                    <CardHeader className="pb-6">
                      <CardTitle className="text-xl font-normal">Deliverables</CardTitle>
                      <CardDescription className="font-light">
                        List the deliverable items included.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {deliverableFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex gap-3 items-end"
                        >
                          <div className="flex-1">
                            <FormField
                              control={form.control}
                              name={`deliverables.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-normal text-muted-foreground">Deliverable Item</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g., Two Albums, Softcopy"
                                      className="h-12 border hover:border-muted-foreground/50 transition-colors font-normal"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-12 w-12 border hover:bg-muted/50 transition-colors touch-manipulation"
                            onClick={() => removeDeliverable(index)}
                            disabled={deliverableFields.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => appendDeliverable({ name: "" })}
                        className="w-full h-12 border hover:bg-muted/50 transition-colors font-normal touch-manipulation"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Deliverable
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Invoice Items */}
                <Card className="border border-border">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-xl font-normal">Estimate Details</CardTitle>
                    <CardDescription className="font-light">
                      Estimate of shoots and cost.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="w-full max-w-xs">
                      <FormField
                        control={form.control}
                        name="invoiceDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-normal text-muted-foreground">Invoice Date</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                className="h-12 border hover:border-muted-foreground/50 transition-colors font-normal"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Dynamic Invoice Items */}
                    <div className="space-y-6">
                      {itemFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 p-4 border border-border/50 rounded-lg"
                        >
                          <div className="sm:col-span-2 lg:col-span-4">
                            <FormField
                              control={form.control}
                              name={`items.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-normal text-muted-foreground">Description</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="HD Album" 
                                      className="h-12 border hover:border-muted-foreground/50 transition-colors font-normal"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="sm:col-span-2 lg:col-span-3">
                            <FormField
                              control={form.control}
                              name={`items.${index}.type`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-normal text-muted-foreground">Type</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Reception" 
                                      className="h-12 border hover:border-muted-foreground/50 transition-colors font-normal"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="lg:col-span-2">
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-normal text-muted-foreground">Quantity</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="1"
                                      className="h-12 border hover:border-muted-foreground/50 transition-colors font-normal"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(Number(e.target.value))
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="lg:col-span-2">
                            <FormField
                              control={form.control}
                              name={`items.${index}.unitPrice`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-normal text-muted-foreground">Unit Price (₹)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      className="h-12 border hover:border-muted-foreground/50 transition-colors font-normal"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(Number(e.target.value))
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="lg:col-span-1 flex items-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-12 w-12 border hover:bg-muted/50 transition-colors touch-manipulation"
                              onClick={() => removeItem(index)}
                              disabled={itemFields.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        appendItem({
                          description: "",
                          quantity: 1,
                          unitPrice: 0,
                          type: "",
                        })
                      }
                      className="w-full h-12 border hover:bg-muted/50 transition-colors font-normal touch-manipulation"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>

                    <div className="flex justify-end pt-4">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground font-light">
                          Total Amount
                        </div>
                        <div className="text-2xl font-light">
                          ₹{calculateTotal().toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreviousStep}
                      className="w-full sm:w-auto h-12 px-6 border hover:bg-muted/50 transition-colors font-normal touch-manipulation"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" /> Previous
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full sm:w-auto h-12 px-6 font-normal hover:opacity-90 transition-opacity touch-manipulation"
                    >
                      {isSubmitting ? "Processing..." : "Preview Invoice"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}
          </form>
        </Form>
        
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviousStep}
                className="w-full sm:w-auto h-12 px-6 border hover:bg-muted/50 transition-colors font-normal touch-manipulation"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Previous
              </Button>
              {pdfUrl && (
                <a
                  href={pdfUrl}
                  download="final_document.pdf"
                  onClick={handleSaveAndDownload}
                  className="w-full sm:w-auto h-12 px-6 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity font-normal touch-manipulation"
                >
                  <Download className="h-4 w-4" />
                  Download PDF & Save
                </a>
              )}
              <Link href="/" className="w-full sm:w-auto">
                <Button
                  type="button"
                  variant="secondary"
                  className="h-12 px-6 font-normal ml-0 sm:ml-4 mt-4 sm:mt-0"
                >
                  Back to Home
                </Button>
              </Link>
            </div>
            
            <div className="border border-border rounded-lg overflow-hidden">
              <InvoicePreviewPage
                onPdfReady={(url: string) => setPdfUrl(url)}
                invoice={invoiceData}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}