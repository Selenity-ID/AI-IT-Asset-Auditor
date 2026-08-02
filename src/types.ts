export interface AssetItem {
  id: string; // Internal ID
  timestamp: string;
  location: string;
  category: string;
  manufacturer: string;
  model: string;
  modelNumber: string;
  serial: string;
  state: 'Operativo' | 'Dañado' | 'Obsoleto' | 'Desconocido';
}

export interface VisionExtraction {
  serial: string | null;
  category: string | null;
  manufacturer: string | null;
  model: string | null;
  modelNumber: string | null;
  messageToUser?: string | null;
  needsClarification: boolean;
}
