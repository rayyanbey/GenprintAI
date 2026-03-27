# Printful Mockup Generation Integration

## Overview
This document describes the complete integration with Printful's Mockup Generator API for creating product mockups with custom designs.

## Architecture

### Flow
```
1. Generate Design Image (AI Service)
   ↓
2. Create Mockup Task (POST /api/mockups)
   ↓
3. Fetch Variant IDs (GET /api/mockups/printfiles/:id)
   ↓
4. Call Printful API (POST /mockup-generator/create-task/:id)
   ↓
5. Poll Status (GET /api/mockups/status/:key)
   ↓
6. Retrieve Results (mockup_url, printfile_url)
```

## Key Components

### 1. Printful API Authentication
- **Endpoint**: `https://api.printful.com/`
- **Auth**: `Authorization: Bearer ${PRINTFUL_API_KEY}`
- **Rate Limit**: 10 requests/60s (established), 2 requests/60s (new stores)
- **Environment Variable**: `PRINTFUL` (in `.env`)

### 2. Mockup Service (`src/services/mockup.service.ts`)

#### createMockupTask()
Creates an async mockup generation task.

**Parameters:**
- `productId` (string|number): Product ID (e.g., "71" for T-shirt)
- `designId` (string): Unique design identifier
- `designImageUrl` (string): HTTPS URL of the design image
- `variantIds` (string[]): Optional variant IDs (auto-fetched if empty)
- `placement` (string): Placement location (default: "front")
- `options`:
  - `format`: "jpg" | "png" (default: "jpg")
  - `width`: 50-2000px (default: 1000)
  - `position`: Custom placement coordinates

**Returns:**
```typescript
{
  success: boolean,
  taskKey: string,  // Use to poll status
  mockupId: string, // UUID for database
  status: string    // "pending" | "completed" | "failed"
}
```

#### checkMockupStatus()
Polls the status of a mockup generation task.

**Parameters:**
- `taskKey` (string): Task key from createMockupTask

**Returns:**
```typescript
{
  success: boolean,
  status: string,  // "pending" | "completed" | "failed"
  mockups: [{      // When completed
    placement: string,
    mockup_url: string,
    expires_at: string
  }],
  printfiles: [{
    url: string
  }]
}
```

### 3. Next.js API Routes

#### POST /api/mockups
Creates a new mockup generation task.

**Request Body:**
```json
{
  "product_id": "71",
  "design_id": "design-123",
  "design_image_url": "https://...",
  "placement": "front",
  "format": "jpg"
}
```

**Dev Mode Note:**
- Use `?test=true` query parameter in development to bypass authentication
- Example: `POST /api/mockups?test=true`
- Only works when `NODE_ENV=development`

**Response:**
```json
{
  "success": true,
  "taskKey": "123456",
  "mockupId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending"
}
```

#### GET /api/mockups/status/[task_key]
Polls the status of a mockup generation task.

**Response:**
```json
{
  "success": true,
  "status": "completed",
  "mockupId": "550e8400-e29b-41d4-a716-446655440000",
  "mockups": [{
    "placement": "front",
    "mockup_url": "https://files.printful.com/m/123/front.png",
    "expires_at": "2026-03-30T12:34:56Z"
  }],
  "printfiles": [{
    "url": "https://files.printful.com/f/456/printfile.pdf"
  }]
}
```

#### GET /api/mockups/printfiles/[product_id]
Gets available placements and printfile information for a product.

**Response:**
```json
{
  "success": true,
  "productId": 71,
  "availablePlacements": {
    "front": "Front print",
    "back": "Back print",
    "sleeve_left": "Left sleeve"
  },
  "printfiles": [...],
  "variantPrintfiles": [
    {
      "variant_id": 9575,
      "placements": {...}
    }
  ]
}
```

## Key Technical Details

### Variant IDs
- Products have multiple variants (different colors, sizes, etc.)
- Variant IDs are NOT the same as product IDs
- For each product, valid variant IDs are fetched from:
  `GET /mockup-generator/printfiles/{product_id}`
