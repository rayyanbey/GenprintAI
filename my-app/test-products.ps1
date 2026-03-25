# Quick guide for syncing products and testing the system

Write-Host "=============================================="
Write-Host "  GenPrint AI - Product Sync & Test Guide"
Write-Host "=============================================="
Write-Host ""

function Sync-Products {
    param([int]$limit = 200)
    Write-Host "🔄 Syncing $limit products from Printful..."
    Write-Host ""
    
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/sync-products?limit=$limit" `
        -Method Post `
        -Headers @{"Authorization" = "Bearer dev-sync-key"} `
        -ContentType "application/json" `
        -UseBasicParsing
    
    $response.Content | ConvertFrom-Json | ConvertTo-Json
    Write-Host ""
}

function Test-Products {
    Write-Host "📦 Testing products endpoint (no filtering)..."
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/products?limit=3" -UseBasicParsing
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
    Write-Host ""
}

function Test-Category {
    param([int]$category = 35)
    Write-Host "🔍 Testing category filtering (category=$category)..."
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/products?category=$category&limit=3" -UseBasicParsing
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
    Write-Host ""
}

function Get-Categories {
    Write-Host "📊 Available product categories in database..."
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/products?limit=100" -UseBasicParsing
    $products = ($response.Content | ConvertFrom-Json).products
    
    $categories = $products | Group-Object -Property category_id | ForEach-Object {
        @{
            category_id = $_.Name
            count = $_.Count
        }
    } | ConvertTo-Json
    
    Write-Host $categories
    Write-Host ""
}

# Main logic
if ($args.Count -eq 0) {
    Write-Host "Usage: .\test-products.ps1 [command] [args]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  sync [limit]        - Sync products from Printful (default: 200)"
    Write-Host "  test                - Test products endpoint"
    Write-Host "  filter [category]   - Test category filtering (default: 35)"
    Write-Host "  categories          - Show available categories"
    Write-Host "  all                 - Run all tests"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\test-products.ps1 sync 500         # Sync 500 products"
    Write-Host "  .\test-products.ps1 filter 35        # Get products from category 35"
    Write-Host "  .\test-products.ps1 all              # Run all tests"
    exit 0
}

$command = $args[0]
$arg2 = if ($args.Count -gt 1) { [int]$args[1] } else { 0 }

switch ($command) {
    "sync" {
        Sync-Products -limit ($arg2 -eq 0 ? 200 : $arg2)
    }
    "test" {
        Test-Products
    }
    "filter" {
        Test-Category -category ($arg2 -eq 0 ? 35 : $arg2)
    }
    "categories" {
        Get-Categories
    }
    "all" {
        Sync-Products -limit 100
        Test-Products
        Get-Categories
        Test-Category -category 35
    }
    default {
        Write-Host "Unknown command: $command"
        exit 1
    }
}
