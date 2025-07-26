import { z } from "zod";

const invoiceFormSchema = z.object({
  customerName: z.string().min(2, { message: "Customer name is required" }),
  customerPhone: z
    .string()
    .length(10, { message: "Phone number should be 10 digits" })
    .regex(/^\d+$/, { message: "Phone number must contain only digits" }), // Added regex for digits only
  customerAddress: z.string().min(5, { message: "Address is required" }),
  invoiceDate: z.string().min(1, { message: "Date is required" }),
  eventName: z.string().min(3, { message: "Event Name is required" }),
  eventDate: z.string().min(1, { message: "Event Date is required" }),
  daysOfShoot: z.number().min(1), // Made optional as per initial default, consider making it number if calculations are involved
  items: z
    .array(
      z.object({
        description: z.string().min(1, { message: "Description is required" }),
        quantity: z.coerce
          .number()
          .min(1, { message: "Quantity must be at least 1" }),
        unitPrice: z.coerce
          .number()
          .min(0, { message: "Price must be a positive number" }),
        type: z.string().min(1, { message: "Type is required" }),
      })
    )
    .min(1, { message: "At least one item is required" }),
  deliverables: z.array(
    z.object({
      name: z.string().min(3),
    })
  ),
});

export default invoiceFormSchema;
