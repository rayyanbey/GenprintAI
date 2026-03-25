@echo off
REM CLEANUP SCRIPT: Remove conflicting [productId] routes
REM This script removes the duplicate [productId] folder that conflicts with [id]

echo Removing conflicting [productId] folder...

REM Remove the conflicting productId folder
rmdir /s /q "app\api\products\[productId]" 2>nul

if %errorlevel% equ 0 (
    echo.
    echo ✅ Done! Route conflict resolved.
    echo.
    echo The following folders remain (correct):
    echo   - app/api/products/[id]/route.ts (single product)
    echo   - app/api/products/[id]/variants/route.ts (variants with pricing)
    echo   - app/api/products/route.ts (list with filtering)
    echo.
    echo Restart the dev server with: npm run dev
) else (
    echo ❌ Error: Could not remove folder. You may need to delete manually:
    echo   Delete: app\api\products\[productId]
)
