# Mockup Generation Implementation - Complete Flow

## Overview
The system has been fully implemented with:
1. ✅ AI Design Service - Generates images from text prompts
2. ✅ Mockup Service - Creates mockups from designs
3. ✅ Frontend Components - UI for design generation and mockup preview
4. ✅ Async Polling - Handles long-running mockup generation

---

## Architecture

### 1. Design Generation Flow
```
User Input (DesignCanvas)
    ↓
AI Service (:8000/generate-design)
    ↓
AI generates image with FLUX.1
    ↓
Upload to Cloudinary
    ↓
Return public URL
    ↓
Display in DesignCanvas
```

### 2. Mockup Generation Flow
```
Generated Design Image URL
    ↓
User clicks "Preview Mockup"
    ↓
POST /api/mockups
    ├─ product_id
    ├─ design_id  
    ├─ design_image_url
    └─ placement (front/back/side/etc)
    ↓
Printful API: /mockup-generator/create-task/{product_id}
    ↓
Returns: task_key and status="pending"
    ↓
START POLLING: GET /api/mockups/status/[task_key]
    ↓
Poll every 2 seconds until status="completed"
    ↓
Extract mockups[] and printfiles[]
    ↓
Display mockup preview
    ↓
User can add to cart or download
```

---

## Components & Files

### Frontend Components
- **DesignCanvas.tsx** - Main design creation interface
  - Input: Text prompt
  - Action: Generate AI design
  - Display: Generated image
  - Action: Preview mockup

- **MockupPreviewModalAsync.tsx** - Mockup preview modal
  - Features:
    - Single angle generation (fast)
    - Multi-angle generation (all angles)
    - Progress indicator during polling
    - Download mockup image
    - Add to cart

- **useMockupGeneration.ts** - Custom hook for async mockup workflow
  - Handles: Task creation, polling, progress tracking
  - Methods:
    - `generateMockup()` - Single angle
    - `generateMultiAngleMockups()` - Multiple angles
    - Auto-polling with configurable interval

### Backend Services
- **mockup.service.ts**
  - `getPrintFilesForProduct()` - Get available placements
  - `createMockupTask()` - Create async task
  - `checkMockupStatus()` - Poll task status
  - `createMultiAngleMockupTasks()` - Parallel multi-angle

### API Endpoints
- **POST /api/mockups** - Create single mockup task
- **GET /api/mockups/status/[task_key]** - Poll status
- **GET /api/mockups/printfiles/[product_id]** - Get print files
- **POST /api/mockups/[productId]/all** - Create multi-angle tasks

---

## Usage Flow - Step by Step

### Step 1: User Input
```typescript
// In DesignCanvas.tsx
const [prompt, setPrompt] = useState('A cat astronaut on Mars');
```

### Step 2: Generate Design
```typescript
const response = await fetch('http://localhost:8000/generate-design', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: prompt }),
});

const data = await response.json();
const designImageUrl = data.image_url; // Public Cloudinary URL
```

### Step 3: Display Design
```typescript
<img src={designImageUrl} alt="Generated Design" />
```

### Step 4: User Clicks "Preview Mockup"
```typescript
// DesignCanvas passes the image URL to MockupPreviewModalAsync
<MockupPreviewModalAsync
  isOpen={showMockupModal}
  onClose={() => setShowMockupModal(false)}
  productId="1"  // Printful product ID
  productName="T-Shirt"
  price={24.99}
  designImageUrl={generatedImage}
/>
```

### Step 5: Generate Mockup (Inside Modal)
```typescript
// User selects placement (front/back/etc) and clicks button
await generateMockup({
  product_id: "1",
  design_id: "design_123456789",
  design_image_url: "https://cloudinary.../image.jpg",
  placement: "front"  // or "back", "side", etc
});
```

### Step 6: Backend Creates Task
```typescript
// POST /api/mockups
POST /mapi/mockups
{
  "product_id": "1",
  "design_id": "design_123456789",
  "design_image_url": "https://cloudinary.../image.jpg",
  "placement": "front"
}

Response:
{
  "success": true,
  "taskKey": "task_abc123xyz789",
  "status": "pending"
}
```

### Step 7: Polling Starts
```typescript
// Hook automatically polls GET /api/mockups/status/task_abc123xyz789
// Every 2 seconds until completed (or failed)

// Poll Response (intermediate):
{
  "status": "pending",
  "progress": 45
}

// Poll Response (completed):
{
  "status": "completed",
  "mockups": [
    {
      "placement": "front",
      "mockup_url": "https://printful-cdn.../mockup.jpg",
      "display_name": "Front"
    }
  ],
  "printfiles": [
    {
      "placement": "front",
      "url": "https://printful-cdn.../printfile.jpg"
    }
  ]
}
```

### Step 8: Display Mockup
```typescript
// Component shows mockup image
<img src={mockup_url} alt="Product Mockup" />

// Display countdown for expiration
"⚠️ Mockup images expire in 72 hours"
```

### Step 9: User Actions
- **Download**: User clicks "Download" → Downloads mockup image
- **Add to Cart**: User clicks "Add to Cart" → Adds to shopping cart
- **Generate Another**: Resets and allows generating new mockup

---

## Configuration

### DesignCanvas.tsx
```typescript
// AI Service URL (adjust if needed)
const AI_SERVICE_URL = 'http://localhost:8000';

// Change default product
const [selectedProductId, setSelectedProductId] = useState('1');
```

### MockupPreviewModalAsync.tsx
```typescript
// Polling interval (ms)
pollInterval: 2000  // Check status every 2 seconds

// Max retries
maxRetries: 45  // Up to 90 seconds of polling
```

---

## Testing Checklist

- [ ] AI Service running on :8000
  - `cd ai-services && uvicorn app:app --port 8000`

- [ ] Next.js app running on :3000
  - `cd my-app && npm run dev`

- [ ] Database configured with Printful products
  - Products must exist in database with valid printful_id

- [ ] Test Design Generation
  - Go to Design Studio (/design-studio)
  - Enter prompt: "A cat wearing sunglasses"
  - Click "Generate"
  - Verify image appears

- [ ] Test Mockup Generation
  - Click "Preview Mockup" button
  - Select placement (front/back)
  - Click "Generate This Angle"
  - Verify mockup appears after polling completes

- [ ] Test Multi-Angle
  - Click "Generate All Angles"
  - Verify multiple mockups appear
  - Click through different angles

---

## Troubleshooting

### "Failed to generate design"
- Check AI service is running: `curl http://localhost:8000/`
- Check Cloudinary credentials in `.env`
- Check Hugging Face API key

### "Failed to create mockup task"
- Check product_id exists in Printful
- Check Printful API key in `.env`
- Check network connectivity

### "Mockup generation failed"
- Check design image URL is publicly accessible
- Check Cloudinary image is not expired
- Wait and retry (sometimes Printful is slow)

### "Polling timeout"
- Increase `maxRetries` in useMockupGeneration options
- Check polling interval is reasonable
- Look at browser console for errors

---

## Performance Notes

- First design generation: ~5-15 seconds
- Mockup generation: ~10-30 seconds per angle
- Multi-angle: Generates in parallel (~10-30 seconds for all)
- Mockup URLs valid for 72 hours
- Cache design images in browser for instant preview

---

## Future Enhancements

- [ ] Save designs to user account
- [ ] Design gallery/history
- [ ] Custom positioning for designs
- [ ] Batch mockup generation
- [ ] Print file download for production
- [ ] Advanced design editor with canvas tools
- [ ] Template library integration
