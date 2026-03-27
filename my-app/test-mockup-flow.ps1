# Mockup Generation API Test Script (PowerShell - Windows)
# This script tests the complete flow:
# 1. Generate image from AI service
# 2. Create mockup task
# 3. Poll mockup status
# 4. Display results

Write-Host "🚀 MOCKUP GENERATION API TEST (PowerShell)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$AI_SERVICE_URL = "http://localhost:8000"
$MOCKUP_API_BASE = "http://localhost:3000/api/mockups"
$SESSION_COOKIE = $env:SESSION_COOKIE  # Optional: set if needed

# ====================
# STEP 1: Generate Image
# ====================
Write-Host "📸 STEP 1: Generate Image from AI Service" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""

try {
    $aiPrompt = "A cool retro vintage style t-shirt design with geometric shapes and bold colors, vibrant neon aesthetic"
    
    $aiResponse = Invoke-WebRequest -Uri "${AI_SERVICE_URL}/generate-design" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
        } `
        -Body (ConvertTo-Json @{
            text = $aiPrompt
        }) `
        -ErrorAction Stop

    $aiData = $aiResponse.Content | ConvertFrom-Json
    
    Write-Host "Response:" -ForegroundColor DarkGray
    $aiData | ConvertTo-Json | ForEach-Object { Write-Host $_ }
    
    $imageUrl = $aiData.image_url
    
    if (-not $imageUrl) {
        Write-Host "❌ Failed to generate image" -ForegroundColor Red
        Write-Host "Check if AI service is running on port 8000" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host ""
    Write-Host "✅ Image generated successfully" -ForegroundColor Green
    Write-Host "Image URL: $imageUrl" -ForegroundColor DarkGreen
    Write-Host ""
}
catch {
    Write-Host "❌ Error calling AI service: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure AI service is running: uvicorn app:app --host 0.0.0.0 --port 8000" -ForegroundColor Yellow
    exit 1
}

# ====================
# STEP 2: Create Mockup Task
# ====================
Write-Host "🎨 STEP 2: Create Mockup Task" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""

try {
    $mockupBody = @{
        product_id = "71"
        design_id = "test-design-$(Get-Random)"
        design_image_url = $imageUrl
        placement = "front"
        format = "jpg"
    } | ConvertTo-Json

    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($SESSION_COOKIE) {
        $headers["Cookie"] = $SESSION_COOKIE
    }

    $mockupResponse = Invoke-WebRequest -Uri "$MOCKUP_API_BASE`?test=true" `
        -Method POST `
        -Headers $headers `
        -Body $mockupBody `
        -ErrorAction Stop

    $mockupData = $mockupResponse.Content | ConvertFrom-Json
    
    Write-Host "Response:" -ForegroundColor DarkGray
    $mockupData | ConvertTo-Json | ForEach-Object { Write-Host $_ }
    
    $taskKey = $mockupData.taskKey
    
    if (-not $taskKey) {
        Write-Host ""
        Write-Host "❌ Failed to create mockup task" -ForegroundColor Red
        if ($mockupResponse.StatusCode -eq 401) {
            Write-Host "Auth Error: Need valid session cookie" -ForegroundColor Yellow
            Write-Host "Set SESSION_COOKIE environment variable or login first" -ForegroundColor Yellow
        }
        exit 1
    }
    
    Write-Host ""
    Write-Host "✅ Mockup task created successfully" -ForegroundColor Green
    Write-Host "Task Key: $taskKey" -ForegroundColor DarkGreen
    Write-Host ""
}
catch {
    Write-Host "❌ Error creating mockup task: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure Next.js API is running on port 3000" -ForegroundColor Yellow
    exit 1
}

# ====================
# STEP 3: Poll Status
# ====================
Write-Host "⏳ STEP 3: Poll Mockup Status" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""

$pollCount = 0
$maxAttempts = 45
$pollInterval = 2

while ($pollCount -lt $maxAttempts) {
    Write-Host "Polling... (Attempt $($pollCount + 1)/$maxAttempts)"
    
    try {
        $headers = @{}
        if ($SESSION_COOKIE) {
            $headers["Cookie"] = $SESSION_COOKIE
        }

        $statusResponse = Invoke-WebRequest -Uri "${MOCKUP_API_BASE}/status/${taskKey}`?test=true" `
            -Method GET `
            -Headers $headers `
            -ErrorAction Stop

        $statusData = $statusResponse.Content | ConvertFrom-Json
        
        $status = $statusData.status
        $progress = if ($statusData.progress) { $statusData.progress } else { "0" }
        
        Write-Host "  Status: $status | Progress: ${progress}%" -ForegroundColor DarkGray
        
        if ($status -eq "completed") {
            Write-Host ""
            Write-Host "✅ Mockup generation completed!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Full Response:" -ForegroundColor DarkGray
            $statusData | ConvertTo-Json | ForEach-Object { Write-Host $_ }
            break
        }
        elseif ($status -eq "failed") {
            Write-Host ""
            Write-Host "❌ Mockup generation failed: $($statusData.error)" -ForegroundColor Red
            exit 1
        }
    }
    catch {
        Write-Host "Error polling status: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    $pollCount++
    Start-Sleep -Seconds $pollInterval
}

if ($pollCount -eq $maxAttempts) {
    Write-Host ""
    Write-Host "⚠️  Timeout: Mockup still processing" -ForegroundColor Yellow
    Write-Host "Task Key: $taskKey" -ForegroundColor Yellow
    Write-Host "Manual check:" -ForegroundColor Yellow
    Write-Host "  curl http://localhost:3000/api/mockups/status/$taskKey" -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "✅ Test completed!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
