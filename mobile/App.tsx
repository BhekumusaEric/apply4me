import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { useColorScheme, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import * as Notifications from 'expo-notifications';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import InstitutionsScreen from './src/screens/InstitutionsScreen';
import InstitutionDetailScreen from './src/screens/InstitutionDetailScreen';
import BursariesScreen from './src/screens/BursariesScreen';
import ApplicationsScreen from './src/screens/ApplicationsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AuthScreen from './src/screens/AuthScreen';
import ApplyScreen from './src/screens/ApplyScreen';
import PaymentScreen from './src/screens/PaymentScreen';

// Context
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';

// Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  InstitutionDetail: { institutionId: string };
  Apply: { institutionId: string };
  Payment: { applicationId: string };
};

export type TabParamList = {
  Home: undefined;
  Institutions: undefined;
  Bursaries: undefined;
  Applications: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

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
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Institutions" 
        component={InstitutionsScreen}
        options={{ title: 'Institutions' }}
      />
      <Tab.Screen 
        name="Bursaries" 
        component={BursariesScreen}
        options={{ title: 'Bursaries' }}
      />
      <Tab.Screen 
        name="Applications" 
        component={ApplicationsScreen}
        options={{ title: 'My Applications' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Splash screen is still showing
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen 
            name="InstitutionDetail" 
            component={InstitutionDetailScreen}
            options={{ headerShown: true, title: 'Institution Details' }}
          />
          <Stack.Screen 
            name="Apply" 
            component={ApplyScreen}
            options={{ headerShown: true, title: 'Apply Now' }}
          />
          <Stack.Screen 
            name="Payment" 
            component={PaymentScreen}
            options={{ headerShown: true, title: 'Payment' }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts
        await Font.loadAsync({
          'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
          'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
        });

        // Request notification permissions
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Notifications Disabled',
            'Enable notifications to receive important updates about your applications and deadlines.'
          );
        }

        // Register for push notifications
        if (status === 'granted') {
          const token = await Notifications.getExpoPushTokenAsync();
          console.log('Push token:', token.data);
          // TODO: Send token to your server
        }

      } catch (e) {
        console.warn('Error during app preparation:', e);
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

  const theme = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;

  return (
    <PaperProvider theme={theme}>
      <ThemeProvider>
        <AuthProvider>
          <NavigationContainer>
            <AppNavigator />
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          </NavigationContainer>
        </AuthProvider>
      </ThemeProvider>
    </PaperProvider>
  );
}
