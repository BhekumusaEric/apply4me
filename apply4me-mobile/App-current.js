import React from 'react';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View style={{
      flex: 1,
      backgroundColor: '#007A4D',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20
    }}>
      <Text style={{
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 20
      }}>
        🎓 Apply4Me
      </Text>

      <Text style={{
        fontSize: 18,
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 30,
        opacity: 0.9
      }}>
        SA Student Applications
      </Text>

      <View style={{
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20
      }}>
        <Text style={{
          fontSize: 16,
          color: '#ffffff',
          textAlign: 'center',
          marginBottom: 15
        }}>
          📊 Platform Statistics
        </Text>

        <Text style={{
          fontSize: 14,
          color: '#ffffff',
          textAlign: 'center',
          marginBottom: 5
        }}>
          🏫 150+ Institutions
        </Text>

        <Text style={{
          fontSize: 14,
          color: '#ffffff',
          textAlign: 'center',
          marginBottom: 5
        }}>
          💰 75+ Bursaries
        </Text>

        <Text style={{
          fontSize: 14,
          color: '#ffffff',
          textAlign: 'center'
        }}>
          👥 2,847+ Students Helped
        </Text>
      </View>

      <Text style={{
        fontSize: 16,
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 20
      }}>
        🌐 Visit apply4me-eta.vercel.app
      </Text>

      <Text style={{
        fontSize: 14,
        color: '#ffffff',
        textAlign: 'center',
        opacity: 0.8
      }}>
        🇿🇦 Empowering South African students to access higher education opportunities
      </Text>
    </View>
  );
}
