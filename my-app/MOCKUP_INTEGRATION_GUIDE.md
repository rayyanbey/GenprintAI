# Printful Mockup Generation - Complete Integration Guide

> ✅ **IMPORTANT**: This implements the correct Printful async mock up generation API flow with proper polling, URL expiration handling, and multi-angle support.

## 🔄 Flow Overview

The mockup generation follows a **3-step async pattern**:

```
1. GET /mockup-generator/printfiles/{product_id}
       ↓ (Learn available placements & print sizes)
       
2. POST /mockup-generator/create-task/{product_id}
       ↓ (Returns task_key immediately, starts async processing)
       
3. GET /mockup-generator/task?task_key=XYZ (Poll repeatedly)
       ↓ (Until status = "completed" or "failed")
       
Returns: mockup_url (valid for 72 hours)
```

---

## 📚 API Endpoints

### 1️⃣ Get Print Files (Learn capabilities)
```
GET /api/mockups/printfiles/{product_id}
```

**Purpose**: Discover what placements are available and print area dimensions

**Response**:
```json
{
  "success": true,
  "data": {
    "productId": "71",
    "availablePlacements": {
      "front": "Front print",
      "back": "Back print"
    },
    "printfiles": [
      {
        "printfile_id": 1,
        "width": 1800,
        "height": 2400,
        "dpi": 150
      }
    ],
    "variantPrintfiles": [
      {
        "variant_id": 4012,
        "placements": {
          "front": 1,
          "back": 1
        }
      }
    ]
  }
}
```

**Use For**: Knowing which placements to request, scaling designs to print area

---

### 2️⃣ Create Mockup Task (Start generation)
```
POST /api/mockups
```

**Required Body**:
```json
{
  "product_id": "71",
  "design_id": "design-123",
  "design_image_url": "https://your-design.png",
  "placement": "front"
}
```

**Optional Body** (for advanced positioning):
```json
{
  "product_id": "71",
  "design_id": "design-123",
  "design_image_url": "https://your-design.png",
  "variant_ids": ["4012"],
  "placement": "front",
  "format": "jpg",
  "position": {
    "area_width": 1800,
    "area_height": 2400,
    "width": 1800,
    "height": 1800,
    "top": 300,
    "left": 0
  }
}
```

**Response** (202 Accepted - async):
```json
{
  "success": true,
  "taskKey": "123456",
  "mockupId": "uuid-123",
  "status": "pending",
  "message": "Mockup generation task created. Poll /api/mockups/status/:task_key to check status."
}
```

**⚡ Important**: Returns **immediately** with `taskKey`. Must poll for results!

---

### 3️⃣ Poll Mockup Status (Check completion)
```
GET /api/mockups/status/{task_key}
```

**Response (Still pending)**:
```json
{
  "success": true,
  "status": "pending",
  "mockupId": "uuid-123"
}
```

**Response (Completed)**:
```json
{
  "success": true,
  "status": "completed",
  "mockupId": "uuid-123",
  "mockups": [
    {
      "placement": "front",
      "display_name": "Front Print",
      "variant_ids": [4012],
      "mockup_url": "https://mockup-image.png"
    }
  ],
  "printfiles": [
    {
      "variant_ids": [4012],
      "placement": "front",
      "url": "https://printfile.png"
    }
  ]
}
```

**Response (Failed)**:
```json
{
  "success": false,
  "status": "failed",
  "error": "Mockup generation failed"
}
```

---

### 4️⃣ Create Multi-Angle Mockups (All at once)
```
POST /api/mockups/{product_id}/all
```

**Body**:
```json
{
  "design_id": "design-123",
  "design_image_url": "https://your-design.png",
  "variant_ids": ["4012"],
  "placements": ["front", "back", "side", "sleeve", "neck"]
}
```

**Response**:
```json
{
  "success": true,
  "taskKeys": ["key1", "key2", "key3", "key4", "key5"],
  "totalTasks": 5,
  "failedCount": 0,
  "message": "Created 5 mockup tasks. Poll /api/mockups/status/:task_key to check status."
}
```

**Then**: Poll each `taskKey` separately for results

---

## 🎣 Frontend Implementation

### Using the `useMockupGeneration` Hook

