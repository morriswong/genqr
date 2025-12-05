import React, { useRef, useCallback, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { QRConfig } from '../types';
import { Download, Share2 } from 'lucide-react';

interface QRCodeDisplayProps {
  config: QRConfig;
  onDownloadRef?: (callback: () => void) => void;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ config, onDownloadRef }) => {
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQR = useCallback(() => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `genqr-${Date.now()}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, []);

  // Expose download function to parent
  useEffect(() => {
    if (onDownloadRef) {
      onDownloadRef(downloadQR);
    }
  }, [onDownloadRef, downloadQR]);

  return (
    <div className="w-full flex flex-col items-center justify-center pointer-events-none select-none">
      <div 
        ref={qrRef} 
        className="p-6 rounded-3xl shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105"
        style={{ 
          background: config.bgColor,
          boxShadow: `0 20px 40px -10px ${config.fgColor}30` 
        }}
      >
        <QRCodeCanvas
          value={config.value || "https://example.com"}
          size={config.size}
          bgColor={config.bgColor}
          fgColor={config.fgColor}
          level={config.level}
          includeMargin={false}
          style={{ width: '100%', height: 'auto', maxWidth: '100%' }}
          imageSettings={config.includeLogo ? {
            src: "https://picsum.photos/64/64",
            x: undefined,
            y: undefined,
            height: 40,
            width: 40,
            excavate: true,
          } : undefined}
        />
      </div>
      
      <div className="mt-6 text-center px-4 w-full">
         <p className="text-sm font-medium opacity-50 mb-1">
           {config.value ? "Content Preview" : "Waiting for content..."}
         </p>
         <p className="text-lg font-semibold truncate" style={{ color: config.fgColor }}>
            {config.value || "Your text here"}
         </p>
      </div>
    </div>
  );
};