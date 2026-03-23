# Postman Testing Guide - GenprintAI Backend

## Setup Instructions

### 1. Import the Postman Collection
1. Open Postman
2. Click **Import** button (top left)
3. Select **File** tab
4. Choose `POSTMAN_COLLECTION.json` from the project root
5. Click **Import**

### 2. Configure Environment Variables

In Postman, set up these variables in your environment:

| Variable | Value | Notes |
|----------|-------|-------|
| `base_url` | `http://localhost:3000` | Your local dev server URL |
| `auth_token` | `<your-session-token>` | Get from NextAuth session after login |
| `admin_token` | `<your-admin-token>` | Admin user's session token |
| `product_id` | `<uuid>` | Get from product list response |
| `template_id` | `<uuid>` | Get from template list response |
| `design_id` | `<uuid>` | Get from your existing designs |
| `mockup_id` | `<uuid>` | Get from mockup generation response |

### 3. Prerequisites
- [ ] Next.js dev server running (`npm run dev` - port 3000)
- [ ] PostgreSQL database running
- [ ] Environment variables configured (`.env.local`):
  - `NEXTAUTH_SECRET` - NextAuth secret
  - `NEXTAUTH_URL` - Usually `http://localhost:3000`
  - `PRINTFUL_API_KEY` or `POD` - Your Printful API key
  - Database connection string

---

## Testing Order (Recommended)

### Phase 1: Authentication
1. **Login/Get Session Token**
   - In your app login page, get the session token from NextAuth
   - Copy the token and paste into Postman `auth_token` variable
   - Test with a simple endpoint that requires auth

### Phase 2: Product Sync & Browsing
> **Note:** Products must be synced from Printful before testing other features

1. **POST** `/api/products/sync`
   - Request body: `{ "limit": 50 }`
   - This syncs first 50 products from Printful API
   - ✅ **Expected:** Returns synced_count and product list
   - 📝 **Note:** Takes 10-30 seconds depending on Printful API speed

2. **GET** `/api/products?page=1&limit=12`
   - Retrieves paginated product list
   - ✅ **Expected:** Returns products array with pagination info
   - **Try:** Add filters: `?category=apparel&minPrice=10&maxPrice=100`

3. **GET** `/api/products/{product_id}`
   - Get detailed product info with variants
   - Copy a `product_id` from step 2
   - Paste into variable or URL
   - ✅ **Expected:** Product object with variants array

4. **GET** `/api/products/{product_id}/variants`
   - Get all variants (sizes, colors, prices) for a product
   - ✅ **Expected:** Array of variants with size, color, price, availability

### Phase 3: Templates
> **Prerequisite:** Products should be synced first

1. **GET** `/api/templates?page=1&limit=12`
   - List all approved templates
   - ✅ **Expected:** Returns templates array (includes Printful templates by default)

2. **GET** `/api/templates?page=1&limit=12` with category filter
   - `?category=apparel`
   - ✅ **Expected:** Filtered templates for category

3. **POST** `/api/templates`
   - **Create a community template (requires auth)**
   - Body:
     ```json
     {
       "name": "Test Template 1",
       "category": "apparel",
       "description": "Testing the new template endpoint",
       "color_variants": ["#000000", "#FFFFFF", "#FF0000"],
       "metadata": { "tags": ["test"] }
     }
     ```
   - ✅ **Expected:** Returns template with `status: "pending"`
   - 📝 **Note:** Community templates need admin approval before showing in public lists

4. **GET** `/api/templates/{template_id}`
   - Get template details (copy ID from creation response)
   - ✅ **Expected:** Full template object

5. **GET** `/api/templates/category/apparel`
   - Category-specific template list
   - ✅ **Expected:** Templates filtered by category

### Phase 4: Mockups
> **Prerequisites:** 
> - Products synced
> - A design created in the design studio (get design_id)

1. **POST** `/api/mockups`
   - **Generate a mockup (requires auth)**
   - Body:
     ```json
     {
       "product_id": "use-product-uuid-from-phase2",
       "design_id": "use-your-design-id",
       "layer_position": "front",
       "display_size": "high_res"
     }
     ```
   - ✅ **Expected:** Returns mockup object with `image_url`
   - 📝 **Note:** First call to Printful mockup API may take 20-40 seconds
   - ⚠️ **If error:** Check Printful API key is correct

2. **GET** `/api/mockups/{mockup_id}`
   - Retrieve generated mockup
   - Copy `id` from step 1 response
   - ✅ **Expected:** Mockup object with all details

3. **POST** `/api/mockups/{product_id}/all`
   - **Generate mockups for all angles (requires auth)**
   - Body:
     ```json
     {
       "design_id": "your-design-id",
       "display_size": "high_res",
       "include_video": false
     }
     ```
   - ✅ **Expected:** Returns array of mockups for [front, back, side]
   - 📝 **Note:** Creates multiple mockups. Don't set `include_video: true` yet (video gen is slower)

### Phase 5: Template Usage Tracking
> **Requires:** Created a template in Phase 3

1. **POST** `/api/templates/{template_id}` (with design_id in body)
   - Track template usage for analytics
   - Body:
     ```json
     {
       "design_id": "your-design-id"
     }
     ```
   - ✅ **Expected:** `success: true, message: "Template usage tracked"`

