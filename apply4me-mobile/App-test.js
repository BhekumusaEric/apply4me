import React from 'react';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View style={{
      flex: 1,
      backgroundColor: '#007A4D',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Text style={{
        fontSize: 24,
        color: '#ffffff',
        textAlign: 'center'
      }}>
        Apply4Me Test
      </Text>
      
      <Text style={{
        fontSize: 16,
        color: '#ffffff',
        textAlign: 'center',
        marginTop: 20
      }}>
        If you see this, the app works!
      </Text>
    </View>
  );
}
