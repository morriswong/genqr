export enum QRMode {
  TEXT = 'TEXT',
  URL = 'URL',
  AI_MAGIC = 'AI_MAGIC',
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

export interface AIParsedResult {
  type: string;
  content: string;
  explanation: string;
}