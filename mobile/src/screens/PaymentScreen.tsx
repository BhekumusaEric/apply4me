import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';
import { biometricAuth } from '../services/BiometricAuth';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  enabled: boolean;
  processingFee?: number;
}

interface Application {
  id: string;
  institution_name: string;
  program_name: string;
  application_fee: number;
  status: string;
}

export default function PaymentScreen({ route, navigation }: any) {
  const { user } = useAuth();
  const { applicationId } = route.params;
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'eft',
      name: 'EFT / Bank Transfer',
      icon: 'card',
      description: 'Direct bank transfer - No processing fees',
      enabled: true,
      processingFee: 0,
    },
    {
      id: 'capitec_pay',
      name: 'Capitec Pay',
      icon: 'phone-portrait',
      description: 'Pay with Capitec mobile app',
      enabled: true,
      processingFee: 2.50,
    },
    {
      id: 'payfast',
      name: 'PayFast',
      icon: 'card-outline',
      description: 'Credit/Debit card payments',
      enabled: false, // Disabled as per user request
      processingFee: 0,
    },
    {
      id: 'snapscan',
      name: 'SnapScan',
      icon: 'qr-code',
      description: 'QR code payment',
      enabled: true,
      processingFee: 1.50,
    },
    {
      id: 'zapper',
      name: 'Zapper',
      icon: 'flash',
      description: 'Mobile payment app',
      enabled: true,
      processingFee: 1.50,
    },
  ];

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          institutions(name),
          programs(name)
        `)
        .eq('id', applicationId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setApplication({
        id: data.id,
        institution_name: data.institutions?.name || 'Unknown Institution',
        program_name: data.programs?.name || 'Unknown Program',
        application_fee: data.application_fee || 0,
        status: data.status,
      });
    } catch (error) {
      console.error('Error fetching application:', error);
      Alert.alert('Error', 'Failed to load application details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (methodId: string) => {
    if (!application) return;

    // Authenticate for sensitive action
    const authResult = await biometricAuth.authenticateForSensitiveAction(
      'process payment'
    );

    if (!authResult.success) {
      Alert.alert('Authentication Required', authResult.error || 'Authentication failed');
      return;
    }

    setProcessing(true);
    setSelectedMethod(methodId);

    try {
      switch (methodId) {
        case 'eft':
          await handleEFTPayment();
          break;
        case 'capitec_pay':
          await handleCapitecPayment();
          break;
        case 'snapscan':
          await handleSnapScanPayment();
          break;
        case 'zapper':
          await handleZapperPayment();
          break;
        default:
          Alert.alert('Error', 'Payment method not supported');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Payment Failed', 'Please try again or contact support');
    } finally {
      setProcessing(false);
      setSelectedMethod(null);
    }
  };

  const handleEFTPayment = async () => {
    // Generate payment reference
    const paymentRef = `APP${application!.id.slice(-6).toUpperCase()}`;
    
    Alert.alert(
      'EFT Payment Details',
      `Bank: FNB\nAccount: Apply4Me Payments\nAccount Number: 62847291847\nBranch Code: 250655\nReference: ${paymentRef}\nAmount: R${application!.application_fee.toFixed(2)}\n\nPlease use the reference number when making payment.`,
      [
        { text: 'Copy Reference', onPress: () => copyToClipboard(paymentRef) },
        { text: 'Mark as Paid', onPress: () => markAsPaid('eft', paymentRef) },
      ]
    );
  };

  const handleCapitecPayment = async () => {
    const paymentUrl = `https://capitecbank.co.za/pay?amount=${application!.application_fee}&reference=APP${application!.id}`;
    
    Alert.alert(
      'Capitec Pay',
      'You will be redirected to the Capitec app to complete payment.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => Linking.openURL(paymentUrl) },
      ]
    );
  };

  const handleSnapScanPayment = async () => {
    Alert.alert(
      'SnapScan Payment',
      'SnapScan QR code payment will be available soon. Please use EFT for now.',
      [{ text: 'OK' }]
    );
  };

  const handleZapperPayment = async () => {
    Alert.alert(
      'Zapper Payment',
      'Zapper payment will be available soon. Please use EFT for now.',
      [{ text: 'OK' }]
    );
  };

  const copyToClipboard = (text: string) => {
    // Note: React Native doesn't have built-in clipboard, would need @react-native-clipboard/clipboard
    Alert.alert('Reference Copied', `Payment reference: ${text}`);
  };

  const markAsPaid = async (method: string, reference: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          payment_status: 'paid',
          payment_method: method,
          payment_reference: reference,
          payment_date: new Date().toISOString(),
        })
        .eq('id', application!.id);

      if (error) throw error;

      Alert.alert(
        'Payment Recorded',
        'Your payment has been recorded. We will verify it within 24 hours.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Applications'),
          },
        ]
      );
    } catch (error) {
      console.error('Error updating payment status:', error);
      Alert.alert('Error', 'Failed to record payment');
    }
  };

  const getTotalAmount = (baseAmount: number, processingFee: number = 0) => {
    return baseAmount + processingFee;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading payment details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!application) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
          <Text style={styles.errorText}>Application not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryContainer]}
        style={styles.header}
      >
        <Animatable.View animation="fadeInDown" style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backIcon}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={styles.placeholder} />
        </Animatable.View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Application Details */}
        <Animatable.View animation="fadeInUp" delay={200} style={styles.applicationCard}>
          <Text style={styles.cardTitle}>Application Details</Text>
          <View style={styles.applicationInfo}>
            <Text style={styles.institutionName}>{application.institution_name}</Text>
            <Text style={styles.programName}>{application.program_name}</Text>
            <View style={styles.feeContainer}>
              <Text style={styles.feeLabel}>Application Fee:</Text>
              <Text style={styles.feeAmount}>R{application.application_fee.toFixed(2)}</Text>
            </View>
          </View>
        </Animatable.View>

        {/* Payment Methods */}
        <Animatable.View animation="fadeInUp" delay={400} style={styles.paymentMethodsContainer}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          {paymentMethods.map((method, index) => (
            <Animatable.View
              key={method.id}
              animation="fadeInUp"
              delay={500 + (index * 100)}
              style={styles.paymentMethodCard}
            >
              <TouchableOpacity
                style={[
                  styles.paymentMethod,
                  !method.enabled && styles.paymentMethodDisabled,
                ]}
                onPress={() => method.enabled && handlePayment(method.id)}
                disabled={!method.enabled || processing}
              >
                <View style={styles.paymentMethodLeft}>
                  <Ionicons
                    name={method.icon as any}
                    size={24}
                    color={method.enabled ? theme.colors.primary : theme.colors.onSurfaceVariant}
                  />
                  <View style={styles.paymentMethodInfo}>
                    <Text style={[
                      styles.paymentMethodName,
                      !method.enabled && styles.paymentMethodNameDisabled
                    ]}>
                      {method.name}
                    </Text>
                    <Text style={styles.paymentMethodDescription}>
                      {method.description}
                    </Text>
                    {method.processingFee && method.processingFee > 0 && (
                      <Text style={styles.processingFee}>
                        Processing fee: R{method.processingFee.toFixed(2)}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.paymentMethodRight}>
                  {method.enabled ? (
                    <>
                      <Text style={styles.totalAmount}>
                        R{getTotalAmount(application.application_fee, method.processingFee).toFixed(2)}
                      </Text>
                      {processing && selectedMethod === method.id ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                      ) : (
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.onSurfaceVariant} />
                      )}
                    </>
                  ) : (
                    <Text style={styles.disabledText}>Coming Soon</Text>
                  )}
                </View>
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </Animatable.View>

        {/* Payment Info */}
        <Animatable.View animation="fadeInUp" delay={800} style={styles.infoCard}>
          <Text style={styles.infoTitle}>Payment Information</Text>
          <Text style={styles.infoText}>
            • All payments are processed securely{'\n'}• EFT payments may take 1-2 business days to reflect{'\n'}• You will receive a confirmation email once payment is verified{'\n'}• Contact support if you experience any issues
          </Text>
        </Animatable.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: theme.colors.error,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 50,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backIcon: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  applicationCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 16,
  },
  applicationInfo: {
    gap: 8,
  },
  institutionName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  programName: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
  },
  feeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  feeLabel: {
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  feeAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  paymentMethodsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 16,
  },
  paymentMethodCard: {
    marginBottom: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  paymentMethodDisabled: {
    opacity: 0.6,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodInfo: {
    marginLeft: 16,
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  paymentMethodNameDisabled: {
    color: theme.colors.onSurfaceVariant,
  },
  paymentMethodDescription: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
  },
  processingFee: {
    fontSize: 12,
    color: theme.colors.secondary,
    marginTop: 2,
  },
  paymentMethodRight: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  disabledText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
});
