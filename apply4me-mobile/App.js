import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import InstitutionsScreen from './src/screens/InstitutionsScreen';
import BursariesScreen from './src/screens/BursariesScreen';
import ApplicationsScreen from './src/screens/ApplicationsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import InstitutionDetailScreen from './src/screens/InstitutionDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

// Custom theme for Apply4Me
const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#007A4D',
    primaryContainer: '#004D30',
    secondary: '#FFD700',
    background: '#1a1a1a',
    surface: '#2a2a2a',
  },
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Institutions') {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === 'Bursaries') {
            iconName = focused ? 'cash' : 'cash-outline';
          } else if (route.name === 'Applications') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007A4D',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#2a2a2a',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: '#007A4D',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: '🎓 Apply4Me' }}
      />
      <Tab.Screen 
        name="Institutions" 
        component={InstitutionsScreen}
        options={{ title: '🏫 Institutions' }}
      />
      <Tab.Screen 
        name="Bursaries" 
        component={BursariesScreen}
        options={{ title: '💰 Bursaries' }}
      />
      <Tab.Screen 
        name="Applications" 
        component={ApplicationsScreen}
        options={{ title: '📝 Applications' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: '👤 Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#007A4D',
            },
            headerTintColor: 'white',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Main" 
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="InstitutionDetail" 
            component={InstitutionDetailScreen}
            options={{ title: 'Institution Details' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
