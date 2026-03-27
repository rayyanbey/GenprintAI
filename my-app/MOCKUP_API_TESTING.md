# 🚀 Mockup Generation API Testing Guide

This guide shows how to test the complete mockup generation flow with the Printful POD platform.

## 📋 Prerequisites

Before running tests, ensure:
1. ✅ **AI Service running** on port 8000:
   ```bash
   cd ai-services
   poetry run uvicorn app:app --host 0.0.0.0 --port 8000
   ```

2. ✅ **Next.js API running** on port 3000:
   ```bash
   cd my-app
   npm run dev
   ```

3. ✅ **Environment variables set**:
   - `HF_API_KEY` - Hugging Face API key (for FLUX.1-schnell image generation)
   - `PRINTFUL_API_KEY` - Printful API key (for POD platform)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

4. ✅ **Database connected** - Mockup records will be stored

## 🧪 Test Methods

### Method 1: PowerShell Script (Windows - Easiest)

```powershell
cd my-app
.\test-mockup-flow.ps1
```

**What it does:**
1. Generates image from AI service (prompt about retro t-shirt design)
2. Creates mockup task in Printful
3. Polls every 2 seconds until completion (up to 90 seconds)
4. Displays mockup image URL and printfile URL

---

### Method 2: Node.js Script (Cross-platform)

```bash
cd my-app
node test-mockup-flow.js
```

**Configuration:**
- Edit `TEST_CONFIG` in script to change:
  - `aiPrompt` - Design description
  - `productId` - Product to preview (default: 71 = T-shirt)
  - `placement` - Where on product (front/back/side/sleeve)

---

### Method 3: Bash Script (Mac/Linux)

```bash
cd my-app
chmod +x test-mockup-flow.sh
./test-mockup-flow.sh
```

---

### Method 4: Manual cURL Commands

If you prefer to test step-by-step manually:

#### STEP 1: Generate Image from AI Service

```bash
curl -X POST http://localhost:8000/generate-design \
  -H "Content-Type: application/json" \
  -d '{
    "text": "A cool retro vintage style t-shirt design with geometric shapes and bold colors"
  }'
```

**Response:**
```json
{
  "prompt": "A cool retro vintage...",
  "image_url": "https://res.cloudinary.com/..."
}
```

Save the `image_url` for next step.

---

#### STEP 2: Create Mockup Task

```bash
# First, get your session cookie from browser or login
# Then run:

curl -X POST http://localhost:3000/api/mockups \
  -H "Content-Type: application/json" \
  -H "Cookie: <YOUR_SESSION_COOKIE>" \
  -d '{
    "product_id": "71",
    "design_id": "test-design-'$(date +%s)'",
    "design_image_url": "https://res.cloudinary.com/.../your-image.png",
    "placement": "front",
    "format": "jpg"
  }'
```

**Response:**
```json
{
  "success": true,
  "taskKey": "123456789",
  "mockupId": "550e8400-...",
  "status": "pending",
  "message": "Mockup generation task created..."
}
```

Save the `taskKey` for polling.

---

#### STEP 3: Poll Mockup Status

```bash
# Poll every 2 seconds until status changes
curl http://localhost:3000/api/mockups/status/123456789 \
  -H "Cookie: <YOUR_SESSION_COOKIE>"
```

**Response (While Pending):**
```json
{
  "success": true,
  "status": "pending",
  "progress": 45
}
```

**Response (When Completed):**
```json
{
  "success": true,
  "status": "completed",
  "mockups": [
    {
      "placement": "front",
      "display_name": "Front Print",
      "mockup_url": "https://files.printful.com/m/123456/front.png",
      "expires_at": "2026-03-30T12:34:56Z"
    }
  ],
  "printfiles": [
    {
      "placement": "front",
      "url": "https://files.printful.com/f/789/front.png",
      "variant_ids": [4012]
    }
  ]
}
```

---

## 🔍 Troubleshooting

### Error: "AI service not responding" (Port 8000)

