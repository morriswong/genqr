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

  const applyTextOverlay = useCallback(() => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas || !config.overlayText) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const qrSize = config.size;
    const fontSize = Math.floor(qrSize * 0.12); // 12% of QR size
    const maxWidth = qrSize * 0.6; // 60% of QR width

    // Configure text
    ctx.font = `bold ${fontSize}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Truncate text if needed
    let displayText = config.overlayText;
    let textWidth = ctx.measureText(displayText).width;

    while (textWidth > maxWidth && displayText.length > 0) {
      displayText = displayText.slice(0, -1);
      textWidth = ctx.measureText(displayText + '...').width;
    }
    if (displayText !== config.overlayText) {
      displayText += '...';
    }

    // Calculate dimensions
    const finalTextWidth = ctx.measureText(displayText).width;
    const padding = {
      x: fontSize * 0.3,
      y: fontSize * 0.4,
    };
    const bgWidth = finalTextWidth + padding.x * 2;
    const bgHeight = fontSize + padding.y * 2;
    const centerX = qrSize / 2;
    const centerY = qrSize / 2;
    const borderRadius = bgHeight * 0.2;

    // Draw background with rounded corners
    ctx.fillStyle = config.bgColor === '#ffffff' ? 'rgba(255, 255, 255, 0.95)' : config.bgColor;
    ctx.beginPath();

    // Check for roundRect support, fallback to regular rect
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(
        centerX - bgWidth / 2,
        centerY - bgHeight / 2,
        bgWidth,
        bgHeight,
        borderRadius
      );
    } else {
      ctx.rect(
        centerX - bgWidth / 2,
        centerY - bgHeight / 2,
        bgWidth,
        bgHeight
      );
    }
    ctx.fill();

    // Draw text
    ctx.fillStyle = config.fgColor;
    ctx.fillText(displayText, centerX, centerY);
  }, [config.overlayText, config.size, config.bgColor, config.fgColor]);

  // Expose download function to parent
  useEffect(() => {
    if (onDownloadRef) {
      onDownloadRef(downloadQR);
    }
  }, [onDownloadRef, downloadQR]);

  // Apply text overlay when config changes
  useEffect(() => {
    if (config.overlayEnabled && config.overlayText) {
      // Wait for canvas to be ready
      const timeoutId = setTimeout(() => {
        applyTextOverlay();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [config.overlayText, config.overlayEnabled, config.value, config.fgColor, config.bgColor, applyTextOverlay]);

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