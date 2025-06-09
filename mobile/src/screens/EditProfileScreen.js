import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

export default function EditProfileScreen({ navigation }) {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    id_number: '',
    address: '',
    grade12_year: '',
    average_percentage: '',
    subjects: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Extract data from JSONB fields
        const personalInfo = data.personal_info || {};
        const contactInfo = data.contact_info || {};
        const academicHistory = data.academic_history || {};

        setFormData({
          full_name: personalInfo.full_name || `${data.first_name || ''} ${data.last_name || ''}`.trim() || '',
          phone: data.phone || contactInfo.phone || '',
          id_number: data.id_number || '',
          address: personalInfo.address || '',
          grade12_year: academicHistory.grade12_year?.toString() || '',
          average_percentage: academicHistory.average_percentage?.toString() || '',
          subjects: academicHistory.subjects?.join(', ') || ''
        });
      } else {
        // Set default values for new profile
        setFormData({
          full_name: authUser.email?.split('@')[0] || '',
          phone: '',
          id_number: '',
          address: '',
          grade12_year: '',
          average_percentage: '',
          subjects: ''
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.id_number && !/^\d{13}$/.test(formData.id_number)) {
      newErrors.id_number = 'ID number must be 13 digits';
    }

    if (formData.grade12_year && (isNaN(formData.grade12_year) || formData.grade12_year < 1990 || formData.grade12_year > new Date().getFullYear())) {
      newErrors.grade12_year = 'Please enter a valid year';
    }

    if (formData.average_percentage && (isNaN(formData.average_percentage) || formData.average_percentage < 0 || formData.average_percentage > 100)) {
      newErrors.average_percentage = 'Percentage must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving');
      return;
    }

    setSaving(true);
    try {
      // Use only the columns that actually exist in the database
      const profileData = {
        user_id: authUser.id,
        email: authUser.email,
        first_name: formData.full_name.trim().split(' ')[0] || '',
        last_name: formData.full_name.trim().split(' ').slice(1).join(' ') || '',
        phone: formData.phone.trim() || null,
        id_number: formData.id_number.trim() || null,
        personal_info: {
          full_name: formData.full_name.trim(),
          address: formData.address.trim() || null,
          date_of_birth: null,
          gender: null,
          nationality: 'South African'
        },
        contact_info: {
          email: authUser.email,
          phone: formData.phone.trim() || null,
          alternative_phone: null,
          preferred_contact_method: 'Email'
        },
        academic_history: {
          grade12_year: formData.grade12_year ? parseInt(formData.grade12_year) : null,
          average_percentage: formData.average_percentage ? parseFloat(formData.average_percentage) : null,
          subjects: formData.subjects ? formData.subjects.split(',').map(s => s.trim()).filter(s => s) : []
        },
        study_preferences: {},
        updated_at: new Date().toISOString()
      };

      console.log('📝 Saving profile data:', JSON.stringify(profileData, null, 2));

      // Try a simpler approach - only update existing columns
      const simpleProfileData = {
        user_id: authUser.id,
        email: authUser.email,
        first_name: formData.full_name.trim().split(' ')[0] || '',
        last_name: formData.full_name.trim().split(' ').slice(1).join(' ') || '',
        phone: formData.phone.trim() || null,
        id_number: formData.id_number.trim() || null,
        personal_info: {
          full_name: formData.full_name.trim(),
          address: formData.address.trim() || null,
          date_of_birth: null,
          gender: null,
          nationality: 'South African'
        },
        contact_info: {
          email: authUser.email,
          phone: formData.phone.trim() || null,
          alternative_phone: null,
          preferred_contact_method: 'Email'
        },
        academic_history: {
          grade12_year: formData.grade12_year ? parseInt(formData.grade12_year) : null,
          average_percentage: formData.average_percentage ? parseFloat(formData.average_percentage) : null,
          subjects: formData.subjects ? formData.subjects.split(',').map(s => s.trim()).filter(s => s) : []
        },
        updated_at: new Date().toISOString()
      };

      console.log('📝 Simple profile data:', JSON.stringify(simpleProfileData, null, 2));

      const { error } = await supabase
        .from('student_profiles')
        .upsert(simpleProfileData, { onConflict: 'user_id' });

      if (error) throw error;

      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      Alert.alert('Error', `Failed to save profile: ${error.message || 'Please try again.'}`);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryContainer]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="checkmark" size={24} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Personal Information Section */}
          <Animatable.View animation="fadeInUp" delay={200} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person" size={20} color="#007A4D" />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={[styles.textInput, errors.full_name && styles.inputError]}
                value={formData.full_name}
                onChangeText={(value) => updateField('full_name', value)}
                placeholder="Enter your full name"
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
              {errors.full_name && <Text style={styles.errorText}>{errors.full_name}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={[styles.textInput, errors.phone && styles.inputError]}
                value={formData.phone}
                onChangeText={(value) => updateField('phone', value)}
                placeholder="e.g., +27 12 345 6789"
                placeholderTextColor="rgba(255,255,255,0.5)"
                keyboardType="phone-pad"
              />
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>ID Number</Text>
              <TextInput
                style={[styles.textInput, errors.id_number && styles.inputError]}
                value={formData.id_number}
                onChangeText={(value) => updateField('id_number', value)}
                placeholder="13-digit ID number"
                placeholderTextColor="rgba(255,255,255,0.5)"
                keyboardType="numeric"
                maxLength={13}
              />
              {errors.id_number && <Text style={styles.errorText}>{errors.id_number}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.address}
                onChangeText={(value) => updateField('address', value)}
                placeholder="Enter your full address"
                placeholderTextColor="rgba(255,255,255,0.5)"
                multiline
                numberOfLines={3}
              />
            </View>
          </Animatable.View>

          {/* Academic Information Section */}
          <Animatable.View animation="fadeInUp" delay={400} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="school" size={20} color="#007A4D" />
              <Text style={styles.sectionTitle}>Academic Information</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Grade 12 Year</Text>
              <TextInput
                style={[styles.textInput, errors.grade12_year && styles.inputError]}
                value={formData.grade12_year}
                onChangeText={(value) => updateField('grade12_year', value)}
                placeholder="e.g., 2023"
                placeholderTextColor="rgba(255,255,255,0.5)"
                keyboardType="numeric"
                maxLength={4}
              />
              {errors.grade12_year && <Text style={styles.errorText}>{errors.grade12_year}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Average Percentage</Text>
              <TextInput
                style={[styles.textInput, errors.average_percentage && styles.inputError]}
                value={formData.average_percentage}
                onChangeText={(value) => updateField('average_percentage', value)}
                placeholder="e.g., 85"
                placeholderTextColor="rgba(255,255,255,0.5)"
                keyboardType="numeric"
              />
              {errors.average_percentage && <Text style={styles.errorText}>{errors.average_percentage}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Subjects</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.subjects}
                onChangeText={(value) => updateField('subjects', value)}
                placeholder="e.g., Mathematics, English, Physical Sciences (comma separated)"
                placeholderTextColor="rgba(255,255,255,0.5)"
                multiline
                numberOfLines={3}
              />
              <Text style={styles.helperText}>Separate subjects with commas</Text>
            </View>
          </Animatable.View>

          {/* Save Button */}
          <Animatable.View animation="fadeInUp" delay={600} style={styles.section}>
            <TouchableOpacity 
              style={[styles.saveButtonLarge, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              <LinearGradient
                colors={saving ? ['#666', '#666'] : [theme.colors.primary, theme.colors.primaryContainer]}
                style={styles.saveButtonGradient}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="save" size={20} color="white" />
                )}
                <Text style={styles.saveButtonText}>
                  {saving ? 'Saving...' : 'Save Profile'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  saveButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#2a2a2a',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#FF4444',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: 5,
  },
  helperText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 5,
  },
  saveButtonLarge: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
