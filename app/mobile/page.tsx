import Link from 'next/link';

export default function MobilePage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1a1a', color: 'white' }}>
      {/* Hero Section */}
      <section style={{ padding: '80px 16px', textAlign: 'center', backgroundColor: '#007A4D' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            marginBottom: '24px',
            display: 'inline-block',
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            padding: '8px 16px',
            borderRadius: '20px'
          }}>
            📱 100% Free Mobile App
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: 'white', marginBottom: '24px' }}>
            Apply4Me Mobile App
            <span style={{ display: 'block', color: '#FFD700' }}>Download Now - Free!</span>
          </h1>
          <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
            Get instant access to Apply4Me on your mobile device. No app store required -
            multiple free download options available!
          </p>
        </div>
      </section>

      {/* Download Options */}
      <section style={{ padding: '64px 16px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>Choose Your Download Method</h2>
            <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.7)' }}>
              Multiple ways to get Apply4Me on your phone - all completely free!
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {/* Option 1: QR Code */}
            <div style={{ backgroundColor: '#2a2a2a', padding: '32px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📱</div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>QR Code Access</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>
                Instant access via Expo Go app. Scan QR code and start using Apply4Me immediately!
              </p>
              <div style={{ backgroundColor: '#007A4D', color: 'white', padding: '12px 24px', borderRadius: '8px', display: 'inline-block' }}>
                Recommended - Instant Access
              </div>
            </div>

            {/* Option 2: Web App */}
            <div style={{ backgroundColor: '#2a2a2a', padding: '32px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🌐</div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Web App (PWA)</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>
                Visit our website and add to home screen. Works like a native app!
              </p>
              <Link href="https://apply4me-eta.vercel.app" style={{ backgroundColor: '#4ECDC4', color: 'white', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block' }}>
                Open Web App
              </Link>
            </div>

            {/* Option 3: APK Download */}
            <div style={{ backgroundColor: '#2a2a2a', padding: '32px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📥</div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Direct APK</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>
                Download APK file directly. Native Android app experience.
              </p>
              <div style={{ backgroundColor: '#666', color: 'white', padding: '12px 24px', borderRadius: '8px', display: 'inline-block' }}>
                Coming Soon
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instructions */}
      <section style={{ padding: '64px 16px', backgroundColor: '#2a2a2a' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '32px' }}>📱 How to Get Started</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#007A4D' }}>📱 QR Code Method</h3>
              <ol style={{ textAlign: 'left', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
                <li>Download "Expo Go" from your app store</li>
                <li>Open Expo Go app</li>
                <li>Scan QR code (contact us for QR code)</li>
                <li>Apply4Me loads instantly!</li>
              </ol>
            </div>

            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#4ECDC4' }}>🌐 Web App Method</h3>
              <ol style={{ textAlign: 'left', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
                <li>Visit apply4me-eta.vercel.app on mobile</li>
                <li>Tap browser menu (3 dots)</li>
                <li>Select "Add to Home Screen"</li>
                <li>Use like a native app!</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section style={{ padding: '64px 16px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '24px' }}>Need Help?</h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', marginBottom: '32px' }}>
            Contact us for QR code access or help with installation
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="mailto:support@apply4me.co.za" style={{ backgroundColor: '#007A4D', color: 'white', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none' }}>
              📧 Email Support
            </Link>
            <Link href="https://apply4me-eta.vercel.app" style={{ backgroundColor: '#4ECDC4', color: 'white', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none' }}>
              🌐 Visit Website
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
