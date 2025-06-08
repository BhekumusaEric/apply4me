import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

export default function ApplyScreen({ route, navigation }: any) {
  const { user } = useAuth();
  const { institutionId, programId, institution, program } = route.params;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    motivation: '',
    previousEducation: '',
    careerGoals: '',
    additionalInfo: '',
  });

  const handleSubmit = async () => {
    // All fields are now optional - no validation required
    setLoading(true);

    try {
      // Create application record with correct schema (remove non-existent columns)
      const applicationData = {
        user_id: user.id,
        institution_id: institutionId,
        program_id: programId,
        status: 'draft',
        personal_info: {
          motivation_letter: formData.motivation,
          previous_education: formData.previousEducation,
          career_goals: formData.careerGoals,
          additional_info: formData.additionalInfo
        },
        academic_info: {},
        submitted_at: null, // Will be set when actually submitted
        created_at: new Date().toISOString()
      };

      console.log('📝 Submitting application:', JSON.stringify(applicationData, null, 2));

      const { data: appData, error: applicationError } = await supabase
        .from('applications')
        .insert(applicationData)
        .select()
        .single();

      if (applicationError) throw applicationError;

      Alert.alert(
        'Application Saved',
        'Your application has been saved as a draft. You can complete it later or proceed to payment.',
        [
          {
            text: 'Complete Later',
            onPress: () => navigation.navigate('Applications'),
          },
          {
            text: 'Proceed to Payment',
            onPress: () => navigation.navigate('Payment', {
              applicationId: appData.id
            }),
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting application:', error);
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Apply Now</Text>
            <Text style={styles.headerSubtitle}>
              {institution?.name} - {program?.name}
            </Text>
          </View>
        </Animatable.View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Program Info */}
        <Animatable.View animation="fadeInUp" delay={200} style={styles.programCard}>
          <Text style={styles.cardTitle}>Program Details</Text>
          <View style={styles.programInfo}>
            <Text style={styles.programName}>{program?.name}</Text>
            <Text style={styles.programType}>{program?.degree_type}</Text>
            <Text style={styles.programDuration}>Duration: {program?.duration}</Text>
            {program?.application_fee > 0 && (
              <Text style={styles.applicationFee}>
                Application Fee: R{program?.application_fee.toFixed(2)}
              </Text>
            )}
          </View>
        </Animatable.View>

        {/* Application Form */}
        <Animatable.View animation="fadeInUp" delay={400} style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Application Form</Text>

          {/* Motivation Letter */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Motivation Letter (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Explain why you want to study this program and how it aligns with your career goals..."
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={formData.motivation}
              onChangeText={(text) => setFormData({ ...formData, motivation: text })}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* Previous Education */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Previous Education (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Describe your educational background, qualifications, and achievements..."
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={formData.previousEducation}
              onChangeText={(text) => setFormData({ ...formData, previousEducation: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Career Goals */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Career Goals (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="What are your career aspirations and how will this program help you achieve them?"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={formData.careerGoals}
              onChangeText={(text) => setFormData({ ...formData, careerGoals: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Additional Information */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Additional Information (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Any additional information you'd like to share..."
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={formData.additionalInfo}
              onChangeText={(text) => setFormData({ ...formData, additionalInfo: text })}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Save Application</Text>
                <Ionicons name="checkmark" size={20} color="white" />
              </>
            )}
          </TouchableOpacity>

          {/* Info Text */}
          <Text style={styles.infoText}>
            All fields are optional - you can fill them out now or complete them later.{'\n'}Your application will be saved as a draft. You can update it anytime or proceed to payment to submit it officially.
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 50,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    padding: 8,
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  programCard: {
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
    marginBottom: 12,
  },
  programInfo: {
    gap: 4,
  },
  programName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  programType: {
    fontSize: 14,
    color: theme.colors.primary,
  },
  programDuration: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
  },
  applicationFee: {
    fontSize: 14,
    color: theme.colors.secondary,
    fontWeight: '500',
  },
  formContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.onSurface,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.colors.onSurface,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  textArea: {
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
  },
});
