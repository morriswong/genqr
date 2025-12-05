import React, { useState } from 'react';
import { QRConfig, QRMode } from '../types';
import { Sparkles, Type, Link as LinkIcon, X, Loader2, ArrowRight } from 'lucide-react';
import { parseNaturalLanguageToQR } from '../services/geminiService';

interface ControlsProps {
  config: QRConfig;
  setConfig: React.Dispatch<React.SetStateAction<QRConfig>>;
  isOpen: boolean;
  onClose: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ config, setConfig, isOpen, onClose }) => {
  const [mode, setMode] = useState<QRMode>(QRMode.URL);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const result = await parseNaturalLanguageToQR(aiPrompt);
      setConfig(prev => ({ ...prev, value: result.content }));
      // Optional: close on success
      // onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

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
              { id: QRMode.AI_MAGIC, icon: Sparkles, label: 'AI Magic' },
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
                <m.icon size={16} className={mode === QRMode.AI_MAGIC ? (m.id === mode ? "text-indigo-500" : "") : ""} />
                {m.label}
              </button>
            ))}
          </div>

          {/* Input Areas */}
          <div className="space-y-4">
            {mode === QRMode.AI_MAGIC ? (
              <div className="space-y-3">
                <div className="relative">
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Describe it: 'Wifi for Guest, pass 1234'..."
                    className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-slate-700 text-base"
                    autoFocus
                  />
                  <div className="absolute bottom-3 right-3">
                    <button
                      onClick={handleAiGenerate}
                      disabled={isAiLoading || !aiPrompt.trim()}
                      className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200"
                    >
                      {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      Generate
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-400 px-2">
                  Powered by Gemini. We'll format your request automatically.
                </p>
              </div>
            ) : (
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
            )}
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