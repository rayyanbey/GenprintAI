'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  RotateCcw,
  Maximize,
  Download,
  Save,
  Trash2,
  Plus,
  Lock,
  Unlock,
} from 'lucide-react';

interface CanvasLayer {
  id: string;
  name: string;
  type: 'text' | 'image' | 'shape';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
}

interface DesignCanvasProps {
  designId?: string;
  initialData?: any;
  onSave?: (canvasData: any, artworkUrl: string) => void;
}

export default function DesignCanvas({
  designId,
  initialData,
  onSave,
}: DesignCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [layers, setLayers] = useState<CanvasLayer[]>(initialData?.layers || []);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState(initialData?.title || 'My Design');
  const [description, setDescription] = useState(
    initialData?.description || ''
  );

  const canvasWidth = 800;
  const canvasHeight = 600;

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= canvasWidth; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvasHeight);
      ctx.stroke();
    }
    for (let i = 0; i <= canvasHeight; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvasWidth, i);
      ctx.stroke();
    }

    // Draw layers
    layers.forEach((layer) => {
      ctx.save();
      ctx.globalAlpha = layer.opacity / 100;

      if (layer.type === 'text') {
        ctx.font = '24px Arial';
        ctx.fillStyle = layer.content || '#000000';
        ctx.fillText(layer.content || 'Text', layer.x, layer.y + 24);
      } else if (layer.type === 'shape') {
        ctx.fillStyle = layer.content || '#000000';
        ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
      }

      // Draw selection box if selected
      if (layer.id === selectedLayerId) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.strokeRect(layer.x - 2, layer.y - 2, layer.width + 4, layer.height + 4);
      }

      ctx.restore();
    });
  }, [layers, selectedLayerId, canvasWidth, canvasHeight]);

  // Handle canvas mouse events
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (zoom / 100);
    const y = (e.clientY - rect.top) / (zoom / 100);

    // Find clicked layer
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i];
      if (
        x >= layer.x &&
        x <= layer.x + layer.width &&
        y >= layer.y &&
        y <= layer.y + layer.height
      ) {
        setSelectedLayerId(layer.id);
        setIsDragging(true);
        setDragOffset({
          x: x - layer.x,
          y: y - layer.y,
        });
        return;
      }
    }

    setSelectedLayerId(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedLayerId) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (zoom / 100);
    const y = (e.clientY - rect.top) / (zoom / 100);

    setLayers((prevLayers) =>
      prevLayers.map((layer) =>
        layer.id === selectedLayerId
          ? {
              ...layer,
              x: x - dragOffset.x,
              y: y - dragOffset.y,
            }
          : layer
      )
    );
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  // Add text layer
  const addTextLayer = useCallback(() => {
    const newLayer: CanvasLayer = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Text ${layers.length + 1}`,
      type: 'text',
      content: 'Click to edit',
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      rotation: 0,
      opacity: 100,
      locked: false,
    };
    setLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
  }, [layers.length]);

  // Add shape layer
  const addShapeLayer = useCallback(() => {
    const newLayer: CanvasLayer = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Shape ${layers.length + 1}`,
      type: 'shape',
      content: '#ef4444',
      x: 150,
      y: 150,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 100,
      locked: false,
    };
    setLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
  }, [layers.length]);

  // Update layer
  const updateLayer = (layerId: string, updates: Partial<CanvasLayer>) => {
    setLayers((prevLayers) =>
      prevLayers.map((layer) =>
        layer.id === layerId ? { ...layer, ...updates } : layer
      )
    );
  };

  // Delete layer
  const deleteLayer = (layerId: string) => {
    setLayers((prevLayers) => prevLayers.filter((l) => l.id !== layerId));
    if (selectedLayerId === layerId) {
      setSelectedLayerId(null);
    }
  };

  // Export canvas to image
  const exportDesign = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    return dataUrl;
  };

  // Save design
  const handleSaveDesign = async () => {
    setIsSaving(true);
    try {
      const artworkUrl = await exportDesign();

      const designData = {
        title,
        description,
        canvas_data: { layers },
        artwork_file_url: artworkUrl,
      };

      if (designId) {
        // Update existing design
        const response = await fetch(`/api/designs/${designId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(designData),
        });

        if (!response.ok) {
          throw new Error('Failed to update design');
        }
      } else {
        // Create new design
        const response = await fetch('/api/designs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(designData),
        });

        if (!response.ok) {
          throw new Error('Failed to save design');
        }
      }

      if (onSave) {
        onSave(designData, artworkUrl);
      }

      alert('Design saved successfully!');
    } catch (error) {
      console.error('Error saving design:', error);
      alert('Failed to save design');
    } finally {
      setIsSaving(false);
    }
  };

  // Download design
  const handleDownloadDesign = async () => {
    const artworkUrl = await exportDesign();
    const link = document.createElement('a');
    link.href = artworkUrl;
    link.download = `${title || 'design'}.png`;
    link.click();
  };

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Toolbar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-4">Design Studio</h2>
          <div className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Design title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Design description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-20 resize-none"
            />
          </div>
        </div>

        {/* Add Elements */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h3 className="text-sm font-semibold mb-2">Add Elements</h3>
          <div className="space-y-2">
            <button
              onClick={addTextLayer}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Text
            </button>
            <button
              onClick={addShapeLayer}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Shape
            </button>
          </div>
        </div>

        {/* Layers */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2">Layers</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {layers.map((layer, idx) => (
              <div
                key={layer.id}
                onClick={() => setSelectedLayerId(layer.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedLayerId === layer.id
                    ? 'bg-blue-100 border border-blue-300'
                    : 'bg-gray-100 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{layer.name}</p>
                    <p className="text-xs text-gray-500">{layer.type}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteLayer(layer.id);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Layer Properties */}
        {selectedLayer && (
          <div className="pb-6 border-b border-gray-200">
            <h3 className="text-sm font-semibold mb-3">Layer Properties</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700">
                  Content
                </label>
                <input
                  type="text"
                  value={selectedLayer.content}
                  onChange={(e) =>
                    updateLayer(selectedLayerId!, {
                      content: e.target.value,
                    })
                  }
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">
                  Opacity: {selectedLayer.opacity}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedLayer.opacity}
                  onChange={(e) =>
                    updateLayer(selectedLayerId!, {
                      opacity: parseInt(e.target.value),
                    })
                  }
                  className="w-full mt-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-4">
          <button
            onClick={handleSaveDesign}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Design'}
          </button>
          <button
            onClick={handleDownloadDesign}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-auto">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              -
            </button>
            <span className="w-12 text-center text-sm">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 10))}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              +
            </button>
          </div>
          <span className="text-sm text-gray-600">
            {canvasWidth}x{canvasHeight}px
          </span>
        </div>

        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
          }}
        >
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            className="bg-white shadow-lg border-2 border-gray-300 cursor-move"
          />
        </div>
      </div>
    </div>
  );
}