- If no variants specified, service auto-fetches the first available

### Position Field (Required)
The Printful API requires a `position` field that defines where on the garment to place the design:

```json
{
  "placement": "front",
  "image_url": "https://...",
  "position": {
    "area_width": 1000,
    "area_height": 1000,
    "width": 800,        // Design width
    "height": 800,       // Design height
    "top": 100,          // Top offset
    "left": 100          // Left offset
  }
}
```

**Default Position (used when not specified):**
- Centers the 800x800px design in a 1000x1000px print area
- Works well for most use cases

### Error Handling
Common errors and fixes:

| Error | Cause | Fix |
|-------|-------|-----|
| `Position field is missing` | Position not specified | Service now provides default position |
| `No variants to generate` | Invalid variant IDs | Service auto-fetches valid variants |
| `No variant IDs provided` | Empty variant array | Service defaults to first available variant |
| `[object Object]` | Serialization error | Fixed by JSON.stringify on request body |
| 429 Too Many Requests | Rate limit exceeded | Wait 60 seconds, then retry |
| 401 Unauthorized | Invalid API key | Check PRINTFUL env variable |

## Environment Configuration

### Required Variables (.env)
```env
# Printful API Key
PRINTFUL=YTNHVzy80wXE8RNIgfluZ1tXjcZhwv0WaLLAqZXX

# Database (example)
DATABASE_URL=postgres://...

# NextAuth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

### Testing the Integration

#### Using Test Scripts
```bash
# PowerShell (Windows)
$env:SESSION_COOKIE='your-cookie'; .\test-mockup-flow.ps1

# Bash (Mac/Linux)
SESSION_COOKIE='your-cookie' ./test-mockup-flow.sh

# Node.js (Cross-platform)
node test-mockup-flow.js
```

#### Direct API Testing
```bash
# With test mode (dev only)
curl -X POST http://localhost:3000/api/mockups?test=true \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "71",
    "design_id": "test-123",
    "design_image_url": "https://...",
    "placement": "front"
  }'

# With session cookie
curl -X POST http://localhost:3000/api/mockups \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{...}'
```

## Testing Checklist

- [x] Printful API key is valid
- [x] Product 71 (T-shirt) exists
- [x] Variant IDs are correctly fetched
- [x] Position field is included in request
- [x] Request body JSON is properly formatted
- [x] Authorization header uses Bearer token
- [x] Rate limiting is handled
- [ ] Test complete flow end-to-end
- [ ] Verify mockup URLs are accessible
- [ ] Check database records are created
- [ ] Test with different products and variants

## Database Model

### Mockup Table
```typescript
{
  id: UUID,
  product_id: integer,
  design_id: string,
  task_key: string,        // Printful task key
  status: enum('pending'|'completed'|'failed'),
  placement: string,
  variant_id: integer,
  image_url: string,       // Mockup image URL
  printfile_url: string,   // Print file URL
  expires_at: datetime,    // URL expiration (72 hours)
  metadata: json,          // Additional data
  created_at: datetime,
  updated_at: datetime
}
```

## References

- [Printful Mockup Generator API Docs](https://developers.printful.com/docs/#section/Mockup-Generator)
- [Printful Products Catalog](https://developers.printful.com/docs/#section/Catalog)
- [Rate Limiting Info](https://developers.printful.com/docs/#section/Rate-limiting)

## Troubleshooting

### "Page not found" Error
- **Cause**: Variant ID doesn't exist for product ID
- **Fix**: Let service auto-fetch variant IDs from printfiles endpoint

### API Script Returns No Output
- **Cause**: Environment variables not loaded
- **Fix**: Use `require('dotenv').config()` in test scripts

### Test Hangs on Polling
- **Cause**: Mockup generation taking longer than expected
- **Fix**: Printful limits 20,000 mockups/account/24h; increase poll timeout

### Browser Shows Mockup But Script Doesn't
- **Cause**: Browser has session cookie, script doesn't
- **Fix**: Use `?test=true` parameter for automated testing in dev mode
