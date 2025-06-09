import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { useColorScheme, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import InstitutionsScreen from './src/screens/InstitutionsScreen';
import InstitutionDetailScreen from './src/screens/InstitutionDetailScreen';
import BursariesScreen from './src/screens/BursariesScreen';
import ApplicationsScreen from './src/screens/ApplicationsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import ApplyScreen from './src/screens/ApplyScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import DocumentsScreen from './src/screens/DocumentsScreen';

// Context
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';

// Services
import { notificationService } from './src/services/NotificationService';
import { offlineService } from './src/services/OfflineService';
import { biometricAuth } from './src/services/BiometricAuth';

// Types
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  InstitutionDetail: { institutionId: string };
  Apply: { institutionId: string };
  Payment: { applicationId: string };
  Documents: undefined;
  EditProfile: undefined;
};

export type TabParamList = {
  Home: undefined;
  Institutions: undefined;
  Applications: undefined;
  Documents: undefined;
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

// App initialization

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
          } else if (route.name === 'Applications') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Documents') {
            iconName = focused ? 'folder' : 'folder-outline';
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
        name="Applications"
        component={ApplicationsScreen}
        options={{ title: 'Applications' }}
      />
      <Tab.Screen
        name="Documents"
        component={DocumentsScreen}
        options={{ title: 'Documents' }}
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
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [servicesInitialized, setServicesInitialized] = useState(false);

  useEffect(() => {
    initializeServices();
    checkFirstLaunch();
  }, []);

  const initializeServices = async () => {
    try {
      await Promise.all([
        notificationService.initialize(),
        offlineService.initialize(),
      ]);

      if (user) {
        await notificationService.savePushTokenToDatabase(user.id);

        // Show biometric setup prompt for new users
        const biometricEnabled = await biometricAuth.isBiometricLoginEnabled(user.id);
        if (!biometricEnabled) {
          setTimeout(() => {
            biometricAuth.showBiometricSetupPrompt(user.id);
          }, 2000);
        }
      }

      setServicesInitialized(true);
    } catch (error) {
      console.error('Error initializing services:', error);
      setServicesInitialized(true); // Continue even if services fail
    }
  };

  const checkFirstLaunch = async () => {
    try {
      const hasLaunched = await SecureStore.getItemAsync('hasLaunched');
      if (hasLaunched === null) {
        setIsFirstLaunch(true);
        await SecureStore.setItemAsync('hasLaunched', 'true');
      } else {
        setIsFirstLaunch(false);
      }
    } catch (error) {
      setIsFirstLaunch(false);
    }
  };

  if (loading || !servicesInitialized || isFirstLaunch === null) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isFirstLaunch && (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      )}
      {!user ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen
            name="InstitutionDetail"
            component={InstitutionDetailScreen}
            options={{ headerShown: true, title: 'Institution Details' }}
          />
          <Stack.Screen
            name="Bursaries"
            component={BursariesScreen}
            options={{ headerShown: true, title: 'Bursaries & Funding' }}
          />
          <Stack.Screen
            name="Apply"
            component={ApplyScreen}
            options={{ headerShown: true, title: 'Apply Now' }}
          />
          <Stack.Screen
            name="Payment"
            component={PaymentScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Documents"
            component={DocumentsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{ headerShown: false }}
          />
        </>
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
        // App initialization
        console.log('App initializing...');

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
      console.log('App is ready');
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
