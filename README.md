# AI-Powered Image Document Intelligence

A Next.js 14 + TypeScript + Tailwind CSS demo application for AI-powered multi-modal analysis including object detection, instance segmentation, classification, and OCR.

## Features

- 🎯 **Simulation-first approach**: Works without backend by default
- 📱 **Responsive design**: Mobile and desktop friendly
- ♿ **Accessible**: Alt text, keyboard navigation, focus styles
- 🎨 **Multi-modal visualization**: Bounding boxes, polygons, labels, and OCR overlays
- 🔄 **Environment toggle**: Automatically switches between simulation and live API
- 📊 **Comprehensive results**: Support for detection, segmentation, classification, and OCR contracts
- 📋 **Collapsible log tray**: Request/response inspection with processing logs
- 🎪 **Sample picker**: Built-in sample media for quick testing
- 🎨 **Modern UI**: Clean overlays, results panels, and processing indicators

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with dark mode support
- **Upload**: react-dropzone for drag & drop functionality
- **Canvas**: HTML5 Canvas API for visualization

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd lid-vizion-demo
   npm install
   ```

2. **Run the development server**:
```bash
npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Usage

#### Simulation Mode (Default)

The app runs in simulation mode by default, using mock data from `/public/mock/response.json`. Simply:

1. Upload an image or video (PNG, JPG, GIF, WebP, MP4, WebM, MOV) or select a sample
2. Click "Run Analysis"
3. View results with multiple overlay types:
   - **Detections**: Bounding boxes (solid lines)
   - **Instances**: Segmentation polygons (filled shapes)
   - **Labels**: Classification results with attributes
   - **OCR**: Text extraction with dashed boxes
4. Inspect request/response data in the collapsible log tray

#### Live API Mode

To connect to a real Lid Vizion API:

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Set your API credentials:
   ```env
   NEXT_PUBLIC_LV_API_URL=https://api.lidvizion.com
   NEXT_PUBLIC_LV_API_KEY=your_api_key_here
   ```

3. Restart the development server

## Project Structure

```
├── public/
│   ├── sample/          # Sample media files for testing
│   └── mock/            # Mock JSON responses
├── src/
│   ├── app/
│   │   └── page.tsx     # Main application page
│   ├── components/      # React components
│   │   ├── Upload.tsx   # Drag & drop file upload with sample picker
│   │   ├── Canvas.tsx   # Multi-modal visualization (boxes, polygons, labels, OCR)
│   │   ├── ResultsPanel.tsx  # Comprehensive results for all contract types
│   │   ├── RunButton.tsx     # Analysis trigger button
│   │   └── LogTray.tsx       # Collapsible log tray with request/response
│   └── lib/
│       └── lv.ts        # Environment toggle & API client
├── .env.example         # Environment variables template
├── lv-template.json     # Project configuration template
└── README.md
```

## API Integration

The app automatically detects the environment and switches modes:

### Simulation Mode
- **Triggered when**: `NEXT_PUBLIC_LV_API_URL` is not set
- **Data source**: `/public/mock/response.json`
- **Latency**: 600ms simulated delay
- **Status indicator**: Yellow dot (Demo Mode)

### Live Mode
- **Triggered when**: `NEXT_PUBLIC_LV_API_URL` is set
- **Endpoint**: `${NEXT_PUBLIC_LV_API_URL}/v1/run`
- **Authentication**: `x-api-key` header with `NEXT_PUBLIC_LV_API_KEY`
- **Status indicator**: Green dot (Live API)

## Supported File Formats

### Images
- PNG, JPG, JPEG, GIF, WebP

### Videos
- MP4, WebM, MOV

## Multi-Modal Results

The app supports multiple analysis types with comprehensive visualization:

### Object Detection
- **Bounding boxes**: Solid rectangular overlays
- **Classes**: Lid, container, bottle, cap, etc.
- **Confidence scores**: Percentage accuracy for each detection
- **Color coding**: Blue for lids, green for containers, etc.

### Instance Segmentation  
- **Polygon masks**: Precise object boundaries
- **Semi-transparent fills**: Clear shape visualization
- **Per-instance labels**: Class and confidence scores

### Classification
- **Global labels**: Overall image/object classification
- **Attributes**: Material, color, condition properties
- **Confidence scores**: Classification certainty

### OCR Text Extraction
- **Dashed boxes**: Text region boundaries
- **Extracted text**: Recognized character sequences
- **Confidence scores**: OCR accuracy metrics

### Additional Features
- **Summary statistics**: Counts by type, processing time
- **Processing logs**: Step-by-step analysis feedback
- **Request/Response inspection**: Full API data in log tray

## Accessibility Features

- **Keyboard navigation**: Full keyboard support
- **Screen reader friendly**: Proper ARIA labels and descriptions
- **Focus indicators**: Clear visual focus states
- **Alt text**: Descriptive text for images and icons
- **Color contrast**: WCAG compliant color schemes
- **Error states**: Clear error messages and recovery options

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. **Components**: Add to `/src/components/`
2. **API functions**: Extend `/src/lib/lv.ts`
3. **Mock data**: Update `/public/mock/response.json`
4. **Styles**: Use Tailwind CSS classes

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_LV_API_URL` | Lid Vizion API base URL | No (simulation mode if unset) |
| `NEXT_PUBLIC_LV_API_KEY` | API authentication key | Only if using live API |

## Deployment

### Vercel (Recommended)

1. Push to GitHub/GitLab/Bitbucket
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

1. Build the project: `npm run build`
2. Deploy the `.next` folder and `public` directory
3. Set environment variables in your platform

## Mock JSON Contracts

The demo supports multiple contract types for comprehensive testing:

### Detection Contract
```json
{ "detections": [{"class": "lid", "score": 0.93, "box": [120, 80, 260, 210]}] }
```

### Segmentation Contract  
```json
{ "instances": [{"class": "container", "score": 0.88, "polygon": [[34, 50], [60, 48], [70, 80]]}] }
```

### Classification Contract
```json
{ "labels": [{"class": "plastic_container", "score": 0.76, "attributes": {"material": "plastic"}}] }
```

### OCR Contract
```json
{ "blocks": [{"text": "RECYCLING CODE 1", "score": 0.94, "box": [40, 120, 220, 160]}] }
```

## Quality Gates

- ✅ `npm run build` passes
- ✅ ESLint passes with no `any` types without reason
- ✅ No external calls in simulation mode  
- ✅ Runs locally with `npm i && npm run dev`
- ✅ Mobile-friendly responsive design
- ✅ Environment toggle works correctly

## License

This project is a demo application for Lid Vizion technology.

**Note**: Built with Cursor in simulation mode. No external API calls in demo mode.

## Support

For questions about the Lid Vizion API or this demo, please contact the development team.