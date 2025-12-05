import React, { useState, useRef, useEffect } from 'react';
import { QRCodeDisplay } from './components/QRCodeDisplay';
import { Controls } from './components/Controls';
import { QRConfig, QRDesignPreset } from './types';
import { QrCode, Download, ChevronLeft, ChevronRight, Plus, Edit3, ArrowRight } from 'lucide-react';

const PRESETS: QRDesignPreset[] = [
  { 
    id: 'classic', 
    name: 'Classic Mono', 
    config: { fgColor: '#000000', bgColor: '#ffffff', includeLogo: false },
    previewColor: '#000000'
  },
  { 
    id: 'midnight', 
    name: 'Midnight Blue', 
    config: { fgColor: '#e0e7ff', bgColor: '#1e1b4b', includeLogo: false },
    previewColor: '#1e1b4b'
  },
  { 
    id: 'ocean', 
    name: 'Ocean Depth', 
    config: { fgColor: '#1e40af', bgColor: '#eff6ff', includeLogo: false },
    previewColor: '#1e40af'
  },
  { 
    id: 'coral', 
    name: 'Living Coral', 
    config: { fgColor: '#ffffff', bgColor: '#be123c', includeLogo: false },
    previewColor: '#be123c'
  },
  { 
    id: 'forest', 
    name: 'Deep Forest', 
    config: { fgColor: '#f0fdf4', bgColor: '#14532d', includeLogo: false },
    previewColor: '#14532d'
  },
  { 
    id: 'gold', 
    name: 'Luxury Gold', 
    config: { fgColor: '#422006', bgColor: '#fef3c7', includeLogo: true },
    previewColor: '#d97706'
  },
];

const App: React.FC = () => {
  const [currentPresetIndex, setCurrentPresetIndex] = useState(0);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [downloadTrigger, setDownloadTrigger] = useState<(() => void) | null>(null);

  // State
  const [qrConfig, setQrConfig] = useState<QRConfig>({
    value: "",
    fgColor: PRESETS[0].config.fgColor || "#000000",
    bgColor: PRESETS[0].config.bgColor || "#ffffff",
    size: 300, // internal canvas size
    level: "Q",
    includeLogo: PRESETS[0].config.includeLogo || false,
  });

  // Touch handling for swipe
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) { // Threshold
      if (diff > 0) {
        nextPreset();
      } else {
        prevPreset();
      }
    }
    touchStartX.current = null;
  };

  const nextPreset = () => {
    setCurrentPresetIndex((prev) => (prev + 1) % PRESETS.length);
  };

  const prevPreset = () => {
    setCurrentPresetIndex((prev) => (prev - 1 + PRESETS.length) % PRESETS.length);
  };

  // Sync preset with config
  useEffect(() => {
    const preset = PRESETS[currentPresetIndex];
    setQrConfig(prev => ({
      ...prev,
      ...preset.config
    }));
  }, [currentPresetIndex]);

  const handleDownloadClick = () => {
    if (downloadTrigger) downloadTrigger();
  };

  const currentPreset = PRESETS[currentPresetIndex];

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden font-sans relative">
      
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 opacity-10 transition-colors duration-500 ease-in-out"
        style={{ backgroundColor: currentPreset.previewColor }}
      />
      <div className="absolute -top-[20%] -right-[20%] w-[80%] h-[80%] bg-gradient-to-br from-white/40 to-transparent rounded-full blur-3xl" />

      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="bg-slate-900 text-white p-1.5 rounded-lg shadow-lg">
             <QrCode size={20} />
           </div>
           <span className="font-bold text-lg tracking-tight text-slate-800">GenQR</span>
        </div>
        
        {qrConfig.value && (
          <button 
            onClick={handleDownloadClick}
            className="flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Save</span>
          </button>
        )}
      </header>

      {/* Main Carousel Area */}
      <main 
        className="flex-1 flex flex-col items-center justify-center relative z-0 w-full max-w-4xl mx-auto"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        
        {/* Style Name Badge */}
        <div className="mb-6 sm:mb-8 text-center animate-fade-in">
           <span className="inline-block px-4 py-1.5 rounded-full bg-slate-900/5 backdrop-blur-sm text-slate-700 font-medium text-sm border border-slate-900/5 uppercase tracking-wide">
             {currentPreset.name}
           </span>
        </div>

        {/* Carousel Container */}
        <div className="flex items-center justify-center w-full gap-2 sm:gap-8 px-2">
            
            {/* Left Arrow */}
            <button 
                onClick={prevPreset}
                className="p-3 sm:p-4 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 transition-all flex-shrink-0 active:scale-90"
                aria-label="Previous Design"
            >
                <ChevronLeft size={32} strokeWidth={2.5} />
            </button>

            {/* Card Display - Smaller size as requested */}
            <div className="w-64 sm:w-72 flex-shrink-0 transition-transform duration-300">
               <QRCodeDisplay 
                  config={qrConfig} 
                  onDownloadRef={(fn) => setDownloadTrigger(() => fn)}
               />
            </div>

            {/* Right Arrow */}
            <button 
                onClick={nextPreset}
                className="p-3 sm:p-4 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 transition-all flex-shrink-0 active:scale-90"
                aria-label="Next Design"
            >
                <ChevronRight size={32} strokeWidth={2.5} />
            </button>
        </div>

        {/* Carousel Dots */}
        <div className="mt-8 flex gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setCurrentPresetIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentPresetIndex ? 'w-6 bg-slate-900' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Select style ${p.name}`}
            />
          ))}
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="relative z-20 p-6 pb-8 bg-gradient-to-t from-slate-50 to-transparent">
        <button
          onClick={() => setIsControlsOpen(true)}
          className="w-full max-w-lg mx-auto bg-slate-900 text-white rounded-2xl p-4 shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
             <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white/20 transition-colors">
               {qrConfig.value ? <Edit3 size={24} /> : <Plus size={24} />}
             </div>
             <div className="text-left">
               <p className="font-bold text-lg">{qrConfig.value ? "Edit Content" : "Add Content"}</p>
               <p className="text-slate-400 text-xs">
                 {qrConfig.value ? "Change URL or Text" : "Tap to add URL, Text, or AI prompt"}
               </p>
             </div>
          </div>
          <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
        </button>
      </div>

      {/* Overlays */}
      <Controls 
        config={qrConfig} 
        setConfig={setQrConfig} 
        isOpen={isControlsOpen}
        onClose={() => setIsControlsOpen(false)}
      />

    </div>
  );
};

export default App;