export interface ChartData {
  type: 'bar' | 'line' | 'scatter' | 'area' | 'pie';
  data: any[];
  keys: {
    // For bar, line, scatter, area
    xAxis?: string;
    yAxis?: string | string[];
    // For scatter
    name?: string;
    // For pie
    nameKey?: string;
    dataKey?: string;
  };
  title?: string;
  colors?: string[];
  enableZoom?: boolean;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  markerShape?: 'circle' | 'cross' | 'diamond' | 'square' | 'star' | 'triangle' | 'wye';
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  isTranscript?: boolean;
  image?: {
    src: string;
    mimeType: string;
  };
  code?: {
    language: string;
    content: string;
  };
  chartData?: ChartData;
  feedback?: 'up' | 'down' | null;
}

export interface AttachedFile {
    file: File;
    src?: string; // for images
    content?: string; // for text files like csv
    mimeType: string;
}

export interface JarvisModule {
  name: string;
  description: string;
  enabled: boolean;
}

export interface Task {
  id: number;
  text: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}