```bash
# Check if AI service is running
curl http://localhost:8000/docs

# If not, start it:
cd ai-services
poetry run uvicorn app:app --host 0.0.0.0 --port 8000
```

### Error: "Unauthorized" (401)

The API requires a valid session. Solutions:

**Option A:** Login first, then test
1. Go to http://localhost:3000
2. Click login and complete auth
3. Run test script (session is in cookies)

**Option B:** Use environment variable
```bash
# Linux/Mac:
export SESSION_COOKIE="<your_session_token>"
./test-mockup-flow.sh

# PowerShell:
$env:SESSION_COOKIE = "<your_session_token>"
.\test-mockup-flow.ps1
```

### Error: "Database error"

Make sure:
```bash
# Check database connection
npm run db:check

# Run migrations if needed
npm run db:migrate
```

### Mockup still "pending" after 90 seconds

This can happen if:
- Printful API is slow
- Design image is very large (resize to < 5MB)
- Printful is experiencing delays

**Check task status manually:**
```bash
# This will give you current status
curl http://localhost:3000/api/mockups/status/<TASK_KEY>
```

---

## 📊 Expected Timeline

| Step | Duration | Notes |
|------|----------|-------|
| AI image generation | 5-15s | FLUX.1-schnell model |
| Upload to Cloudinary | 1-2s | Fast CDN |
| Printful task creation | 1s | Immediate response |
| Mockup generation | 10-30s | Most time spent here |
| **Total** | **20-50s** | Typical full flow |

---

## ✅ Success Indicators

When everything works:

1. ✅ **AI Service Response** - Valid image URL
2. ✅ **Mockup Task Created** - Returns taskKey
3. ✅ **Status Updates** - Progress 0% → 100%
4. ✅ **Mockup Ready** - Image URL available
5. ✅ **Printfile Ready** - URL for fulfillment

All responses should have `"success": true`

---

## 🧑‍💻 Advanced Testing

### Test Different Products

Available products (via Printful):
```javascript
// T-shirt
product_id: "71"

// Hoodie
product_id: "52"

// Mug
product_id: "1"

// Long Sleeve
product_id: "21"
```

### Test Different Placements

```javascript
placement: "front"      // Front of shirt
placement: "back"       // Back of shirt
placement: "side"       // Side print
placement: "sleeve"     // Sleeve print
placement: "neck"       // Neck label
```

### Test Different Formats

```javascript
format: "jpg"  // JPEG format
format: "png"  // PNG format (better quality, larger file)
```

---

## 📝 Example Test Session

```bash
# 1. Start all services
cd ai-services && poetry run uvicorn app:app --port 8000 &
cd my-app && npm run dev &

# 2. Wait 5 seconds for services to start

# 3. Run PowerShell test
.\test-mockup-flow.ps1

# Output:
# 📸 STEP 1: Generate Image from AI Service
# ✅ Image generated: https://res.cloudinary.com/.../retro_design.png
#
# 🎨 STEP 2: Create Mockup Task  
# ✅ Mockup task created: Task Key 123456789
#
# ⏳ STEP 3: Poll Mockup Status
# [Attempt 1/45] Status: pending | Progress: 15%
# [Attempt 2/45] Status: pending | Progress: 35%
# [Attempt 3/45] Status: pending | Progress: 75%
# [Attempt 4/45] Status: completed | Progress: 100%
# ✅ Mockup generation completed!
#
# Mockup URL: https://files.printful.com/m/550e8400/front.png
# Expires: 72 hours
```

---

## 🚀 Next Steps

Once testing is complete:

1. **Try in UI:** Go to http://localhost:3000/mockup-request
2. **Test Cart:** Add mockup to cart
3. **Test Checkout:** Complete order flow
4. **Monitor DB:** Check `mockups` table for records

---

## 📞 Support

If tests fail, check:
1. All services running (ports 3000, 8000)
2. All env vars configured
3. Network connectivity
4. API rate limits (Printful: 30 req/min)
5. Log files for detailed errors

```bash
# Check logs
tail -f logs/api.log
tail -f logs/printful.log
```
