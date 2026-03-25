#!/bin/bash
# CLEANUP SCRIPT: Remove conflicting [productId] routes

# This script removes the duplicate [productId] folder that conflicts with [id]
# Next.js doesn't allow both [id] and [productId] parameters in the same path

echo "Removing conflicting [productId] folder..."

# Remove the conflicting productId folder
rm -rf app/api/products/\[productId\]

echo "✅ Done! Route conflict resolved."
echo ""
echo "The following folders remain (correct):"
echo "  - app/api/products/[id]/route.ts (single product)"
echo "  - app/api/products/[id]/variants/route.ts (variants with pricing)"
echo "  - app/api/products/route.ts (list with filtering)"
echo ""
echo "Restart the dev server with: npm run dev"
