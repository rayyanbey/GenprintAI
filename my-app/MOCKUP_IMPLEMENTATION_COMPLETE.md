# ✅ PRINTFUL MOCKUP GENERATION - FULL INTEGRATION COMPLETE

## 🎯 What's Done

Your mockup generation system now implements the **correct Printful async API flow** with:

### ✅ Database & Models
- **Mockup model enhanced** with `task_key`, `status`, `expires_at`, `placement`, `printfile_url`
- Auto-migration via Sequelize (no manual migration needed)
- Tracks 72-hour URL expiration

### ✅ Backend Services (Production-Ready)
- `getPrintFilesForProduct(productId)` - Learn available placements
- `createMockupTask()` - Start async generation (returns taskKey)
- `checkMockupStatus(taskKey)` - Poll for results
- `createMultiAngleMockupTasks()` - Generate multiple angles at once
- `getCompletedMockups()` - Fetch ready mockups
- `cleanupExpiredMockups()` - Remove old URLs

### ✅ API Routes (4 New Endpoints)
```
GET  /api/mockups/printfiles/:product_id
POST /api/mockups (create single task)
POST /api/mockups/:product_id/all (create multi-angle tasks)
GET  /api/mockups/status/:task_key (poll for results)
```

### ✅ Frontend Hook
`useMockupGeneration()` - Handles entire async workflow:
- Auto-polling every 2-5 seconds
- Progress tracking (0-100%)
- Error recovery with retries
- Multi-task support for angles

### ✅ React Component
`MockupPreviewModalAsync.tsx` - Production-ready UI:
- Placement selector (front, back, side, etc.)
- Single vs multi-angle modes
- Real-time progress bar
- Angle switcher when multiple ready
- Download & add-to-cart buttons

### ✅ Documentation
`MOCKUP_INTEGRATION_GUIDE.md` - Complete guide with:
- 3-step API flow diagram
- Request/response examples
- Frontend hook usage
- Backend service usage
- Troubleshooting guide

---

## 🚀 Quick Start - Wire Into Products

### Step 1: Import the Component
```typescript
import MockupPreviewModalAsync from '@/components/Mockups/MockupPreviewModalAsync';
```

### Step 2: Add to Product Page
```typescript
'use client';

import { useState } from 'react';
import MockupPreviewModalAsync from '@/components/Mockups/MockupPreviewModalAsync';

export function ProductCard({ product, design }) {
  const [showMockup, setShowMockup] = useState(false);

  return (
    <div>
      {/* Product info */}
      <h2>{product.name}</h2>
      <p>${product.price}</p>

      {/* NEW: Preview button */}
      <button
        onClick={() => setShowMockup(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        👀 Preview on Product
      </button>

      {/* NEW: Mockup modal */}
      <MockupPreviewModalAsync
        productId={product.id}
        productName={product.name}
        price={product.price}
        designId={design?.id}
        designImageUrl={design?.artwork_file_url}
        isOpen={showMockup}
        onClose={() => setShowMockup(false)}
      />
    </div>
  );
}
```

### Step 3: Test It
1. Click "Preview on Product"
2. Modal opens, shows available placements
3. Click "Generate This Angle" or "Generate All Angles"
4. See progress bar (takes 10-30 seconds)
5. Mockup displays when ready
6. Can switch angles, download, or add to cart

---

