# API Request/Response Reference

> This matches the Printful Mockup Generator API v2 exactly as documented

## 🔄 Full Flow: Request & Response Examples

### 1️⃣ GET Print Files (Step 1)

**Request**:
```bash
curl -X GET https://api.printful.com/mockup-generator/printfiles/71 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Your API Endpoint**:
```bash
GET /api/mockups/printfiles/71
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "productId": "71",
    "availablePlacements": {
      "front": "Front print",
      "back": "Back print",
      "side": "Side print",
      "sleeve": "Sleeve print",
      "neck": "Neck print"
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
          "back": 1,
          "side": 2,
          "sleeve": 3,
          "neck": 4
        }
      }
    ]
  }
}
```

---

### 2️⃣ POST Create Mockup Task (Step 2)

#### Simple Request

**Your API Endpoint**:
```bash
POST /api/mockups
Authorization: Bearer {session_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "product_id": "71",
  "design_id": "design-abc123",
  "design_image_url": "https://your-cdn.com/designs/abc123.png",
  "placement": "front",
  "format": "jpg"
}
```

**Response** (202 Accepted - Async!):
```json
{
  "success": true,
  "taskKey": "123456789",
  "mockupId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "message": "Mockup generation task created. Poll /api/mockups/status/:task_key to check status."
}
```

**Internal Printful Request** (How it's called internally):
```bash
POST https://api.printful.com/mockup-generator/create-task/71
Authorization: Bearer PRINTFUL_API_KEY
Content-Type: application/json

