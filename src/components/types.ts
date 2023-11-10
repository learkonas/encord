export interface Prediction {
    title: string;
    description: string;
    timestamp: number;
    filename: string;
    id: string;
    predictions: PredictionContent[]
}

export interface PredictionContent {
    bbox: {
        x1: number;
        x2: number;
        y1: number;
        y2: number;    
    }
    label: string;
    score: number;
}