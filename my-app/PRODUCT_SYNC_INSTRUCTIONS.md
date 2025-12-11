# Product Sync Instructions

## Step 1: Sync Products from Printful

To sync 10-20 products from Printful to your database, use one of these methods:

### Method 1: Using curl (Command Line)
```bash
curl -X POST http://localhost:3000/api/printful/sync-products \
  -H "Content-Type: application/json" \
  -d '{"limit": 20}'
```

### Method 2: Using PowerShell
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/printful/sync-products" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"limit": 20}'
```

### Method 3: Using Browser Console
1. Open your browser to `http://localhost:3000`
2. Open Developer Tools (F12)
3. Go to Console tab
4. Paste and run:
```javascript
fetch('/api/printful/sync-products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ limit: 20 })
})
.then(r => r.json())
.then(console.log)
```

## Step 2: View Products

After syncing, visit:
```
http://localhost:3000/products
```

## Expected Response

```json
{
  "success": true,
  "message": "Successfully synced 20 products",
  "products": [
    {
      "id": "printful_679",
      "name": "Unisex Performance Crew Neck T-Shirt | A4 N3142",
      "created": true
    },
    ...
  ]
}
```

## Troubleshooting

### No products showing?
1. Check if sync was successful
2. Verify database connection
3. Check console logs for errors

### Sync failed?
1. Verify `POD` environment variable is set with your Printful API key
2. Check Printful API status
3. Review server logs

## Database Changes

The product model now includes these Printful-specific fields:
- `printful_id` - Printful product ID
- `brand` - Product brand (e.g., "A4")
- `model` - Product model number
- `type_name` - Product type (e.g., "T-Shirt")
- `variant_count` - Number of available variants
- `is_discontinued` - Discontinuation status
- `origin_country` - Manufacturing country
- `techniques` - Printing techniques (JSON)
- `files` - Print file locations (JSON)

## Next Steps

1. Sync products using one of the methods above
2. Visit `/products` to see the synced products
3. Click on a product to view details
4. Add products to cart
5. Proceed to checkout
