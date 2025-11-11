import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import toast from 'react-hot-toast';

interface Settings {
  id?: string;
  company_name: string;
  company_address: string;
  company_email: string;
  company_phone: string;
  logo_url: string;
  tax_id: string;
  default_currency: string;
  invoice_prefix: string;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    company_name: '',
    company_address: '',
    company_email: '',
    company_phone: '',
    logo_url: '',
    tax_id: '',
    default_currency: 'USD',
    invoice_prefix: 'INV',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.getSettings();
      setSettings(response.data);
    } catch (error) {
      toast.error('Failed to load settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      await api.updateSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSettings({
          ...settings,
          logo_url: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <div className="card">Loading settings...</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h1 className="card-title">Company Settings</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ maxWidth: '600px' }}>
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input
              type="text"
              className="form-input"
              value={settings.company_name}
              onChange={(e) =>
                setSettings({ ...settings, company_name: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Company Address</label>
            <textarea
              className="form-textarea"
              value={settings.company_address}
              onChange={(e) =>
                setSettings({ ...settings, company_address: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Company Email</label>
            <input
              type="email"
              className="form-input"
              value={settings.company_email}
              onChange={(e) =>
                setSettings({ ...settings, company_email: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Company Phone</label>
            <input
              type="tel"
              className="form-input"
              value={settings.company_phone}
              onChange={(e) =>
                setSettings({ ...settings, company_phone: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tax ID</label>
            <input
              type="text"
              className="form-input"
              value={settings.tax_id}
              onChange={(e) =>
                setSettings({ ...settings, tax_id: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              style={{ marginBottom: '10px' }}
            />
            {settings.logo_url && (
              <div>
                <img
                  src={settings.logo_url}
                  alt="Company Logo"
                  style={{ maxWidth: '200px', maxHeight: '100px' }}
                />
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Default Currency</label>
              <select
                className="form-select"
                value={settings.default_currency}
                onChange={(e) =>
                  setSettings({ ...settings, default_currency: e.target.value })
                }
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Invoice Prefix</label>
              <input
                type="text"
                className="form-input"
                value={settings.invoice_prefix}
                onChange={(e) =>
                  setSettings({ ...settings, invoice_prefix: e.target.value })
                }
                placeholder="e.g., INV"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ marginTop: '20px' }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
