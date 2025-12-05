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
}

export interface QRDesignPreset {
  id: string;
  name: string;
  config: Partial<QRConfig>;
  previewColor: string;
}