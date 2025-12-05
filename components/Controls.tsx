import React, { useState } from 'react';
import { QRConfig, QRMode } from '../types';
import { Type, Link as LinkIcon, X } from 'lucide-react';

interface ControlsProps {
  config: QRConfig;
  setConfig: React.Dispatch<React.SetStateAction<QRConfig>>;
  isOpen: boolean;
  onClose: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ config, setConfig, isOpen, onClose }) => {
  const [mode, setMode] = useState<QRMode>(QRMode.URL);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setConfig(prev => ({ ...prev, value: e.target.value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="bg-white w-full max-w-2xl rounded-t-3xl shadow-2xl p-6 pointer-events-auto transform transition-transform duration-300 ease-out max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Edit Content</h2>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Mode Selection Pills */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            {[
              { id: QRMode.URL, icon: LinkIcon, label: 'URL' },
              { id: QRMode.TEXT, icon: Type, label: 'Text' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-sm font-medium transition-all ${
                  mode === m.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <m.icon size={16} />
                {m.label}
              </button>
            ))}
          </div>

          {/* Input Areas */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="relative flex items-center">
                <input
                  type={mode === QRMode.URL ? 'url' : 'text'}
                  value={config.value}
                  onChange={handleInputChange}
                  placeholder={mode === QRMode.URL ? 'https://example.com' : 'Enter your text here...'}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-slate-700 text-lg"
                  autoFocus
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={onClose}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-semibold text-lg hover:bg-slate-800 transition-colors shadow-xl"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};