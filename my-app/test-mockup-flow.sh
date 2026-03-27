#!/bin/bash

# Mockup Generation API Test Script (Using curl)
# This script tests the complete flow:
# 1. Generate image from AI service
# 2. Create mockup task
# 3. Poll mockup status
# 4. Display results

echo "🚀 MOCKUP GENERATION API TEST (Manual)"
echo "======================================"
echo ""

# Configuration
AI_SERVICE_URL="http://localhost:8000"
MOCKUP_API_BASE="http://localhost:3000/api/mockups"
SESSION_COOKIE="${SESSION_COOKIE:-}" # Set this if needed

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📸 STEP 1: Generate Image from AI Service${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Generate image
AI_RESPONSE=$(curl -s -X POST "${AI_SERVICE_URL}/generate-design" \
  -H "Content-Type: application/json" \
  -d '{"text": "A cool retro vintage style t-shirt design with geometric shapes and bold colors, vibrant neon aesthetic"}')

echo "Response:"
echo "$AI_RESPONSE" | python3 -m json.tool

# Extract image URL
IMAGE_URL=$(echo "$AI_RESPONSE" | grep -o '"image_url":"[^"]*' | cut -d'"' -f4)

if [ -z "$IMAGE_URL" ]; then
  echo -e "${RED}❌ Failed to generate image. Check if AI service is running on port 8000${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Image generated${NC}"
echo "Image URL: $IMAGE_URL"
echo ""

echo -e "${BLUE}🎨 STEP 2: Create Mockup Task${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create mockup task
MOCKUP_RESPONSE=$(curl -s -X POST "$MOCKUP_API_BASE?test=true" \
  -H "Content-Type: application/json" \
  ${SESSION_COOKIE:+-H "Cookie: $SESSION_COOKIE"} \
  -d "{
    \"product_id\": \"71\",
    \"design_id\": \"test-design-$(date +%s)\",
    \"design_image_url\": \"$IMAGE_URL\",
    \"placement\": \"front\",
    \"format\": \"jpg\"
  }")

echo "Response:"
echo "$MOCKUP_RESPONSE" | python3 -m json.tool

# Extract task key
TASK_KEY=$(echo "$MOCKUP_RESPONSE" | grep -o '"taskKey":"[^"]*' | cut -d'"' -f4)

if [ -z "$TASK_KEY" ]; then
  echo -e "${RED}❌ Failed to create mockup task${NC}"
  echo "Make sure:"
  echo "  1. Next.js API is running on port 3000"
  echo "  2. You have a valid session (SESSION_COOKIE env var)"
  echo "  3. Database is connected"
  exit 1
fi

echo -e "${GREEN}✅ Mockup task created${NC}"
echo "Task Key: $TASK_KEY"
echo ""

echo -e "${BLUE}⏳ STEP 3: Poll Mockup Status${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Poll status
POLL_COUNT=0
MAX_ATTEMPTS=45
POLL_INTERVAL=2

while [ $POLL_COUNT -lt $MAX_ATTEMPTS ]; do
  echo "Polling... (Attempt $((POLL_COUNT + 1))/$MAX_ATTEMPTS)"
  
  STATUS_RESPONSE=$(curl -s -X GET "${MOCKUP_API_BASE}/status/${TASK_KEY}?test=true" \
    ${SESSION_COOKIE:+-H "Cookie: $SESSION_COOKIE"})
  
  STATUS=$(echo "$STATUS_RESPONSE" | grep -o '"status":"[^"]*' | cut -d'"' -f4)
  PROGRESS=$(echo "$STATUS_RESPONSE" | grep -o '"progress":[0-9]*' | cut -d':' -f2)
  
  echo "  Status: $STATUS | Progress: ${PROGRESS}%"
  
  if [ "$STATUS" = "completed" ]; then
    echo -e "${GREEN}✅ Mockup generation completed!${NC}"
    echo ""
    echo "Full Response:"
    echo "$STATUS_RESPONSE" | python3 -m json.tool
    break
  elif [ "$STATUS" = "failed" ]; then
    ERROR=$(echo "$STATUS_RESPONSE" | grep -o '"error":"[^"]*' | cut -d'"' -f4)
    echo -e "${RED}❌ Mockup generation failed: $ERROR${NC}"
    exit 1
  fi
  
  POLL_COUNT=$((POLL_COUNT + 1))
  sleep $POLL_INTERVAL
done

if [ $POLL_COUNT -eq $MAX_ATTEMPTS ]; then
  echo -e "${YELLOW}⚠️  Timeout: Mockup still processing (this can take up to 90 seconds)${NC}"
  echo "Task Key for manual checking: $TASK_KEY"
  echo "Run this to check status: curl http://localhost:3000/api/mockups/status/$TASK_KEY"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Test completed!${NC}"
echo -e "${GREEN}========================================${NC}"
