#!/bin/bash

# Quick guide for syncing products and testing the system

echo "=============================================="
echo "  GenPrint AI - Product Sync & Test Guide"
echo "=============================================="
echo ""

# Function to sync products
sync_products() {
  local limit=${1:-200}
  echo "🔄 Syncing $limit products from Printful..."
  echo ""
  
  curl -X POST "http://localhost:3000/api/admin/sync-products?limit=$limit" \
    -H "Authorization: Bearer dev-sync-key" \
    -H "Content-Type: application/json" \
    -s | jq '.'
  
  echo ""
}

# Function to test products endpoint
test_products() {
  echo "📦 Testing products endpoint (no filtering)..."
  curl -s "http://localhost:3000/api/products?limit=3" | jq '.'
  echo ""
}

# Function to test category filtering
test_category() {
  local category=${1:-35}
  echo "🔍 Testing category filtering (category=$category)..."
  curl -s "http://localhost:3000/api/products?category=$category&limit=3" | jq '.'
  echo ""
}

# Function to get available categories
get_categories() {
  echo "📊 Available product categories in database..."
  curl -s "http://localhost:3000/api/products?limit=50" | jq '.products | group_by(.category_id) | map({category_id: .[0].category_id, count: length})'
  echo ""
}

# Main menu
if [ $# -eq 0 ]; then
  echo "Usage: $0 [command] [args]"
  echo ""
  echo "Commands:"
  echo "  sync [limit]        - Sync products from Printful (default: 200)"
  echo "  test                - Test products endpoint"
  echo "  filter [category]   - Test category filtering (default: 35)"
  echo "  categories          - Show available categories"
  echo "  all                 - Run all tests"
  echo ""
  echo "Examples:"
  echo "  $0 sync 500         # Sync 500 products"
  echo "  $0 filter 35        # Get products from category 35"
  echo "  $0 all              # Run all tests"
  exit 0
fi

case "$1" in
  sync)
    sync_products "${2:-200}"
    ;;
  test)
    test_products
    ;;
  filter|category)
    test_category "${2:-35}"
    ;;
  categories)
    get_categories
    ;;
  all)
    sync_products 100
    test_products
    get_categories
    test_category 35
    ;;
  *)
    echo "Unknown command: $1"
    exit 1
    ;;
esac