{
  "variant_ids": [4012],
  "format": "jpg",
  "files": [
    {
      "placement": "front",
      "image_url": "https://your-cdn.com/designs/abc123.png"
    }
  ]
}
```

**Internal Printful Response**:
```json
{
  "code": 200,
  "result": {
    "task_key": "123456789",
    "status": "pending"
  }
}
```

---

#### Advanced Request (with Positioning)

**Request Body** (Optional - for precise positioning):
```json
{
  "product_id": "71",
  "design_id": "design-abc123",
  "design_image_url": "https://your-cdn.com/designs/abc123.png",
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

---

### 3️⃣ GET Poll Status (Step 3)

**Your API Endpoint** (Poll every 2-5 seconds):
```bash
GET /api/mockups/status/123456789
Authorization: Bearer {session_token}
```

#### Response (Still Pending)

```json
{
  "success": true,
  "status": "pending",
  "mockupId": "550e8400-e29b-41d4-a716-446655440000"
}
```

→ **Keep polling in 3 seconds**

#### Response (Completed!)

```json
{
  "success": true,
  "status": "completed",
  "mockupId": "550e8400-e29b-41d4-a716-446655440000",
  "mockups": [
    {
      "placement": "front",
      "display_name": "Front Print",
      "variant_ids": [4012],
      "mockup_url": "https://files.printful.com/m/123456/front.png"
    }
  ],
  "printfiles": [
    {
      "variant_ids": [4012],
      "placement": "front",
      "url": "https://files.printful.com/f/789/front.png"
    }
  ]
}
```

#### Response (Failed)

```json
{
  "success": false,
  "status": "failed",
  "error": "Invalid image format or size"
}
```

---

### 4️⃣ POST Multi-Angle Tasks

**Your API Endpoint**:
```bash
POST /api/mockups/71/all
Authorization: Bearer {session_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "design_id": "design-abc123",
  "design_image_url": "https://your-cdn.com/designs/abc123.png",
  "variant_ids": ["4012"],
  "placements": ["front", "back", "side", "sleeve", "neck"]
}
```

**Response** (202 Accepted - Multiple tasks):
```json
{
  "success": true,
  "taskKeys": [
    "123456789",
    "987654321",
    "111222333",
    "444555666",
    "777888999"
  ],
  "totalTasks": 5,
  "failedCount": 0,
  "message": "Created 5 mockup tasks. Poll /api/mockups/status/:task_key to check status."
}
```

→ **Poll each taskKey separately** until all completed

---

## 📋 Complete Request/Response Map

| Operation | Method | Endpoint | Request | Response |
|-----------|--------|----------|---------|----------|
| Get Capabilities | GET | `/printfiles/{id}` | (none) | availablePlacements, printfiles |
| Create Task | POST | `/create-task/{id}` | files array | task_key, status |
| Poll Status | GET | `/task?task_key=X` | (none) | status, mockups|printfiles |
| Your API: Get Files | GET | `/api/mockups/printfiles/:id` | (none) | availablePlacements |
| Your API: Create | POST | `/api/mockups` | all params | taskKey, mockupId |
| Your API: Poll | GET | `/api/mockups/status/:key` | (none) | status, mockups |

---

## 🎯 Curl Examples (For Testing)

### Test Get Print Files
```bash
curl -X GET "http://localhost:3000/api/mockups/printfiles/71" \
  -H "Cookie: next-auth.session-token=your_session_token"
```

### Test Create Task
```bash
curl -X POST "http://localhost:3000/api/mockups" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your_session_token" \
  -d '{
    "product_id": "71",
    "design_id": "test-123",
    "design_image_url": "https://example.com/design.png",
    "placement": "front"
  }'

# Response:
# {"success":true,"taskKey":"123456","mockupId":"uuid","status":"pending"}
```

### Test Poll Status
```bash
curl -X GET "http://localhost:3000/api/mockups/status/123456" \
  -H "Cookie: next-auth.session-token=your_session_token"

# Response (while pending):
# {"success":true,"status":"pending","mockupId":"uuid"}

# Response (when completed):
# {"success":true,"status":"completed","mockups":[{"mockup_url":"..."}]}
```

---

## 🔄 JavaScript Fetch Examples

### Get Print Files
```javascript
const response = await fetch('/api/mockups/printfiles/71');
const data = await response.json();
console.log(data.data.availablePlacements);
// { front: "Front print", back: "Back print", ... }
```

### Create Task
```javascript
const response = await fetch('/api/mockups', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    product_id: '71',
    design_id: 'design-123',
    design_image_url: 'https://example.com/design.png',
    placement: 'front',
  }),
});

const data = await response.json();
console.log(data.taskKey); // Store this!
```

### Poll Status
```javascript
const taskKey = '123456';
const pollStatus = async () => {
  const response = await fetch(`/api/mockups/status/${taskKey}`);
  const data = await response.json();

  if (data.status === 'pending') {
    // Check again in 3 seconds
    setTimeout(pollStatus, 3000);
  } else if (data.status === 'completed') {
    const mockupUrl = data.mockups[0].mockup_url;
    console.log('Ready:', mockupUrl);
  } else {
    console.error('Failed:', data.error);
  }
};

pollStatus();
```

---

## 🛠️ Advanced - Direct Printful API

If you need to debug directly with Printful:

### Direct to Printful (Behind the scenes)
```bash
# 1. Get files
curl -X GET "https://api.printful.com/mockup-generator/printfiles/71" \
  -H "Authorization: Bearer YOUR_PRINTFUL_KEY"

# 2. Create task
curl -X POST "https://api.printful.com/mockup-generator/create-task/71" \
  -H "Authorization: Bearer YOUR_PRINTFUL_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "variant_ids": [4012],
    "format": "jpg",
    "files": [{
      "placement": "front",
      "image_url": "https://example.com/design.png"
    }]
  }'

# 3. Poll
curl -X GET "https://api.printful.com/mockup-generator/task?task_key=123456" \
  -H "Authorization: Bearer YOUR_PRINTFUL_KEY"
```

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "code": 400,
  "error": "Invalid request: image_url is required"
}
```

### 404 Not Found
```json
{
  "code": 404,
  "error": "Mockup generation task not found"
}
```

### 429 Rate Limited
```json
{
  "code": 429,
  "error": "Too many requests"
}
```

### 500 Server Error
```json
{
  "code": 500,
  "error": "Mockup generation failed"
}
```

---

## 📊 Status Code Reference

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Use the data |
| 201 | Created | Use the data |
| 202 | Accepted (Async) | Store taskKey, poll later |
| 400 | Bad Request | Check parameters |
| 401 | Unauthorized | Check auth token |
| 404 | Not Found | Check ID/taskKey |
| 429 | Rate Limited | Wait and retry |
| 500 | Server Error | Try again later |

---

## 🎯 Implementation Checklist

- [ ] Can call GET /api/mockups/printfiles/:id
- [ ] Can call POST /api/mockups with params
- [ ] Can call GET /api/mockups/status/:taskKey
- [ ] Polling works (status changes from pending → completed)
- [ ] Can extract mockup_url from completed response
- [ ] Can download and save mockup image
- [ ] Handles errors gracefully
- [ ] Shows progress to user
- [ ] Works with multi-angle (multiple taskKeys)
