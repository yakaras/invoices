import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import toast from 'react-hot-toast';
import { Send, Download, X } from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: string;
  issue_date: string;
  due_date: string;
  data: any;
}

const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendEmail, setSendEmail] = useState('');
  const [sendMessage, setSendMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (id) fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await api.getInvoice(id!);
      setInvoice(response.data);
      setSendEmail(response.data.data.customer_email || '');
    } catch (error) {
      toast.error('Failed to load invoice');
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await api.downloadInvoicePDF(id!);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoice?.invoice_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success('Invoice downloaded');
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendEmail) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      setSending(true);
      await api.sendInvoiceEmail(id!, {
        recipient_email: sendEmail,
        message: sendMessage,
      });
      toast.success('Invoice sent successfully');
      setShowSendModal(false);
      setSendEmail('');
      setSendMessage('');
      fetchInvoice();
    } catch (error) {
      toast.error('Failed to send invoice');
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="card">Loading invoice...</div>;
  if (!invoice) return <div className="card">Invoice not found</div>;

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div>
            <h1 className="card-title">Invoice {invoice.invoice_number}</h1>
            <p style={{ color: '#999', marginTop: '5px' }}>
              <span className={`badge badge-${invoice.status}`}>{invoice.status}</span>
            </p>
          </div>
          <div>
            <button
              className="btn btn-primary"
              onClick={handleDownloadPDF}
              style={{ marginRight: '10px' }}
            >
              <Download size={18} style={{ marginRight: '5px' }} />
              Download PDF
            </button>
            <button className="btn btn-success" onClick={() => setShowSendModal(true)}>
              <Send size={18} style={{ marginRight: '5px' }} />
              Send Email
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h3>Invoice Details</h3>
            <p>
              <strong>Number:</strong> {invoice.invoice_number}
            </p>
            <p>
              <strong>Amount:</strong> {invoice.currency} {invoice.amount.toFixed(2)}
            </p>
            <p>
              <strong>Issue Date:</strong> {new Date(invoice.issue_date).toLocaleDateString()}
            </p>
            <p>
              <strong>Due Date:</strong> {new Date(invoice.due_date).toLocaleDateString()}
            </p>
          </div>

          <div>
            <h3>Customer</h3>
            <p>
              <strong>Name:</strong> {invoice.data.customer_name}
            </p>
            <p>
              <strong>Email:</strong> {invoice.data.customer_email}
            </p>
            <p>
              <strong>Address:</strong> {invoice.data.customer_address}
            </p>
          </div>
        </div>

        {invoice.data.line_items && invoice.data.line_items.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <h3>Line Items</h3>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.data.line_items.map((item: any, index: number) => (
                  <tr key={index}>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>${item.unit_price.toFixed(2)}</td>
                    <td>${item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {invoice.data.notes && (
          <div style={{ marginTop: '20px' }}>
            <h3>Notes</h3>
            <p>{invoice.data.notes}</p>
          </div>
        )}
      </div>

      {showSendModal && (
        <div className="modal-overlay" onClick={() => setShowSendModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Send Invoice via Email</h2>
              <button
                className="modal-close"
                onClick={() => setShowSendModal(false)}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSendEmail}>
              <div className="form-group">
                <label className="form-label">Recipient Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={sendEmail}
                  onChange={(e) => setSendEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  className="form-textarea"
                  value={sendMessage}
                  onChange={(e) => setSendMessage(e.target.value)}
                  placeholder="Optional message to include in the email"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowSendModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={sending}
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default InvoiceDetail;
