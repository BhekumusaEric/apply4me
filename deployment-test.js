// Simple deployment test
console.log('🚀 Apply4Me Deployment Test')
console.log('Environment:', process.env.NODE_ENV)
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing')

// Test build
const nextConfig = require('./next.config.js')
console.log('Next.js config:', nextConfig ? '✅ Valid' : '❌ Invalid')

// Test package.json
const pkg = require('./package.json')
console.log('Package.json:', pkg.name, pkg.version)
console.log('Build script:', pkg.scripts.build)

console.log('🎉 Deployment test complete!')
