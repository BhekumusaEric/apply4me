#!/bin/bash

echo "📱 Building Apply4Me APK for Direct Download"
echo "============================================="
echo ""
echo "🔧 This will create an APK file that students can download directly"
echo "📲 No app store required - just click and install!"
echo ""

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "📦 Installing EAS CLI..."
    npm install -g @expo/cli eas-cli
fi

echo "🏗️ Building APK file..."
echo "⏳ This may take 5-10 minutes..."

# Build APK for direct distribution
eas build --platform android --profile preview --non-interactive

echo ""
echo "✅ APK build complete!"
echo "📱 Students can now download and install the APK directly"
echo "🔗 Upload the APK to your website for easy download"
echo ""
echo "📋 Next steps:"
echo "1. Download the APK from EAS build dashboard"
echo "2. Upload to your website or cloud storage"
echo "3. Share download link with students"
echo "4. Students click link → Download → Install → Use Apply4Me!"