```typescript
'use client';

import { useMockupGeneration } from '@/hooks/useMockupGeneration';

export function MockupPreviewPage() {
  const {
    taskKey,
    status,
    mockupData,
    error,
    progress,
    generateMockup,
    generateMultiAngleMockups,
    stopPolling,
    reset,
  } = useMockupGeneration({
    pollInterval: 3000, // Check every 3 seconds
    maxRetries: 30,     // Give up after 30 retries
  });

  const handleGenerateSingleMockup = async () => {
    try {
      await generateMockup({
        product_id: '71',
        design_id: 'design-abc',
        design_image_url: 'https://example.com/design.png',
        placement: 'front',
      });
    } catch (err) {
      console.error('Failed to generate mockup:', err);
    }
  };

  const handleGenerateAllAngles = async () => {
    try {
      await generateMultiAngleMockups({
        product_id: '71',
        design_id: 'design-abc',
        design_image_url: 'https://example.com/design.png',
        placements: ['front', 'back'],
      });
    } catch (err) {
      console.error('Failed to generate mockups:', err);
    }
  };

  return (
    <div>
      <button onClick={handleGenerateSingleMockup}>
        Generate Mockup
      </button>

      <button onClick={handleGenerateAllAngles}>
        Generate All Angles
      </button>

      {/* Status Display */}
      <div>
        Status: {status}
        <div style={{ width: '100%', height: '20px', background: '#eee' }}>
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: '#4CAF50',
              transition: 'width 0.3s',
            }}
          />
        </div>
      </div>

      {/* Loading State */}
      {status === 'pending' && (
        <div>Generating mockup... ({progress}%)</div>
      )}

      {/* Error State */}
      {status === 'failed' && (
        <div style={{ color: 'red' }}>
          Error: {error}
          <button onClick={reset}>Try Again</button>
        </div>
      )}

      {/* Success State */}
      {status === 'completed' && mockupData?.mockups && (
        <div>
          {mockupData.mockups.map((mockup: any) => (
            <div key={mockup.placement}>
              <h3>{mockup.display_name}</h3>
              <img
                src={mockup.mockup_url}
                alt={mockup.placement}
                style={{ maxWidth: '400px' }}
              />
              <p>⚠️ URL expires in 72 hours</p>
            </div>
          ))}

          <button onClick={reset}>Generate Another</button>
          <button onClick={stopPolling}>Stop</button>
        </div>
      )}
    </div>
  );
}
```

---

## 🐍 Backend Service Usage

```typescript
import {
  getPrintFilesForProduct,
  createMockupTask,
  checkMockupStatus,
  createMultiAngleMockupTasks,
} from '@/src/services/mockup.service';

// Step 1: Learn capabilities
const files = await getPrintFilesForProduct('71');
console.log(files.data.availablePlacements); // { front: "Front print", ... }

// Step 2: Create task
const task = await createMockupTask(
  '71',                              // product_id
  'design-123',                      // design_id
  'https://your-design.png',         // design_image_url
  ['4012'],                          // variant_ids
  'front',                           // placement
  { format: 'jpg' }                  // options
);

console.log(task.taskKey); // Store this!

// Step 3: Poll for result
const result = await checkMockupStatus(task.taskKey);

if (result.status === 'completed') {
  // Use mockup_url now
  const mockupUrl = result.mockups[0].mockup_url;
  
  // ⚠️ IMPORTANT: URLs expire in 72 hours!
  // You MUST save/download them:
  saveToDatabase(mockupUrl);
}

// For multiple angles:
const multiTask = await createMultiAngleMockupTasks(
  '71',
  'design-123',
  'https://your-design.png',
  ['4012'],
  ['front', 'back', 'side']
);
// Polling is handled by checking individual taskKeys
```

---

## ⚠️ Critical Implementation Details

### 1. **Async Nature - Must Poll**
```typescript
// ❌ WRONG - Don't wait for instant result
const result = await generateMockup(...);
// result.mockupData is NOT ready yet!

// ✅ CORRECT - Store task key and poll
const { taskKey } = await generateMockup(...);
// ... wait 5-10 seconds
const result = await checkStatus(taskKey);
// Now mockupData is ready
```

### 2. **URL Expiration (72 hours)**
```typescript
// ⚠️ Mockup URLs expire in 72 hours!
// Must be downloaded/saved:

// Save to database
await saveMockupRecord({
  mockup_url: mockupUrl,
  expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000),
  saved_at: new Date(),
});

// Or download and convert to base64
const response = await fetch(mockupUrl);
const blob = await response.blob();
const base64 = await blobToBase64(blob);
// Store base64 data
```

### 3. **Image Requirements**
- **Max size**: 50MB
- **Format**: PNG, JPG (PNG recommended)
- **DPI**: 150-300 DPI for quality
- **Aspect ratio**: Must match print area

