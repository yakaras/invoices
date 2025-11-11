import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Stage, Layer, Rect, Text, Image } from 'react-konva';
import { api } from '../api/client';
import toast from 'react-hot-toast';
import { Save, Plus, Trash2 } from 'lucide-react';
import Konva from 'konva';

interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'rectangle' | 'field';
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fill?: string;
  stroke?: string;
  fieldName?: string;
}

interface Template {
  id?: string;
  name: string;
  description: string;
  content: {
    elements: CanvasElement[];
    pageSize: { width: number; height: number };
    fonts: any[];
  };
}

const TemplateBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const stageRef = useRef<Konva.Stage>(null);

  const [template, setTemplate] = useState<Template>({
    name: '',
    description: '',
    content: {
      elements: [],
      pageSize: { width: 612, height: 792 }, // Letter size
      fonts: [],
    },
  });

  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [toolMode, setToolMode] = useState<'select' | 'text' | 'image' | 'shape' | null>(null);

  useEffect(() => {
    if (id && id !== 'new') {
      fetchTemplate();
    }
  }, [id]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const response = await api.getTemplate(id!);
      setTemplate(response.data);
    } catch (error) {
      toast.error('Failed to load template');
      navigate('/templates');
    } finally {
      setLoading(false);
    }
  };

  const handleAddElement = (type: 'text' | 'image' | 'rectangle') => {
    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type,
      x: 50,
      y: 50,
      width: type === 'image' ? 100 : 200,
      height: 40,
      text: type === 'text' ? 'Sample Text' : undefined,
      fontFamily: 'Arial',
      fontSize: 14,
      fill: type === 'rectangle' ? '#cccccc' : '#000000',
      fieldName: type === 'text' ? '{field_name}' : undefined,
    };

    setTemplate({
      ...template,
      content: {
        ...template.content,
        elements: [...template.content.elements, newElement],
      },
    });

    setSelectedElement(newElement.id);
  };

  const handleDeleteElement = (elementId: string) => {
    setTemplate({
      ...template,
      content: {
        ...template.content,
        elements: template.content.elements.filter((el) => el.id !== elementId),
      },
    });
    if (selectedElement === elementId) setSelectedElement(null);
  };

  const updateElement = (elementId: string, updates: Partial<CanvasElement>) => {
    setTemplate({
      ...template,
      content: {
        ...template.content,
        elements: template.content.elements.map((el) =>
          el.id === elementId ? { ...el, ...updates } : el
        ),
      },
    });
  };

  const handleSave = async () => {
    if (!template.name) {
      toast.error('Please enter a template name');
      return;
    }

    try {
      setSaving(true);
      if (id && id !== 'new') {
        await api.updateTemplate(id, template);
        toast.success('Template updated');
      } else {
        await api.createTemplate(template);
        toast.success('Template created');
      }
      navigate('/templates');
    } catch (error) {
      toast.error('Failed to save template');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const selectedEl = template.content.elements.find((el) => el.id === selectedElement);

  if (loading) return <div className="card">Loading template...</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h1 className="card-title">Template Builder</h1>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={18} style={{ marginRight: '5px' }} />
          {saving ? 'Saving...' : 'Save Template'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 300px', gap: '20px', marginBottom: '20px' }}>
        {/* Left Toolbar */}
        <div style={{ borderRight: '1px solid #ddd', paddingRight: '20px' }}>
          <div className="form-group">
            <label className="form-label">Template Name</label>
            <input
              type="text"
              className="form-input"
              value={template.name}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              placeholder="My Template"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={template.description}
              onChange={(e) => setTemplate({ ...template, description: e.target.value })}
              placeholder="Template description"
            />
          </div>

          <div style={{ marginTop: '20px' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>Tools</h3>
            <button
              className="btn btn-secondary"
              style={{ width: '100%', marginBottom: '10px' }}
              onClick={() => handleAddElement('text')}
            >
              <Plus size={14} /> Text
            </button>
            <button
              className="btn btn-secondary"
              style={{ width: '100%', marginBottom: '10px' }}
              onClick={() => handleAddElement('image')}
            >
              <Plus size={14} /> Image
            </button>
            <button
              className="btn btn-secondary"
              style={{ width: '100%' }}
              onClick={() => handleAddElement('rectangle')}
            >
              <Plus size={14} /> Shape
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fafafa',
            minHeight: '600px',
            overflow: 'auto',
          }}
        >
          <Stage
            width={template.content.pageSize.width}
            height={template.content.pageSize.height}
            ref={stageRef}
            style={{
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <Layer>
              {/* Background */}
              <Rect
                width={template.content.pageSize.width}
                height={template.content.pageSize.height}
                fill="white"
                stroke="#ccc"
                strokeWidth={1}
              />

              {/* Elements */}
              {template.content.elements.map((element) => (
                <React.Fragment key={element.id}>
                  {element.type === 'text' && (
                    <Text
                      x={element.x}
                      y={element.y}
                      text={element.text || ''}
                      fontSize={element.fontSize || 14}
                      fontFamily={element.fontFamily || 'Arial'}
                      fill={element.fill || '#000000'}
                      width={element.width}
                      onClick={() => setSelectedElement(element.id)}
                      draggable
                      onDragEnd={(e) => {
                        updateElement(element.id, {
                          x: e.target.x(),
                          y: e.target.y(),
                        });
                      }}
                      stroke={selectedElement === element.id ? '#2196f3' : undefined}
                      strokeWidth={selectedElement === element.id ? 2 : 0}
                    />
                  )}
                  {element.type === 'rectangle' && (
                    <Rect
                      x={element.x}
                      y={element.y}
                      width={element.width}
                      height={element.height}
                      fill={element.fill || '#cccccc'}
                      stroke={selectedElement === element.id ? '#2196f3' : '#cccccc'}
                      strokeWidth={selectedElement === element.id ? 2 : 1}
                      onClick={() => setSelectedElement(element.id)}
                      draggable
                      onDragEnd={(e) => {
                        updateElement(element.id, {
                          x: e.target.x(),
                          y: e.target.y(),
                        });
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </Layer>
          </Stage>
        </div>

        {/* Right Properties Panel */}
        <div style={{ borderLeft: '1px solid #ddd', paddingLeft: '20px' }}>
          {selectedEl ? (
            <div>
              <h3 style={{ marginBottom: '15px' }}>Element Properties</h3>

              {selectedEl.type === 'text' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Text</label>
                    <input
                      type="text"
                      className="form-input"
                      value={selectedEl.text || ''}
                      onChange={(e) =>
                        updateElement(selectedEl.id, { text: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Font Size</label>
                    <input
                      type="number"
                      className="form-input"
                      value={selectedEl.fontSize || 14}
                      onChange={(e) =>
                        updateElement(selectedEl.id, {
                          fontSize: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Font Family</label>
                    <select
                      className="form-select"
                      value={selectedEl.fontFamily || 'Arial'}
                      onChange={(e) =>
                        updateElement(selectedEl.id, { fontFamily: e.target.value })
                      }
                    >
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Color</label>
                    <input
                      type="color"
                      className="form-input"
                      value={selectedEl.fill || '#000000'}
                      onChange={(e) =>
                        updateElement(selectedEl.id, { fill: e.target.value })
                      }
                      style={{ height: '40px' }}
                    />
                  </div>
                </>
              )}

              {selectedEl.type === 'rectangle' && (
                <div className="form-group">
                  <label className="form-label">Fill Color</label>
                  <input
                    type="color"
                    className="form-input"
                    value={selectedEl.fill || '#cccccc'}
                    onChange={(e) =>
                      updateElement(selectedEl.id, { fill: e.target.value })
                    }
                    style={{ height: '40px' }}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">X Position</label>
                <input
                  type="number"
                  className="form-input"
                  value={selectedEl.x}
                  onChange={(e) =>
                    updateElement(selectedEl.id, { x: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Y Position</label>
                <input
                  type="number"
                  className="form-input"
                  value={selectedEl.y}
                  onChange={(e) =>
                    updateElement(selectedEl.id, { y: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Width</label>
                <input
                  type="number"
                  className="form-input"
                  value={selectedEl.width}
                  onChange={(e) =>
                    updateElement(selectedEl.id, { width: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Height</label>
                <input
                  type="number"
                  className="form-input"
                  value={selectedEl.height}
                  onChange={(e) =>
                    updateElement(selectedEl.id, { height: parseInt(e.target.value) })
                  }
                />
              </div>

              <button
                className="btn btn-danger"
                style={{ width: '100%', marginTop: '10px' }}
                onClick={() => handleDeleteElement(selectedEl.id)}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          ) : (
            <div style={{ color: '#999', textAlign: 'center' }}>
              Select an element to edit
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateBuilder;
