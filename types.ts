export enum QRMode {
  TEXT = 'TEXT',
  URL = 'URL',
}

export interface QRConfig {
  value: string;
  fgColor: string;
  bgColor: string;
  size: number;
  level: 'L' | 'M' | 'Q' | 'H';
  includeLogo: boolean;
  overlayText?: string;
  overlayEnabled?: boolean;
}

export interface QRDesignPreset {
  id: string;
  name: string;
  config: Partial<QRConfig>;
  previewColor: string;
}

export interface BadgeConfig {
  // Identity
  fullName: string;
  profilePhoto?: string; // base64 data URL or undefined for default

  // QR Code
  qrUrl: string;

  // Styling (derived from preset)
  badgeColor: string;
  topSectionColor: string;
  qrFgColor: string;
  qrBgColor: string;
  textColor: string;

  // Technical
  badgeWidth: number;   // 600px
  badgeHeight: number;  // 840px (5:7 playing card aspect ratio)
  qrSize: number;       // 180px
  qrLevel: 'L' | 'M' | 'Q' | 'H';
}

export interface BadgeDesignPreset {
  id: string;
  name: string;
  badgeColor: string;
  topSectionColor: string;
  qrFgColor: string;
  qrBgColor: string;
  textColor: string;
  previewColor: string;
}