## 📊 The 3-Step API Flow (Now Implemented)

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: Get Print Files                                 │
│ GET /printfiles/{product_id}                            │
│ → Returns: availablePlacements, printfile dimensions    │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 2: Create Task (ASYNC)                             │
│ POST /create-task/{product_id}                          │
│ Body: { variant_ids, files: [{ placement, image_url }]  │
│ → Returns: task_key (immediately!)                      │
└──────────────────────┬──────────────────────────────────┘
                       ↓ (MUST POLL - don't wait!)
┌─────────────────────────────────────────────────────────┐
│ STEP 3: Poll for Results                                │
│ GET /task?task_key=123456                               │
│ Response: { status: "pending" } → keep polling          │
│ Response: { status: "completed", mockups: [...] }       │
│ → Get mockup_url (valid 72 hours!)                      │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Implementation Details

### Async Pattern (Critical!)
```typescript
// ❌ DON'T DO THIS
const result = await fetch('/api/mockups', {...});
console.log(result.mockupData); // NOT READY YET!

// ✅ DO THIS
const { taskKey } = await fetch('/api/mockups', {...});
// Now poll /api/mockups/status/:taskKey in a loop
```

### URL Expiration (Critical!)
```typescript
// URLs expire in 72 hours!
// Must save to database: expires_at = now + 72 hours
// Or download and convert to base64
const mockupRecord = {
  image_url: 'https://mockup.png',
  expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000),
};
```

### Multi-Angle Generation
```typescript
// Creates 5 tasks in parallel (front, back, side, sleeve, neck)
const { taskKeys } = await generateMultiAngleMockups({
  product_id: '71',
  design_id: 'design-123',
  design_image_url: 'https://design.png',
});

// Poll each taskKey separately
for (const taskKey of taskKeys) {
  await checkStatus(taskKey); // Repeats until completed
}
```

---

##  📝 Files Created/Updated

### Created (5 files)
1. **`hooks/useMockupGeneration.ts`** - React hook with polling logic
2. **`components/Mockups/MockupPreviewModalAsync.tsx`** - Enhanced UI component
3. **`app/api/mockups/status/[task_key]/route.ts`** - Polling endpoint
4. **`app/api/mockups/printfiles/[product_id]/route.ts`** - Get capabilities
5. **`MOCKUP_INTEGRATION_GUIDE.md`** - Complete documentation

### Updated (5 files)
1. **`src/models/mockup.model.ts`** - Added fields for async tracking
2. **`src/services/mockup.service.ts`** - Rewritten with correct APIs
3. **`app/api/mockups/route.ts`** - Async task creation
4. **`app/api/mockups/[productId]/all/route.ts`** - Multi-angle tasks
5. **`src/utils/printful.ts`** - Already has correct headers

---

## 🎨 UI Flow (In the Modal)

```
IDLE
  ↓ Show placement selector
  └→ [Generate This Angle] [Generate All Angles]

PENDING
  ↓ Show progress bar with percentage
  └→ ⏱️ Generating mockup...

COMPLETED
  ↓ Show mockup image
  ├→ [Front] [Back] [Side] [Neck] (angle buttons)
  ├→ ⚠️ URL expires in 72 hours
  └→ [Download] [Add to Cart] [Generate Another]

FAILED
  ↓ Show error message
  └→ [Try Again]
```

---

## 🔧 Configuration

### Polling Interval
```typescript
useMockupGeneration({
  pollInterval: 3000,  // Check every 3 seconds (default: 3s)
  maxRetries: 45,      // Max 45 retries = ~90 seconds total
  autoStart: true,     // Auto-start polling on task creation
});
```

### Printful API Key
```typescript
// Must be set in .env
PRINTFUL_API_KEY="your_bearer_token"
// Or use: POD (environment variable name)
```

---

## ✔️ Verification Checklist

- [x] Model has `task_key`, `status`, `expires_at`
- [x] Service layer exports all 6 functions
- [x] API endpoint returns 202 Accepted for async
- [x] Polling endpoint tracks task status
- [x] Hook handles pending/completed/failed states
- [x] Component shows progress during generation
- [x] Component switches between angles
- [x] URLs are saved with expiration time
- [x] Error handling with retry logic
- [x] Documentation with examples

---

## 🚨 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Always pending" after 30s | Check PRINTFUL_API_KEY is set, increase maxRetries |
| "Task not found" | Ensure task_key is unique, don't create duplicate tasks |
| Mockup URL "expired" | URLs valid 72h, save them immediately, use cleanupExpiredMockups() |
| Design not appearing | Check design_image_url is publicly accessible |
| "Rate limited (429)" | Add exponential backoff, increase pollInterval |
| Modal doesn't open | Check isOpen prop is passed, onClose callback works |

---

## Next Steps (Optional Enhancements)

1. **Wire into product pages** ← START HERE
   - Add "Preview on Product" button to `/products` page
   - Pass design data to MockupPreviewModalAsync

2. **Show mockup in checkout**
   - Display selected angle in order preview
   - Store placement in cart item

3. **Email confirmation**
   - Include mockup image in order email
   - Download before 72-hour expiration

4. **Setup cleanup job**
   ```typescript
   // In a scheduled task (daily):
   await cleanupExpiredMockups();
   ```

5. **Performance optimization**
   - Cache printfiles for each product
   - Use React Query for data fetching
   - Batch multi-angle requests

---

## 📚 Full Documentation

See **`MOCKUP_INTEGRATION_GUIDE.md`** for:
- Complete API reference
- Request/response examples
- Frontend hook API
- Backend service functions
- Troubleshooting guide
- Image requirements
- Rate limiting strategies

---

## 🎉 You're Ready!

The mockup system is **production-ready**. Just:
1. Import `MockupPreviewModalAsync`
2. Add to product pages
3. Pass product & design info
4. Users can preview & order!

Questions? Check the guide or the code comments! 🚀
