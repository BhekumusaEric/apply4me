#!/bin/bash

echo "🚀 Starting Apply4Me Mobile App with Expo Go"
echo "=============================================="
echo ""
echo "📱 INSTRUCTIONS:"
echo "1. Install 'Expo Go' app on your phone from app store"
echo "2. Wait for QR code to appear below"
echo "3. Scan QR code with Expo Go app"
echo "4. Apply4Me mobile app will load on your phone!"
echo ""
echo "🔗 Share this QR code with anyone to give them instant access!"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start Expo development server
echo "🚀 Starting Expo development server..."
npx expo start --clear

echo ""
echo "✅ Apply4Me mobile app is now running!"
echo "📱 Scan the QR code above with Expo Go app"
echo "🌐 Or visit the web version at: https://apply4me-eta.vercel.app"
