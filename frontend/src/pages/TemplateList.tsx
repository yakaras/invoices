import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

const TemplateList: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.getTemplates();
      setTemplates(response.data);
    } catch (error) {
      toast.error('Failed to load templates');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      await api.deleteTemplate(id);
      setTemplates(templates.filter((t) => t.id !== id));
      toast.success('Template deleted');
    } catch (error) {
      toast.error('Failed to delete template');
      console.error(error);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h1 className="card-title">Invoice Templates</h1>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/templates/new')}
        >
          <Plus size={18} style={{ marginRight: '5px' }} />
          New Template
        </button>
      </div>

      {loading ? (
        <div>Loading templates...</div>
      ) : templates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>No templates yet. Create one to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {templates.map((template) => (
            <div
              key={template.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#fafafa',
              }}
            >
              <h3 style={{ marginBottom: '10px' }}>{template.name}</h3>
              <p style={{ color: '#999', marginBottom: '15px', fontSize: '14px' }}>
                {template.description || 'No description'}
              </p>
              <p style={{ color: '#999', fontSize: '12px', marginBottom: '15px' }}>
                Created: {new Date(template.created_at).toLocaleDateString()}
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => navigate(`/templates/${template.id}`)}
                >
                  <Edit2 size={14} style={{ marginRight: '5px' }} />
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(template.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateList;
