import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';
import { apiRequest, API_ENDPOINTS } from '../config/api';

interface Bursary {
  id: string;
  name: string;
  provider: string;
  type: 'national' | 'provincial' | 'sector' | 'institutional';
  field_of_study: string[];
  eligibility_criteria: string[];
  amount: number | null;
  application_deadline: string | null;
  application_url: string | null;
  description: string;
  is_active: boolean;
}

export default function BursariesScreen() {
  const [bursaries, setBursaries] = useState<Bursary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const bursaryTypes = [
    { key: 'all', label: 'All', icon: 'list' },
    { key: 'national', label: 'Gov', icon: 'flag' },
    { key: 'provincial', label: 'Prov', icon: 'location' },
    { key: 'sector', label: 'Corp', icon: 'business' },
    { key: 'institutional', label: 'Uni', icon: 'school' },
  ];

  useEffect(() => {
    fetchBursaries();
  }, []);

  const fetchBursaries = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching bursaries from API...');

      // Use centralized API configuration
      const result = await apiRequest(API_ENDPOINTS.bursaries);

      if (!result.success) {
        console.error('❌ API error:', result.error);
        throw new Error(result.error || 'Failed to fetch bursaries');
      }

      if (result.data && result.data.length > 0) {
        console.log('✅ Found bursaries:', result.data.length);
        console.log('📋 First bursary:', result.data[0]?.name);
        setBursaries(result.data);
      } else {
        console.log('⚠️ No bursaries found in database');
        setBursaries([]);
      }
    } catch (error) {
      console.error('❌ Error fetching bursaries:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      Alert.alert(
        'Error Loading Bursaries',
        'Failed to load bursaries. Please check your internet connection and try again.',
        [
          { text: 'Retry', onPress: fetchBursaries },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredBursaries = bursaries.filter(bursary => {
    const matchesSearch = bursary.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bursary.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || bursary.type === selectedType;
    return matchesSearch && matchesType && bursary.is_active;
  });

  const formatAmount = (amount: number | null) => {
    if (!amount) return 'Amount varies';
    return `R${amount.toLocaleString()}`;
  };

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return 'No deadline specified';
    const date = new Date(deadline);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysUntilDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDeadlineColor = (deadline: string | null) => {
    const days = getDaysUntilDeadline(deadline);
    if (!days) return theme.colors.onSurfaceVariant;
    if (days < 7) return theme.colors.error;
    if (days < 30) return '#FF9500';
    return theme.colors.primary;
  };

  const handleApply = (bursary: Bursary) => {
    if (bursary.application_url) {
      Linking.openURL(bursary.application_url);
    } else {
      Alert.alert('Application Info', 'Please contact the provider directly for application details.');
    }
  };

  const renderBursaryCard = ({ item: bursary }: { item: Bursary }) => (
    <Animatable.View animation="fadeInUp" style={styles.bursaryCard}>
      <View style={styles.bursaryHeader}>
        <View style={styles.bursaryInfo}>
          <Text style={styles.bursaryTitle}>{bursary.name}</Text>
          <Text style={styles.provider}>{bursary.provider}</Text>
          <View style={styles.typeContainer}>
            <Text style={styles.typeText}>{bursary.type.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>{formatAmount(bursary.amount)}</Text>
          <Text style={styles.amountLabel}>funding</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={3}>
        {bursary.description}
      </Text>

      {bursary.field_of_study && bursary.field_of_study.length > 0 && (
        <View style={styles.fieldsContainer}>
          <Text style={styles.fieldsLabel}>Fields of Study:</Text>
          <Text style={styles.fieldsText}>
            {bursary.field_of_study.slice(0, 3).join(', ')}
            {bursary.field_of_study.length > 3 ? '...' : ''}
          </Text>
        </View>
      )}

      <View style={styles.bursaryFooter}>
        {bursary.application_deadline && (
          <View style={[styles.deadlineContainer, { backgroundColor: getDeadlineColor(bursary.application_deadline) + '20' }]}>
            <Ionicons name="calendar" size={14} color={getDeadlineColor(bursary.application_deadline)} />
            <Text style={[styles.deadline, { color: getDeadlineColor(bursary.application_deadline) }]}>
              {getDaysUntilDeadline(bursary.application_deadline)
                ? `${getDaysUntilDeadline(bursary.application_deadline)} days left`
                : formatDeadline(bursary.application_deadline)
              }
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => handleApply(bursary)}
        >
          <Text style={styles.applyButtonText}>Apply Now</Text>
          <Ionicons name="open-outline" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </Animatable.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading bursaries...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={theme.colors.onSurfaceVariant} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search bursaries..."
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <Animatable.View animation="fadeInUp" delay={400}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {bursaryTypes.map((type) => (
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
                name={type.icon as any}
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
          {filteredBursaries.length} bursary{filteredBursaries.length !== 1 ? 'ies' : ''} found
        </Text>
      </View>

      {/* Bursaries List */}
      {filteredBursaries.length > 0 ? (
        <FlatList
          data={filteredBursaries}
          renderItem={renderBursaryCard}
          keyExtractor={(item) => item.id}
          style={styles.bursariesList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="wallet-outline" size={80} color={theme.colors.onSurfaceVariant} />
          <Text style={styles.emptyTitle}>No Bursaries Found</Text>
          <Text style={styles.emptyText}>
            {searchQuery || selectedType !== 'all'
              ? 'Try adjusting your search or filters'
              : 'No bursaries are currently available'
            }
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 10,
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceVariant,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    minHeight: 28,
  },
  filterTabActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterTabText: {
    marginLeft: 4,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: 'white',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resultsCount: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '500',
  },
  bursariesList: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  bursaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  bursaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bursaryInfo: {
    flex: 1,
    marginRight: 16,
  },
  bursaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  provider: {
    fontSize: 14,
    color: theme.colors.primary,
    marginBottom: 8,
  },
  typeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.secondary,
  },
  amountLabel: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  description: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: 12,
  },
  fieldsContainer: {
    marginBottom: 16,
  },
  fieldsLabel: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '600',
    marginBottom: 4,
  },
  fieldsText: {
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  bursaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deadline: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginTop: 20,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
  },
});
