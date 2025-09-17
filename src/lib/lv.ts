export const isLive = !!process.env.NEXT_PUBLIC_LV_API_URL;

export async function runJob(payload: FormData | object) {
  if (!isLive) {
    await new Promise(r => setTimeout(r, 600)); // simulated latency
    return createMockResult();
  }
  const url = `${process.env.NEXT_PUBLIC_LV_API_URL}/v1/run`;
  const headers: Record<string, string> = { 'x-api-key': process.env.NEXT_PUBLIC_LV_API_KEY || '' };
  const body = payload instanceof FormData ? payload : JSON.stringify(payload);
  return fetch(url, { method: 'POST', headers, body }).then(r => r.json());
}

export interface LidVizionResult {
  success: boolean;
  jobId?: string;
  results?: {
    detections?: Array<{
      id: string;
      class: string;
      score: number;
      box: number[];
    }>;
    instances?: Array<{
      id: string;
      class: string;
      score: number;
      polygon: number[][];
    }>;
    labels?: Array<{
      id: string;
      class: string;
      score: number;
      attributes?: Record<string, string>;
    }>;
    blocks?: Array<{
      id: string;
      text: string;
      score: number;
      box: number[];
    }>;
    summary: {
      totalDetections?: number;
      totalInstances?: number;
      totalLabels?: number;
      totalBlocks?: number;
      processingTime: number;
      confidence?: {
        average: number;
        min: number;
        max: number;
      };
    };
  };
  error?: string;
  logs?: string[];
}

export function createMockResult(): LidVizionResult {
  return {
    success: true,
    jobId: `mock-${Date.now()}`,
    results: {
      detections: [
        {
          id: 'det-1',
          class: 'lid',
          score: 0.95,
          box: [120, 80, 150, 150]
        },
        {
          id: 'det-2',
          class: 'container',
          score: 0.88,
          box: [300, 200, 200, 180]
        }
      ],
      instances: [
        {
          id: 'inst-1',
          class: 'lid',
          score: 0.89,
          polygon: [[125, 85], [265, 85], [270, 225], [120, 230]]
        }
      ],
      labels: [
        {
          id: 'label-1',
          class: 'plastic_container',
          score: 0.76,
          attributes: {
            material: 'plastic',
            condition: 'good',
            color: 'blue'
          }
        }
      ],
      blocks: [
        {
          id: 'ocr-1',
          text: 'RECYCLING CODE 1',
          score: 0.94,
          box: [40, 120, 220, 160]
        }
      ],
      summary: {
        totalDetections: 2,
        totalInstances: 1,
        totalLabels: 1,
        totalBlocks: 1,
        processingTime: 1250,
        confidence: {
          average: 0.88,
          min: 0.76,
          max: 0.95
        }
      }
    },
    logs: [
      'Initializing multi-modal processing...',
      'Loading image data...',
      'Running object detection model...',
      'Found 2 objects with confidence > 0.8',
      'Running instance segmentation...',
      'Running classification model...',
      'Running OCR analysis...',
      'Processing finished successfully'
    ]
  };
}
