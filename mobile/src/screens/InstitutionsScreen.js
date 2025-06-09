import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../context/AuthContext';
import { theme } from '../theme/theme';

export default function InstitutionsScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [institutions, setInstitutions] = useState([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInstitutions();
  }, []);

  useEffect(() => {
    filterInstitutions();
  }, [institutions, searchQuery, selectedType]);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);

      // First get institutions with their programs
      const { data: institutionsData, error: institutionsError } = await supabase
        .from('institutions')
        .select('*')
        .order('name');

      if (institutionsError) throw institutionsError;

      // Then get programs for each institution
      const institutionsWithPrograms = await Promise.all(
        (institutionsData || []).map(async (institution) => {
          const { data: programsData, error: programsError } = await supabase
            .from('programs')
            .select('name')
            .eq('institution_id', institution.id)
            .limit(5);

          const programNames = programsData?.map(p => p.name) || [];

          return {
            ...institution,
            programs_count: programNames.length,
            rating: 4.2, // Default rating - can be calculated from reviews
            applicationFee: institution.application_fee || 150, // Default fee
            deadline: institution.application_deadline || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
            programs: programNames.length > 0 ? programNames : ['General Studies', 'Various Programs']
          };
        })
      );

      console.log('✅ Fetched institutions with programs:', institutionsWithPrograms.length);
      setInstitutions(institutionsWithPrograms);
    } catch (error) {
      console.error('❌ Error fetching institutions:', error);
      Alert.alert('Error', 'Failed to load institutions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInstitutions();
    setRefreshing(false);
  };

  const filterInstitutions = () => {
    let filtered = institutions;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(institution =>
        institution.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        institution.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        institution.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(institution =>
        institution.type?.toLowerCase() === selectedType.toLowerCase()
      );
    }

    setFilteredInstitutions(filtered);
  };

  const institutionTypes = [
    { key: 'all', label: 'All Types', icon: 'apps' },
    { key: 'university', label: 'Universities', icon: 'school' },
    { key: 'college', label: 'Colleges', icon: 'library' },
    { key: 'tvet', label: 'TVET Colleges', icon: 'construct' },
    { key: 'private', label: 'Private', icon: 'business' }
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case 'university': return '#007A4D';
      case 'tvet': return '#FF6B35';
      case 'private': return '#4ECDC4';
      default: return '#666';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'university': return 'University';
      case 'tvet': return 'TVET College';
      case 'private': return 'Private College';
      default: return 'Institution';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading institutions...</Text>
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
          <Text style={styles.headerTitle}>Institutions</Text>
          <Text style={styles.headerSubtitle}>
            Discover {institutions.length}+ educational opportunities
          </Text>
        </Animatable.View>
      </LinearGradient>

      {/* Search Bar */}
      <Animatable.View animation="fadeInUp" delay={200} style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={theme.colors.onSurfaceVariant} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search institutions..."
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        </View>
      </Animatable.View>

      {/* Filter Tabs */}
      <Animatable.View animation="fadeInUp" delay={400}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {institutionTypes.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.filterTab,
                selectedType === type.key && styles.filterTabActive
              ]}
              onPress={() => setSelectedType(type.key)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={type.icon}
                size={16}
                color={selectedType === type.key ? 'white' : theme.colors.onSurfaceVariant}
              />
              <Text style={[
                styles.filterTabText,
                selectedType === type.key && styles.filterTabTextActive
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animatable.View>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredInstitutions.length} institution{filteredInstitutions.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Institutions List */}
      <FlatList
        data={filteredInstitutions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item: institution, index }) => (
          <Animatable.View
            animation="fadeInUp"
            delay={index * 100}
            style={styles.institutionCardContainer}
          >
            <TouchableOpacity
              style={styles.institutionCard}
              onPress={() => {
                console.log('🏛️ Navigating to institution:', institution.id, institution.name);
                navigation.navigate('InstitutionDetail', { institutionId: institution.id });
              }}
              activeOpacity={0.9}
            >
            <View style={styles.institutionHeader}>
              <View style={styles.institutionInfo}>
                <Text style={styles.institutionName}>{institution.name}</Text>
                <View style={styles.institutionMeta}>
                  <View style={[styles.typeTag, { backgroundColor: getTypeColor(institution.type) }]}>
                    <Text style={styles.typeTagText}>{getTypeLabel(institution.type)}</Text>
                  </View>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.rating}>{institution.rating}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.locationContainer}>
              <Ionicons name="location" size={14} color="#666" />
              <Text style={styles.location}>{institution.province || institution.city || 'South Africa'}</Text>
            </View>

            <Text style={styles.description} numberOfLines={2}>
              {institution.description}
            </Text>

            <View style={styles.programsContainer}>
              <Text style={styles.programsLabel}>Programs:</Text>
              <Text style={styles.programs} numberOfLines={1}>
                {Array.isArray(institution.programs) && institution.programs.length > 0
                  ? `${institution.programs.slice(0, 3).join(', ')}${institution.programs.length > 3 ? '...' : ''}`
                  : 'Various Programs Available'
                }
              </Text>
            </View>

            <View style={styles.institutionFooter}>
              <View style={styles.feeContainer}>
                <Ionicons name="card" size={14} color="#007A4D" />
                <Text style={styles.fee}>R{institution.applicationFee}</Text>
              </View>
              <View style={styles.deadlineContainer}>
                <Ionicons name="calendar" size={14} color="#FF6B35" />
                <Text style={styles.deadline}>
                  Due: {institution.deadline ? new Date(institution.deadline).toLocaleDateString() : 'TBA'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
            </TouchableOpacity>
          </Animatable.View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={64} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.emptyTitle}>No institutions found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search or filter criteria
            </Text>
          </View>
        }
      />
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    paddingTop: 50,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  searchContainer: {
    padding: 20,
    backgroundColor: theme.colors.surface,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: theme.colors.onSurface,
    fontSize: 16,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.surface,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 25,
    backgroundColor: theme.colors.surfaceVariant,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  filterTabActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterTabText: {
    marginLeft: 8,
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: 'white',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
  },
  resultsCount: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  institutionCardContainer: {
    marginBottom: 16,
  },
  institutionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  institutionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  institutionInfo: {
    flex: 1,
  },
  institutionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: 6,
  },
  institutionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 10,
  },
  typeTagText: {
    fontSize: 11,
    color: 'white',
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: theme.colors.onSurface,
    marginLeft: 3,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 13,
    color: '#666',
    marginLeft: 5,
  },
  description: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: 10,
  },
  programsContainer: {
    marginBottom: 12,
  },
  programsLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  programs: {
    fontSize: 13,
    color: theme.colors.onSurface,
  },
  institutionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fee: {
    fontSize: 13,
    color: '#007A4D',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadline: {
    fontSize: 12,
    color: '#FF6B35',
    marginLeft: 4,
  },
});
