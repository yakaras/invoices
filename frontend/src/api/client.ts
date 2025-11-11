import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Invoices
  getInvoices: (params?: any) => client.get('/invoices', { params }),
  getInvoice: (id: string) => client.get(`/invoices/${id}`),
  createInvoice: (data: any) => client.post('/invoices', data),
  updateInvoice: (id: string, data: any) => client.put(`/invoices/${id}`, data),
  deleteInvoice: (id: string) => client.delete(`/invoices/${id}`),
  downloadInvoicePDF: (id: string) =>
    client.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
  sendInvoiceEmail: (id: string, data: any) =>
    client.post(`/invoices/${id}/send`, data),

  // Templates
  getTemplates: () => client.get('/templates'),
  getTemplate: (id: string) => client.get(`/templates/${id}`),
  createTemplate: (data: any) => client.post('/templates', data),
  updateTemplate: (id: string, data: any) => client.put(`/templates/${id}`, data),
  deleteTemplate: (id: string) => client.delete(`/templates/${id}`),

  // Customers
  getCustomers: () => client.get('/customers'),
  getCustomer: (id: string) => client.get(`/customers/${id}`),
  createCustomer: (data: any) => client.post('/customers', data),
  updateCustomer: (id: string, data: any) => client.put(`/customers/${id}`, data),
  deleteCustomer: (id: string) => client.delete(`/customers/${id}`),

  // Settings
  getSettings: () => client.get('/settings'),
  updateSettings: (data: any) => client.post('/settings', data),
};

export default client;
