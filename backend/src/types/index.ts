export interface Template {
  id: string;
  name: string;
  description: string;
  content: TemplateContent;
  logo_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface TemplateContent {
  elements: CanvasElement[];
  pageSize: {
    width: number;
    height: number;
  };
  fonts: FontConfig[];
}

export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'rectangle' | 'line' | 'field';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  fill?: string;
  stroke?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  text?: string;
  src?: string;
  fieldName?: string; // for dynamic fields like {invoice_number}
  opacity?: number;
}

export interface FontConfig {
  family: string;
  url: string;
}

export interface Invoice {
  id: string;
  template_id: string;
  invoice_number: string;
  customer_id: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid';
  issue_date: Date;
  due_date: Date;
  data: InvoiceData;
  created_at: Date;
  updated_at: Date;
}

export interface InvoiceData {
  company_name: string;
  company_address: string;
  customer_name: string;
  customer_email: string;
  customer_address: string;
  line_items: LineItem[];
  notes?: string;
  [key: string]: any;
}

export interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  address: string;
  phone?: string;
  created_at: Date;
}

export interface SESEmailParams {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
  }>;
}
