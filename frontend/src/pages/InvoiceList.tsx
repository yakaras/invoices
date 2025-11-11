import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import toast from 'react-hot-toast';
import { Plus, Download, Send, Trash2 } from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

const InvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, [search, statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const response = await api.getInvoices(params);
      setInvoices(response.data.invoices);
    } catch (error) {
      toast.error('Failed to load invoices');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (id: string, number: string) => {
    try {
      const response = await api.downloadInvoicePDF(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success('Invoice downloaded');
    } catch (error) {
      toast.error('Failed to download invoice');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;

    try {
      await api.deleteInvoice(id);
      setInvoices(invoices.filter((inv) => inv.id !== id));
      toast.success('Invoice deleted');
    } catch (error) {
      toast.error('Failed to delete invoice');
      console.error(error);
    }
  };

  const getStatusBadgeClass = (status: string) => `badge badge-${status}`;

  return (
    <div className="card">
      <div className="card-header">
        <h1 className="card-title">Invoices</h1>
        <button className="btn btn-primary" onClick={() => navigate('/invoices/new')}>
          <Plus size={18} style={{ marginRight: '5px' }} />
          New Invoice
        </button>
      </div>

      <div className="list-actions">
        <div className="list-search">
          <input
            type="text"
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-select"
          style={{ width: '150px' }}
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="viewed">Viewed</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {loading ? (
        <div>Loading invoices...</div>
      ) : invoices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>No invoices found. Create one to get started.</p>
        </div>
      ) : (
        <div className="list-container">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/invoices/${invoice.id}`);
                      }}
                      style={{ color: '#2196f3', textDecoration: 'none' }}
                    >
                      {invoice.invoice_number}
                    </a>
                  </td>
                  <td>{invoice.customer_name}</td>
                  <td>
                    {invoice.currency} {invoice.amount.toFixed(2)}
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(invoice.status)}>
                      {invoice.status}
                    </span>
                  </td>
                  <td>{new Date(invoice.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-small btn-secondary"
                      title="Download PDF"
                      onClick={() => handleDownloadPDF(invoice.id, invoice.invoice_number)}
                    >
                      <Download size={14} />
                    </button>
                    <button
                      className="btn btn-small btn-secondary"
                      style={{ marginLeft: '5px' }}
                      title="Send Email"
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                    >
                      <Send size={14} />
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      style={{ marginLeft: '5px' }}
                      title="Delete"
                      onClick={() => handleDelete(invoice.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;
