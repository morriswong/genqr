import React, { useRef, useCallback, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { BadgeConfig } from '../types';

interface BadgeDisplayProps {
  config: BadgeConfig;
  onDownloadRef?: (callback: () => void) => void;
}

// Default profile photo SVG as base64
const DEFAULT_PROFILE_PHOTO = 'data:image/svg+xml;base64,' + btoa(`
  <svg width="160" height="160" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
    <circle cx="80" cy="80" r="80" fill="#e2e8f0"/>
    <circle cx="80" cy="60" r="25" fill="#94a3b8"/>
    <ellipse cx="80" cy="130" rx="45" ry="35" fill="#94a3b8"/>
  </svg>
`);

const parseName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ')
  };
};

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

const truncateText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string => {
  let truncated = text;
  while (ctx.measureText(truncated).width > maxWidth && truncated.length > 0) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + (truncated !== text ? '...' : '');
};

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ config, onDownloadRef }) => {
  const badgeRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadBadge = useCallback(async () => {
    try {
      // Ensure fonts are loaded
      await document.fonts.load('bold 48px Inter');
      await document.fonts.load('28px Inter');

      const canvas = document.createElement('canvas');
      canvas.width = config.badgeWidth;
      canvas.height = config.badgeHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // Calculate section heights (updated to match real badge proportions)
      const topSectionHeight = config.badgeHeight * 0.50; // 50%
      const nameSectionHeight = config.badgeHeight * 0.25; // 25%
      const qrSectionHeight = config.badgeHeight * 0.25; // 25%

      // 1. Draw top section background
      ctx.fillStyle = config.topSectionColor;
      ctx.fillRect(0, 0, config.badgeWidth, topSectionHeight);

      // 2. Draw circular profile photo
      const photoSrc = config.profilePhoto || DEFAULT_PROFILE_PHOTO;
      try {
        const img = await loadImage(photoSrc);
        const photoDiameter = 180;
        const photoRadius = photoDiameter / 2;
        const photoCenterX = config.badgeWidth / 2;
        const photoCenterY = topSectionHeight / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(photoCenterX, photoCenterY, photoRadius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(
          img,
          photoCenterX - photoRadius,
          photoCenterY - photoRadius,
          photoDiameter,
          photoDiameter
        );
        ctx.restore();

        // Add white border around photo
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(photoCenterX, photoCenterY, photoRadius, 0, Math.PI * 2);
        ctx.stroke();
      } catch (error) {
        console.error('Error loading profile photo:', error);
      }

      // 3. Draw name section background
      ctx.fillStyle = config.badgeColor;
      ctx.fillRect(0, topSectionHeight, config.badgeWidth, nameSectionHeight);

      // 4. Draw name text
      const { firstName, lastName } = parseName(config.fullName);
      const nameCenterX = config.badgeWidth / 2;
      const nameSectionTop = topSectionHeight;
      const nameSectionCenter = nameSectionTop + nameSectionHeight / 2;

      ctx.fillStyle = config.textColor;
      ctx.textAlign = 'center';

      if (firstName) {
        // Draw first name (bold, larger)
        ctx.font = 'bold 48px Inter, sans-serif';
        ctx.textBaseline = 'middle';
        const truncatedFirstName = truncateText(ctx, firstName.toUpperCase(), config.badgeWidth * 0.85);
        const firstNameY = lastName ? nameSectionCenter - 25 : nameSectionCenter;
        ctx.fillText(truncatedFirstName, nameCenterX, firstNameY);

        // Draw last name (regular, smaller)
        if (lastName) {
          ctx.font = '28px Inter, sans-serif';
          const truncatedLastName = truncateText(ctx, lastName, config.badgeWidth * 0.85);
          ctx.fillText(truncatedLastName, nameCenterX, nameSectionCenter + 30);
        }
      }

      // 5. Draw QR section background
      const qrSectionTop = topSectionHeight + nameSectionHeight;
      ctx.fillStyle = config.badgeColor;
      ctx.fillRect(0, qrSectionTop, config.badgeWidth, qrSectionHeight);

      // 6. Draw QR code
      const qrCanvas = qrRef.current?.querySelector('canvas');
      if (qrCanvas) {
        const qrX = (config.badgeWidth - config.qrSize) / 2;
        const qrY = qrSectionTop + (qrSectionHeight - config.qrSize) / 2;
        ctx.drawImage(qrCanvas, qrX, qrY, config.qrSize, config.qrSize);
      }

      // 7. Export as PNG
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `id-badge-${Date.now()}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading badge:', error);
    }
  }, [config]);

  // Expose download function to parent
  useEffect(() => {
    if (onDownloadRef) {
      onDownloadRef(downloadBadge);
    }
  }, [onDownloadRef, downloadBadge]);

  const { firstName, lastName } = parseName(config.fullName);
  const photoSrc = config.profilePhoto || DEFAULT_PROFILE_PHOTO;

  return (
    <div className="w-full flex flex-col items-center justify-center pointer-events-none select-none">
      <div
        ref={badgeRef}
        className="w-full max-w-[256px] rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105"
        style={{
          aspectRatio: '5/7',
          boxShadow: `0 20px 40px -10px ${config.topSectionColor}40`
        }}
      >
        {/* Top Section - Profile Photo */}
        <div
          className="relative flex items-center justify-center"
          style={{
            backgroundColor: config.topSectionColor,
            height: '50%'
          }}
        >
          <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <img
              src={photoSrc}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Name Section */}
        <div
          className="flex flex-col items-center justify-center px-4"
          style={{
            backgroundColor: config.badgeColor,
            height: '25%'
          }}
        >
          {firstName && (
            <>
              <h1
                className="text-2xl font-bold uppercase truncate w-full text-center leading-tight"
                style={{ color: config.textColor }}
              >
                {firstName}
              </h1>
              {lastName && (
                <h2
                  className="text-base font-normal truncate w-full text-center mt-1"
                  style={{ color: config.textColor }}
                >
                  {lastName}
                </h2>
              )}
            </>
          )}
          {!firstName && (
            <p className="text-sm opacity-50" style={{ color: config.textColor }}>
              Add your name
            </p>
          )}
        </div>

        {/* QR Code Section */}
        <div
          className="flex items-center justify-center py-8 px-4"
          style={{
            backgroundColor: config.badgeColor,
            height: '25%'
          }}
        >
          <div ref={qrRef} className="flex items-center justify-center">
            <QRCodeCanvas
              value={config.qrUrl || "https://example.com"}
              size={60}
              bgColor={config.qrBgColor}
              fgColor={config.qrFgColor}
              level={config.qrLevel}
              includeMargin={false}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 text-center px-4 w-full">
        <p className="text-sm font-medium opacity-50 mb-1">
          {config.fullName || config.qrUrl ? "Badge Preview" : "Waiting for content..."}
        </p>
        <p className="text-lg font-semibold truncate" style={{ color: config.topSectionColor }}>
          {config.fullName || config.qrUrl || "Add your details"}
        </p>
      </div>
    </div>
  );
};
