import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

export class BiometricAuthService {
  private static instance: BiometricAuthService;
  
  public static getInstance(): BiometricAuthService {
    if (!BiometricAuthService.instance) {
      BiometricAuthService.instance = new BiometricAuthService();
    }
    return BiometricAuthService.instance;
  }

  async isBiometricSupported(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Error checking biometric support:', error);
      return false;
    }
  }

  async getSupportedAuthenticationTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.error('Error getting supported authentication types:', error);
      return [];
    }
  }

  async authenticateWithBiometrics(
    promptMessage: string = 'Authenticate to continue'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const isSupported = await this.isBiometricSupported();
      
      if (!isSupported) {
        return {
          success: false,
          error: 'Biometric authentication is not available on this device'
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Password',
        disableDeviceFallback: false,
      });

      if (result.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || 'Authentication failed'
        };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: 'An error occurred during authentication'
      };
    }
  }

  async enableBiometricLogin(userId: string): Promise<boolean> {
    try {
      const authResult = await this.authenticateWithBiometrics(
        'Enable biometric login for Apply4Me'
      );

      if (authResult.success) {
        await SecureStore.setItemAsync(`biometric_enabled_${userId}`, 'true');
        return true;
      } else {
        Alert.alert('Authentication Failed', authResult.error || 'Could not enable biometric login');
        return false;
      }
    } catch (error) {
      console.error('Error enabling biometric login:', error);
      Alert.alert('Error', 'Failed to enable biometric login');
      return false;
    }
  }

  async disableBiometricLogin(userId: string): Promise<boolean> {
    try {
      await SecureStore.deleteItemAsync(`biometric_enabled_${userId}`);
      return true;
    } catch (error) {
      console.error('Error disabling biometric login:', error);
      return false;
    }
  }

  async isBiometricLoginEnabled(userId: string): Promise<boolean> {
    try {
      const enabled = await SecureStore.getItemAsync(`biometric_enabled_${userId}`);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking biometric login status:', error);
      return false;
    }
  }

  async authenticateForLogin(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const isEnabled = await this.isBiometricLoginEnabled(userId);
      
      if (!isEnabled) {
        return {
          success: false,
          error: 'Biometric login is not enabled'
        };
      }

      return await this.authenticateWithBiometrics(
        'Sign in to Apply4Me with your biometric'
      );
    } catch (error) {
      console.error('Error during biometric login:', error);
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  }

  async getBiometricTypeString(): Promise<string> {
    try {
      const types = await this.getSupportedAuthenticationTypes();
      
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return 'Face ID';
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'Fingerprint';
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        return 'Iris';
      } else {
        return 'Biometric';
      }
    } catch (error) {
      console.error('Error getting biometric type:', error);
      return 'Biometric';
    }
  }

  async showBiometricSetupPrompt(userId: string): Promise<void> {
    try {
      const isSupported = await this.isBiometricSupported();
      const biometricType = await this.getBiometricTypeString();
      
      if (!isSupported) {
        Alert.alert(
          'Biometric Authentication Unavailable',
          'Your device does not support biometric authentication or no biometrics are enrolled.'
        );
        return;
      }

      Alert.alert(
        'Enable Biometric Login',
        `Would you like to enable ${biometricType} login for faster and more secure access to Apply4Me?`,
        [
          { text: 'Not Now', style: 'cancel' },
          {
            text: 'Enable',
            onPress: async () => {
              const success = await this.enableBiometricLogin(userId);
              if (success) {
                Alert.alert(
                  'Success',
                  `${biometricType} login has been enabled successfully!`
                );
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error showing biometric setup prompt:', error);
    }
  }

  async authenticateForSensitiveAction(
    action: string = 'perform this action'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const isSupported = await this.isBiometricSupported();
      
      if (isSupported) {
        return await this.authenticateWithBiometrics(
          `Authenticate to ${action}`
        );
      } else {
        // Fallback to device passcode
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: `Enter your device passcode to ${action}`,
          fallbackLabel: 'Use Passcode',
          disableDeviceFallback: false,
        });

        return {
          success: result.success,
          error: result.success ? undefined : 'Authentication failed'
        };
      }
    } catch (error) {
      console.error('Error during sensitive action authentication:', error);
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  }
}

export const biometricAuth = BiometricAuthService.getInstance();
