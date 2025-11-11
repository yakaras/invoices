import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface Template {
  id: string;
  name: string;
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface FormData {
  template_id: string;
  customer_id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  issue_date: string;
  due_date: string;
  data: {
    company_name: string;
    company_address: string;
    customer_name: string;
    customer_email: string;
    customer_address: string;
    line_items: LineItem[];
    notes: string;
  };
}

const InvoiceForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    template_id: '',
    customer_id: '',
    invoice_number: '',
    amount: 0,
    currency: 'USD',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    data: {
      company_name: '',
      company_address: '',
      customer_name: '',
      customer_email: '',
      customer_address: '',
      line_items: [{ description: '', quantity: 1, unit_price: 0, total: 0 }],
      notes: '',
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (id) {
      fetchInvoice();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const [customersRes, templatesRes, settingsRes] = await Promise.all([
        api.getCustomers(),
        api.getTemplates(),
        api.getSettings(),
      ]);

      setCustomers(customersRes.data);
      setTemplates(templatesRes.data);

      setFormData((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          company_name: settingsRes.data.company_name,
          company_address: settingsRes.data.company_address,
        },
      }));
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  const fetchInvoice = async () => {
    try {
      const response = await api.getInvoice(id!);
      setFormData(response.data);
    } catch (error) {
      toast.error('Failed to load invoice');
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setFormData({
        ...formData,
        customer_id: customerId,
        data: {
          ...formData.data,
          customer_name: customer.name,
          customer_email: customer.email,
        },
      });
    }
  };

  const addLineItem = () => {
    setFormData({
      ...formData,
      data: {
        ...formData.data,
        line_items: [
          ...formData.data.line_items,
          { description: '', quantity: 1, unit_price: 0, total: 0 },
        ],
      },
    });
  };

  const removeLineItem = (index: number) => {
    setFormData({
      ...formData,
      data: {
        ...formData.data,
        line_items: formData.data.line_items.filter((_, i) => i !== index),
      },
    });
  };

  const updateLineItem = (index: number, field: string, value: any) => {
    const items = [...formData.data.line_items];
    items[index] = { ...items[index], [field]: value };

    if (field === 'quantity' || field === 'unit_price') {
      items[index].total = items[index].quantity * items[index].unit_price;
    }

    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

    setFormData({
      ...formData,
      data: { ...formData.data, line_items: items },
      amount: totalAmount,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.template_id || !formData.customer_id || !formData.invoice_number) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setSaving(true);
      if (id) {
        await api.updateInvoice(id, formData);
        toast.success('Invoice updated');
      } else {
        await api.createInvoice(formData);
        toast.success('Invoice created');
      }
      navigate('/invoices');
    } catch (error) {
      toast.error('Failed to save invoice');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="card">Loading invoice...</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h1 className="card-title">{id ? 'Edit Invoice' : 'New Invoice'}</h1>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
          <Save size={18} style={{ marginRight: '5px' }} />
          {saving ? 'Saving...' : 'Save Invoice'}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Template *</label>
            <select
              className="form-select"
              value={formData.template_id}
              onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}
              required
            >
              <option value="">Select Template</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Customer *</label>
            <select
              className="form-select"
              value={formData.customer_id}
              onChange={(e) => handleCustomerChange(e.target.value)}
              required
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Invoice Number *</label>
            <input
              type="text"
              className="form-input"
              value={formData.invoice_number}
              onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Currency</label>
            <select
              className="form-select"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Issue Date</label>
            <input
              type="date"
              className="form-input"
              value={formData.issue_date}
              onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input
              type="date"
              className="form-input"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>Line Items</h3>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {formData.data.line_items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      className="form-input"
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-input"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-input"
                      value={item.unit_price}
                      onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value))}
                      step="0.01"
                      style={{ width: '100%' }}
                    />
                  </td>
                  <td>${item.total.toFixed(2)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-danger btn-small"
                      onClick={() => removeLineItem(index)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" className="btn btn-secondary" onClick={addLineItem} style={{ marginTop: '10px' }}>
            Add Line Item
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea
            className="form-textarea"
            value={formData.data.notes}
            onChange={(e) => setFormData({ ...formData, data: { ...formData.data, notes: e.target.value } })}
          />
        </div>

        <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px' }}>
          <strong>Total Amount: {formData.currency} {formData.amount.toFixed(2)}</strong>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
