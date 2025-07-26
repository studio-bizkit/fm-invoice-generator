export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  eventName: String;
  deliverables: [];
  eventDate: Date;
  items: InvoiceItem[];
  total: number;
}
export interface InvoiceFormData {
  customerName: string;
  customerPhone: string;
  eventName: string;
  eventDate: string;
  daysOfShoot: number;
  invoiceDate: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    type: string;
  }[];
  deliverables: string[];
}

export type Item = {
  description: string;
  quantity: number;
  unitPrice?: number;
  type: string;
};

export type InputData = {
  items: Item[];
};

export type OutputGroup = {
  title: string;
  rows: [string, string][];
};
