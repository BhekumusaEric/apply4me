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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../context/AuthContext';
import { theme } from '../theme/theme';

interface Institution {
  id: string;
  name: string;
  type: string;
  location: string;
  description?: string;
  website?: string;
  contact_email?: string;
  contact_phone?: string;
  programs?: Program[];
}

interface Program {
  id: string;
  name: string;
  degree_type: string;
  duration: string;
  requirements?: string;
  application_fee: number;
}

export default function InstitutionDetailScreen({ route, navigation }: any) {
  const { institutionId } = route.params;
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('🏛️ InstitutionDetailScreen params:', route.params);
  console.log('🏛️ Institution ID:', institutionId);

  useEffect(() => {
    if (institutionId) {
      fetchInstitutionDetails();
    } else {
      console.error('❌ No institution ID provided');
      Alert.alert('Error', 'No institution selected');
      navigation.goBack();
    }
  }, [institutionId]);

  const fetchInstitutionDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('institutions')
        .select(`
          *,
          programs(*)
        `)
        .eq('id', institutionId)
        .single();

      if (error) throw error;
      setInstitution(data);
    } catch (error) {
      console.error('Error fetching institution details:', error);
      Alert.alert('Error', 'Failed to load institution details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (program: Program) => {
    navigation.navigate('Apply', { 
      institutionId: institution?.id,
      programId: program.id,
      institution: institution,
      program: program
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading institution details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!institution) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
          <Text style={styles.errorText}>Institution not found</Text>
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
          <View style={styles.headerText}>
            <Text style={styles.institutionName}>{institution.name}</Text>
            <Text style={styles.institutionLocation}>{institution.province || institution.location || 'South Africa'}</Text>
          </View>
        </Animatable.View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Institution Info */}
        <Animatable.View animation="fadeInUp" delay={200} style={styles.infoCard}>
          <Text style={styles.cardTitle}>About</Text>
          <Text style={styles.description}>
            {institution.description || 'No description available.'}
          </Text>
          
          <View style={styles.contactInfo}>
            {institution.contact_email && (
              <View style={styles.contactItem}>
                <Ionicons name="mail" size={20} color={theme.colors.primary} />
                <Text style={styles.contactText}>{institution.contact_email}</Text>
              </View>
            )}
            {institution.contact_phone && (
              <View style={styles.contactItem}>
                <Ionicons name="call" size={20} color={theme.colors.primary} />
                <Text style={styles.contactText}>{institution.contact_phone}</Text>
              </View>
            )}
            {institution.website && (
              <View style={styles.contactItem}>
                <Ionicons name="globe" size={20} color={theme.colors.primary} />
                <Text style={styles.contactText}>{institution.website}</Text>
              </View>
            )}
          </View>
        </Animatable.View>

        {/* Programs */}
        <Animatable.View animation="fadeInUp" delay={400} style={styles.programsContainer}>
          <Text style={styles.sectionTitle}>Available Programs</Text>
          {institution.programs && institution.programs.length > 0 ? (
            institution.programs.map((program, index) => (
              <Animatable.View
                key={program.id}
                animation="fadeInUp"
                delay={500 + (index * 100)}
                style={styles.programCard}
              >
                <View style={styles.programInfo}>
                  <Text style={styles.programName}>{program.name}</Text>
                  <Text style={styles.programType}>{program.degree_type}</Text>
                  <Text style={styles.programDuration}>Duration: {program.duration}</Text>
                  {program.application_fee > 0 && (
                    <Text style={styles.applicationFee}>
                      Application Fee: R{program.application_fee.toFixed(2)}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => handleApply(program)}
                >
                  <Text style={styles.applyButtonText}>Apply</Text>
                  <Ionicons name="arrow-forward" size={16} color="white" />
                </TouchableOpacity>
              </Animatable.View>
            ))
          ) : (
            <View style={styles.noProgramsContainer}>
              <Ionicons name="school-outline" size={48} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.noProgramsText}>No programs available</Text>
            </View>
          )}
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
  },
  backIcon: {
    padding: 8,
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  institutionName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  institutionLocation: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
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
  description: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: 16,
  },
  contactInfo: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  programsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 16,
  },
  programCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    flexDirection: 'row',
    alignItems: 'center',
  },
  programInfo: {
    flex: 1,
  },
  programName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  programType: {
    fontSize: 14,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  programDuration: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  applicationFee: {
    fontSize: 12,
    color: theme.colors.secondary,
    fontWeight: '500',
  },
  applyButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  noProgramsContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noProgramsText: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    marginTop: 12,
  },
});
