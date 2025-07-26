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

// Stepper steps configuration
const steps = [
  { title: "Client Details" },
  { title: "Estimate and Invoice Details" },
  { title: "Preview" },
];

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
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8 text-center">
        Create New Invoice
      </h1>
      <Stepper
        steps={steps}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-8">
          {currentStep === 0 && (
            <div className="flex justify-center">
              <div className="w-full max-w-xl">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Information</CardTitle>
                    <CardDescription>
                      Enter the customer details for this invoice.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Customer Name */}
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
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
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="9876543210" {...field} />
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
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="123 Main St, City, Country"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button type="button" onClick={handleNextStep}>
                      Next
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Event Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Event Details</CardTitle>
                    <CardDescription>
                      Enter the event information.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="eventName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Wedding Ceremony" {...field} />
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
                          <FormLabel>Event Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
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
                          <FormLabel>No. of Days</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Deliverables */}
                <Card>
                  <CardHeader>
                    <CardTitle>Deliverables</CardTitle>
                    <CardDescription>
                      List the deliverable items included.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {deliverableFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-12 gap-4 items-end"
                      >
                        <div className="col-span-10">
                          <FormField
                            control={form.control}
                            name={`deliverables.${index}.name`} // Corrected field name
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Deliverable Item</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., Two Albums, Softcopy"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-span-2">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeDeliverable(index)}
                            disabled={deliverableFields.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendDeliverable({ name: "" })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Deliverable
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Invoice Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Estimate Details</CardTitle>
                  <CardDescription>
                    Estimate of shoots and cost.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-2">
                      <FormField
                        control={form.control}
                        name="invoiceDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Invoice Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Dynamic Invoice Items */}
                  {itemFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-12 gap-4 items-end"
                    >
                      <div className="col-span-12 md:col-span-4">
                        <FormField
                          control={form.control}
                          name={`items.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Input placeholder="HD Album" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-6 md:col-span-3">
                        <FormField
                          control={form.control}
                          name={`items.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type</FormLabel>
                              <FormControl>
                                <Input placeholder="Reception" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
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

                      <div className="col-span-6 md:col-span-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.unitPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit Price (₹)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
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
                      <div className="col-span-6 md:col-span-1">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeItem(index)}
                          disabled={itemFields.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() =>
                      appendItem({
                        description: "",
                        quantity: 1,
                        unitPrice: 0,
                        type: "",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>

                  <div className="flex justify-end mt-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        Total Amount
                      </div>
                      <div className="text-2xl font-bold">
                        ₹{calculateTotal().toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreviousStep}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Previous
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Processing..." : "Preview Invoice"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </form>
      </Form>
      {currentStep === 2 && (
        <div>
          <div className="mt-6 flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={handlePreviousStep}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Previous
            </Button>

            {pdfUrl && (
              <a
                href={pdfUrl}
                download="final_document.pdf"
                onClick={handleSaveAndDownload}
                className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition"
              >
                <Download className="h-4 w-4" />
                Download PDF & Finish
              </a>
            )}
          </div>
          <InvoicePreviewPage
            onPdfReady={(url: string) => setPdfUrl(url)}
            invoice={invoiceData}
          />
        </div>
      )}
    </div>
  );
}