### Phase 6: Admin Approval (Optional)
> **Requires:** Admin token with admin role

1. **GET** `/api/admin/templates`
   - View pending community template approvals
   - ✅ **Expected:** List of templates with `approval_status: "pending"`

2. **PUT** `/api/admin/templates/{template_id}` - Approve
   - Body:
     ```json
     {
       "action": "approve"
     }
     ```
   - ✅ **Expected:** Template status updated to "approved"

3. **PUT** `/api/admin/templates/{template_id}` - Reject
   - Body:
     ```json
     {
       "action": "reject",
       "reason": "Quality concerns"
     }
     ```
   - ✅ **Expected:** Template status updated to "rejected"

---

## Common Issues & Troubleshooting

### 401 Unauthorized
**Problem:** `{ "success": false, "error": "Unauthorized - must be logged in" }`
- **Solution:** Get a valid auth token from NextAuth session
  - Log in through the app
  - Check browser cookies or local storage for session
  - Update `auth_token` in Postman variables

### 500 Internal Server Error
**Problem:** `{ "success": false, "error": "Failed to fetch products" }`
- **Causes & Solutions:**
  1. **Database not running:** Start PostgreSQL with `docker-compose up -d`
  2. **Printful API error:** Check `PRINTFUL_API_KEY` in `.env.local`
  3. **Database not initialized:** Run migrations to create tables
  4. **Check server logs:** `npm run dev` terminal for detailed error messages

### "Failed to generate mockup"
**Problem:** Mockup generation returns error
- **Causes:**
  1. Invalid `product_id` - Use ID from product list
  2. Invalid `design_id` - Must exist in your designs table
  3. Printful API rate limit - Wait 60 seconds and retry
  4. Invalid `layer_position` - Use: `front`, `back`, `side`, `sleeve`, or `neck`

### Empty product list
**Problem:** `GET /api/products` returns empty array
- **Solution:** 
  1. Run `POST /api/products/sync` first - this populates products from Printful
  2. Check Printful API key is valid
  3. Check database connection works

### Template not appearing in list
**Problem:** Created template with `POST` but doesn't show in `GET /api/templates`
- **Reason:** Community templates have `approval_status: "pending"` and require admin approval
- **Solution:** 
  1. Get admin token
  2. Use `PUT /api/admin/templates/{id}` to approve
  3. Template will then appear in public list

---

## Performance Tips

### Sync Products
- Syncing all products may take several minutes
- Start with `limit: 10` for testing, then increase if needed
- Only sync when needed - products are stored in database

### Mockup Generation
- First mockup generation: 20-40 seconds (Printful processes it)
- Subsequent calls: Faster if mockup is cached
- Don't generate 360 video (`include_video: false` by default) until you optimize

### Pagination
- Use `limit: 12` for UI (default)
- Use `limit: 50` for testing/admin bulk operations
- Max recommended: `limit: 100`

---

## Next Steps After Testing

1. **Test with React Frontend**
   - Create UI components that call these endpoints
   - Test actual user workflows

2. **Error Handling**
   - Review error messages returned
   - Implement retry logic in front-end if needed

3. **Performance Testing**
   - Load test `/api/products` endpoint
   - Measure mockup generation time
   - Consider caching strategy if needed

4. **Database Optimization**
   - Run explain analysis on slow queries
   - Add indexes for frequently searched columns: `product.category`, `template.category`

5. **Integration Testing**
   - Write Jest tests for services
   - Mock Printful API calls in tests
   - Test error scenarios

---

## Helpful Postman Features

### Save Response as Variable
1. Generate mock (POST `/api/mockups`)
2. Copy `mockup_id` from response
3. In Postman, go to **Tests** tab
4. Add: `pm.environment.set("mockup_id", pm.response.json().mockup.id);`
5. Now subsequent requests auto-use the latest mockup ID

### Test Scripts
Add to Postman request **Tests** to auto-validate responses:
```javascript
// Check successful response
pm.test("Status is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has success=true", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.equal(true);
});

// Extract data for next test
pm.test("Extract product ID", function () {
    var jsonData = pm.response.json();
    pm.environment.set("product_id", jsonData.products[0].id);
});
```

### Create Request Chains
1. **Sync Products** → Extract first product ID
2. **Get Product Details** → Use extracted ID
3. **Generate Mockup** → Use product ID from step 2
4. **Get Mockup** → Use mockup ID from step 3

---

## API Quick Reference

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/products` | GET | ❌ | List products |
| `/api/products/{id}` | GET | ❌ | Product details |
| `/api/products/{id}/variants` | GET | ❌ | Product variants |
| `/api/products/sync` | POST | ✅ | Sync from Printful |
| `/api/templates` | GET/POST | POST=✅ | List/create templates |
| `/api/templates/{id}` | GET/POST | POST=✅ | Template details/track usage |
| `/api/templates/category/{cat}` | GET | ❌ | Templates by category |
| `/api/admin/templates` | GET | ✅ | Pending approval list |
| `/api/admin/templates/{id}` | PUT | ✅ | Approve/reject template |
| `/api/mockups` | POST/GET | ✅ | Generate/get mockup |
| `/api/mockups/{product_id}/all` | POST | ✅ | All angle mockups |

---

**Questions?** Check the server logs in your `npm run dev` terminal for detailed error messages!