### 4. **Polling Best Practices**
```typescript
// Check after ~10 seconds (first time)
// Then poll every 2-5 seconds until completed

// Use exponential backoff if needed:
let pollCount = 0;
const baseDelay = 3000; // 3 seconds
const maxDelay = 15000; // 15 seconds

const delay = Math.min(maxDelay, baseDelay * Math.pow(1.5, pollCount));
```

### 5. **Cleanup Expired Mockups**
```typescript
import { cleanupExpiredMockups } from '@/src/services/mockup.service';

// Run daily via cron or scheduled task
await cleanupExpiredMockups();
// Deletes mockups where expires_at < now
```

---

## 📊 Database Schema

```typescript
// Mockup model fields:
{
  id: string,                    // UUID
  product_id: string,            // From Printful
  design_id: string,             // Your design
  variant_id: string,            // Product variant
  task_key: string,              // Printful async task key (UNIQUE)
  status: 'pending' | 'completed' | 'failed',
  placement: string,             // front, back, side, etc.
  image_url: string,             // Mockup image URL
  printfile_url: string,         // Actual print file URL
  expires_at: Date,              // 72 hours from creation
  metadata: JSON,                // Task details
  created_at: Date,
  updated_at: Date,
}
```

---

## 🧪 Complete Example

```typescript
// pages/design-preview.tsx
'use client';

import { useMockupGeneration } from '@/hooks/useMockupGeneration';
import { useEffect, useState } from 'react';

export default function DesignPreview({
  designId,
  productId,
  designImageUrl,
}: {
  designId: string;
  productId: string;
  designImageUrl: string;
}) {
  const {
    status,
    mockupData,
    error,
    progress,
    generateMultiAngleMockups,
  } = useMockupGeneration();

  const [selectedAngle, setSelectedAngle] = useState('front');

  useEffect(() => {
    // Auto-generate on mount
    generateMultiAngleMockups({
      product_id: productId,
      design_id: designId,
      design_image_url: designImageUrl,
      placements: ['front', 'back'],
    });
  }, [designId, productId, designImageUrl, generateMultiAngleMockups]);

  if (status === 'pending') {
    return <div>Generating mockup... {progress}%</div>;
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

  if (status === 'completed') {
    const mockups = mockupData?.mockups || [];
    const currentMockup = mockups.find(
      (m: any) => m.placement === selectedAngle
    );

    return (
      <div>
        <div>
          {mockups.map((mockup: any) => (
            <button
              key={mockup.placement}
              onClick={() => setSelectedAngle(mockup.placement)}
              style={{
                fontWeight: selectedAngle === mockup.placement ? 'bold' : 'normal',
              }}
            >
              {mockup.display_name}
            </button>
          ))}
        </div>

        {currentMockup && (
          <img
            src={currentMockup.mockup_url}
            alt={selectedAngle}
            style={{ maxWidth: '100%' }}
          />
        )}

        <button
          onClick={() => {
            // Add to cart with selected angle
            addToCart({
              product_id: productId,
              design_id: designId,
              mockup_placement: selectedAngle,
            });
          }}
        >
          Add to Cart
        </button>
      </div>
    );
  }

  return null;
}
```

---

## 🚀 Quick Start Checklist

- [ ] Update Mockup model with `task_key`, `status`, `expires_at` fields
- [ ] Create `/api/mockups` endpoint (POST)
- [ ] Create `/api/mockups/status/[task_key]` endpoint (GET polling)
- [ ] Create `/api/mockups/printfiles/[product_id]` endpoint (GET)
- [ ] Create `/api/mockups/[productId]/all` endpoint (POST multi-angle)
- [ ] Export service functions: `createMockupTask`, `checkMockupStatus`, `getPrintFilesForProduct`
- [ ] Create `useMockupGeneration` hook for components
- [ ] Test with real Printful API
- [ ] Implement URL expiration cleanup job
- [ ] Wire MockupPreviewModal into product pages

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Task not found" | Check task_key is unique, wait longer before polling |
| "Image URL expired" | Save mockup URLs before 72 hours pass |
| "Always pending" | Check Printful API key, increase poll retry limit |
| "400 Bad Request" | Validate design_image_url is accessible, image format correct |
| "Rate limited (429)" | Add exponential backoff, increase poll interval |

---

## 📖 References

- [Printful Mockup Generator API](https://developers.printful.com/docs#tag/Mockup-Generator)
- [Printful API Authentication](https://developers.printful.com/docs#section/Authentication)
- Full flow documented above ☝️
