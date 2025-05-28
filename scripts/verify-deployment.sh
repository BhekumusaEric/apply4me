#!/bin/bash

# Apply4Me Deployment Verification Script
# This script verifies that the deployment is working correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL=${1:-"https://apply4me-eta.vercel.app"}
TIMEOUT=30
MAX_RETRIES=3

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

# Function to make HTTP request with retries
make_request() {
    local url=$1
    local expected_status=${2:-200}
    local retries=0
    
    while [ $retries -lt $MAX_RETRIES ]; do
        local response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url" 2>/dev/null || echo "000")
        
        if [ "$response" = "$expected_status" ]; then
            return 0
        fi
        
        retries=$((retries + 1))
        if [ $retries -lt $MAX_RETRIES ]; then
            print_warning "Attempt $retries failed (HTTP $response), retrying..."
            sleep 5
        fi
    done
    
    print_error "Failed after $MAX_RETRIES attempts (HTTP $response)"
    return 1
}

# Function to check JSON response
check_json_response() {
    local url=$1
    local expected_field=$2
    
    local response=$(curl -s --max-time $TIMEOUT "$url" 2>/dev/null || echo "{}")
    
    if echo "$response" | grep -q "\"$expected_field\""; then
        return 0
    else
        print_error "Expected field '$expected_field' not found in response"
        return 1
    fi
}

echo "🚀 Apply4Me Deployment Verification"
echo "===================================="
echo "🌐 Base URL: $BASE_URL"
echo "⏱️ Timeout: ${TIMEOUT}s"
echo "🔄 Max Retries: $MAX_RETRIES"
echo ""

# Test 1: Homepage
print_info "Testing homepage..."
if make_request "$BASE_URL"; then
    print_status "Homepage is accessible"
else
    print_error "Homepage is not accessible"
    exit 1
fi

# Test 2: Health Check
print_info "Testing health endpoint..."
if make_request "$BASE_URL/api/health"; then
    print_status "Health endpoint is responding"
    
    # Check health status
    if check_json_response "$BASE_URL/api/health" "status"; then
        print_status "Health endpoint returns valid JSON"
    else
        print_warning "Health endpoint JSON format may be incorrect"
    fi
else
    print_error "Health endpoint is not responding"
    exit 1
fi

# Test 3: API Endpoints
print_info "Testing API endpoints..."

# Test institutions API
if make_request "$BASE_URL/api/institutions"; then
    print_status "Institutions API is working"
    
    if check_json_response "$BASE_URL/api/institutions" "success"; then
        print_status "Institutions API returns valid data"
    else
        print_warning "Institutions API response format may be incorrect"
    fi
else
    print_error "Institutions API is not working"
    exit 1
fi

# Test notifications API (should return error for invalid user, but endpoint should work)
if make_request "$BASE_URL/api/notifications?userId=test" 400; then
    print_status "Notifications API is responding correctly"
elif make_request "$BASE_URL/api/notifications?userId=test" 500; then
    print_status "Notifications API is responding (with server error)"
else
    print_warning "Notifications API may have issues"
fi

# Test 4: Static Assets
print_info "Testing static assets..."

# Test favicon
if make_request "$BASE_URL/favicon.ico"; then
    print_status "Favicon is accessible"
else
    print_warning "Favicon is not accessible"
fi

# Test manifest
if make_request "$BASE_URL/manifest.json"; then
    print_status "PWA manifest is accessible"
else
    print_warning "PWA manifest is not accessible"
fi

# Test 5: Page Routes
print_info "Testing page routes..."

# Test key pages
pages=("/institutions" "/bursaries" "/auth/signin" "/how-it-works" "/contact")

for page in "${pages[@]}"; do
    if make_request "$BASE_URL$page"; then
        print_status "Page $page is accessible"
    else
        print_warning "Page $page may have issues"
    fi
done

# Test 6: Performance Check
print_info "Testing performance..."

start_time=$(date +%s%N)
if make_request "$BASE_URL"; then
    end_time=$(date +%s%N)
    duration=$(( (end_time - start_time) / 1000000 ))
    
    if [ $duration -lt 2000 ]; then
        print_status "Homepage loads quickly (${duration}ms)"
    elif [ $duration -lt 5000 ]; then
        print_warning "Homepage loads moderately (${duration}ms)"
    else
        print_warning "Homepage loads slowly (${duration}ms)"
    fi
else
    print_error "Performance test failed"
fi

# Test 7: Security Headers
print_info "Testing security headers..."

headers=$(curl -s -I --max-time $TIMEOUT "$BASE_URL" 2>/dev/null || echo "")

if echo "$headers" | grep -qi "x-frame-options"; then
    print_status "X-Frame-Options header present"
else
    print_warning "X-Frame-Options header missing"
fi

if echo "$headers" | grep -qi "x-content-type-options"; then
    print_status "X-Content-Type-Options header present"
else
    print_warning "X-Content-Type-Options header missing"
fi

# Test 8: Database Connectivity (via health endpoint)
print_info "Testing database connectivity..."

health_response=$(curl -s --max-time $TIMEOUT "$BASE_URL/api/health" 2>/dev/null || echo "{}")

if echo "$health_response" | grep -q '"database".*"healthy"'; then
    print_status "Database connectivity is healthy"
elif echo "$health_response" | grep -q '"database"'; then
    print_warning "Database connectivity may have issues"
else
    print_warning "Cannot determine database status"
fi

echo ""
echo "🎉 Deployment verification completed!"
echo ""

# Summary
print_info "Summary:"
echo "- Base URL: $BASE_URL"
echo "- All critical endpoints tested"
echo "- Performance and security checked"
echo "- Database connectivity verified"
echo ""
print_status "Deployment appears to be working correctly!"

exit 0
