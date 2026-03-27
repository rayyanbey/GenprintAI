# 🎯 Mockup API Test - Quick Reference

## One-Line Commands

### Windows (PowerShell)
```powershell
cd my-app; .\test-mockup-flow.ps1
```

### Mac/Linux (Bash)
```bash
cd my-app && chmod +x test-mockup-flow.sh && ./test-mockup-flow.sh
```

### Node.js (Any OS)
```bash
cd my-app && node test-mockup-flow.js
```

---

## Manual Test (Step-by-Step with cURL)

### 1️⃣ Generate Image
```bash
curl -X POST http://localhost:8000/generate-design \
  -H "Content-Type: application/json" \
  -d '{"text": "cool retro t-shirt design with neon colors"}'
```
→ Copy the `image_url` from response

### 2️⃣ Create Mockup Task (with test mode)
```bash
curl -X POST "http://localhost:3000/api/mockups?test=true" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "71",
    "design_id": "test-'$(date +%s)'",
    "design_image_url": "<PASTE_IMAGE_URL_HERE>",
    "placement": "front"
  }'
```
→ Copy the `taskKey` from response

**Note:** The `?test=true` parameter enables development mode testing without authentication

### 3️⃣ Poll Status (with test mode)
```bash
curl "http://localhost:3000/api/mockups/status/<PASTE_TASK_KEY_HERE>?test=true"
```
→ Repeat until `status` is `"completed"`

---

## Common Issues & Fixes

### ❌ "AI service not responding"
- **Cause:** Port 8000 not running
- **Fix:** `cd ai-services && poetry run uvicorn app:app --port 8000`

### ❌ "Unauthorized (401)"
- **Cause:** No valid session
- **Fix:** Use `?test=true` parameter in dev mode (see test scripts), OR login at http://localhost:3000 first

### ❌ "Failed to create mockup"
- **Cause:** Missing/invalid `design_image_url`
- **Fix:** Make sure image URL starts with `https://` and is accessible

### ❌ "Still pending after 90s"
- **Cause:** Printful API slow or image too large
- **Fix:** Check status manually: `curl "http://localhost:3000/api/mockups/status/<TASK_KEY>?test=true"`

---

## 🧪 Test Mode

**In development mode**, you can test the API without a valid session by adding `?test=true` to requests:

```bash
# Create mockup in test mode (no auth required)
curl -X POST "http://localhost:3000/api/mockups?test=true" ...

# Poll status in test mode  
curl "http://localhost:3000/api/mockups/status/KEY?test=true"
```

**Note:** Test mode is only active in development (`NODE_ENV=development`). Production always requires authentication.

---

## Expected Results

✅ **Successful flow** (20-50 seconds):
1. Image generated (5-15s)
2. Mockup task created instantly
3. Polling starts, progress updates
4. After 10-30s: Status = `"completed"`
5. Mockup image URL available
6. Printfile URL available

---

## Key Endpoints

| What | Endpoint | Method |
|------|----------|--------|
| Generate Image | `http://localhost:8000/generate-design` | POST |
| Create Mockup | `http://localhost:3000/api/mockups` | POST |
| Check Status | `http://localhost:3000/api/mockups/status/:key` | GET |
| Get Printfiles | `http://localhost:3000/api/mockups/printfiles/:id` | GET |

---

## Test Products

```
71 = T-Shirt (Front/Back)
52 = Hoodie
1 = Mug
21 = Long Sleeve
```

## Test Placements

```
front
back
side
sleeve
neck
```

---

## Response Examples

### Create Task Response (Status 202)
```json
{
  "success": true,
  "taskKey": "123456789",
  "mockupId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending"
}
```

### Poll Response - Pending
```json
{
  "success": true,
  "status": "pending",
  "progress": 45
}
```

### Poll Response - Completed
```json
{
  "success": true,
  "status": "completed",
  "mockups": [{
    "placement": "front",
    "mockup_url": "https://files.printful.com/m/123/front.png",
    "expires_at": "2026-03-30T12:34:56Z"
  }],
  "printfiles": [{
    "placement": "front",
    "url": "https://files.printful.com/f/456/front.png"
  }]
}
```

---

## Timestamps

- **Image Generation:** 5-15 seconds
- **Task Creation:** < 1 second
- **Mockup Generation:** 10-30 seconds
- **Total:** 20-50 seconds typical

⚠️ **Note:** Mockup URLs expire in **72 hours** from generation!

---

## Database Schema

```sql
-- Mockup records stored here
SELECT * FROM mockups WHERE task_key = '123456789';

-- Columns:
id               -- UUID primary key
product_id       -- Printful product ID
design_id        -- Your design ID
task_key         -- Async task identifier
status           -- pending | completed | failed
placement        -- front | back | side | sleeve | neck
image_url        -- Mockup image URL (72hr expiration)
printfile_url    -- URL used for order fulfillment
expires_at       -- When mockup URL expires
created_at       -- Timestamp
```

---

## Advanced: Custom Image Positioning

```bash
curl -X POST http://localhost:3000/api/mockups \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "71",
    "design_id": "test",
    "design_image_url": "https://...",
    "placement": "front",
    "position": {
      "area_width": 1800,
      "area_height": 2400,
      "width": 1800,
      "height": 1800,
      "top": 300,
      "left": 0
    }
  }'
```

---

## Monitoring

Watch database realtime:
```bash
npm run db:watch "SELECT * FROM mockups ORDER BY created_at DESC"
```

Check API logs:
```bash
tail -f logs/api.log | grep mockup
tail -f logs/printful.log
```

---

## Next Steps

1. ✅ Test this flow manually
2. 🎨 Use in React UI (`/mockup-request`)
3. 🛒 Add to cart and checkout
4. 📦 Monitor order fulfillment
5. 📊 Track mockup URL expiration

