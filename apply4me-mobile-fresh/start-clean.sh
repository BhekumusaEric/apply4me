#!/bin/bash

echo "🚀 Starting Apply4Me Mobile App (FRESH BUILD - Clean Environment)"
echo "=================================================================="

# Clear ALL environment variables that might interfere
unset NEXT_PUBLIC_SUPABASE_URL
unset NEXT_PUBLIC_SUPABASE_ANON_KEY
unset SUPABASE_SERVICE_ROLE_KEY
unset NEXT_PUBLIC_APP_URL
unset NEXT_PUBLIC_APP_NAME
unset NEXT_PUBLIC_YOCO_PUBLIC_KEY
unset YOCO_SECRET_KEY
unset NEXT_PUBLIC_MAX_FILE_SIZE
unset NEXT_PUBLIC_ALLOWED_FILE_TYPES

# Ensure we're in the mobile app directory
cd "$(dirname "$0")"

echo "📱 Current directory: $(pwd)"
echo "📋 Checking app.json..."
if [ -f "app.json" ]; then
    echo "✅ app.json found"
    cat app.json | grep '"name"'
else
    echo "❌ app.json not found"
    exit 1
fi

echo "📦 Checking package.json..."
if [ -f "package.json" ]; then
    echo "✅ package.json found"
    cat package.json | grep '"name"'
else
    echo "❌ package.json not found"
    exit 1
fi

echo "🔧 Starting Expo development server (FRESH BUILD)..."
env -i PATH="$PATH" HOME="$HOME" npx expo start --clear
