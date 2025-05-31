#!/usr/bin/env node

// Test notification script
const fetch = require('node-fetch');

async function sendTestNotification() {
  try {
    console.log('🧪 Sending test notification...');
    
    const response = await fetch('http://localhost:3001/api/admin/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'test_notification',
        title: '🧪 Test Notification from AI Assistant',
        message: 'This is a test notification sent by the AI assistant to verify the notification system is working properly. If you can see this in your admin dashboard, the notification system is functioning correctly!',
        recipients: ['all_users'],
        channels: ['email', 'push']
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Test notification sent successfully!');
      console.log('📧 Notification details:', result);
    } else {
      console.log('❌ Failed to send notification:', result);
    }
    
  } catch (error) {
    console.error('❌ Error sending notification:', error.message);
  }
}

// Also try creating a user notification
async function sendUserNotification() {
  try {
    console.log('👤 Sending user notification...');
    
    const response = await fetch('http://localhost:3001/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test-user-123',
        type: 'general',
        title: '🔔 User Test Notification',
        message: 'This is a test user notification. Check your notification center!',
        metadata: {
          source: 'ai_assistant_test'
        }
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ User notification sent successfully!');
      console.log('👤 Notification details:', result);
    } else {
      console.log('❌ Failed to send user notification:', result);
    }
    
  } catch (error) {
    console.error('❌ Error sending user notification:', error.message);
  }
}

// Run both tests
async function runTests() {
  console.log('🚀 Starting notification tests...\n');
  
  await sendTestNotification();
  console.log('');
  await sendUserNotification();
  
  console.log('\n✅ Notification tests completed!');
  console.log('📱 Check your admin dashboard at: http://localhost:3001/admin/enhanced');
  console.log('🔔 Check user notifications in the notification center');
}

runTests();
