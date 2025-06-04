import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BursariesScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedField, setSelectedField] = useState('all');

  // No mock data - fetch from API
  const [bursaries, setBursaries] = useState([])

  useEffect(() => {
    // Fetch bursaries from API
    // TODO: Implement API call to fetch real bursaries
    setBursaries([])
  }, [])

  const studyFields = [
    { key: 'all', label: 'All Fields', icon: 'apps' },
    { key: 'engineering', label: 'Engineering', icon: 'construct' },
    { key: 'health', label: 'Health Sciences', icon: 'medical' },
    { key: 'education', label: 'Education', icon: 'school' },
    { key: 'it', label: 'Information Technology', icon: 'laptop' },
    { key: 'business', label: 'Business', icon: 'briefcase' }
  ];

  const filteredBursaries = bursaries.filter(bursary => {
    const matchesSearch = bursary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bursary.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesField = selectedField === 'all' || 
                        bursary.fieldOfStudy.some(field => 
                          field.toLowerCase().includes(selectedField.toLowerCase())
                        );
    return matchesSearch && matchesField && bursary.isActive;
  });

  const getDaysUntilDeadline = (deadline) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDeadlineColor = (deadline) => {
    const days = getDaysUntilDeadline(deadline);
    if (days < 7) return '#FF4444';
    if (days < 30) return '#FF6B35';
    return '#007A4D';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search bursaries..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {studyFields.map((field) => (
          <TouchableOpacity
            key={field.key}
            style={[
              styles.filterTab,
              selectedField === field.key && styles.filterTabActive
            ]}
            onPress={() => setSelectedField(field.key)}
          >
            <Ionicons 
              name={field.icon} 
              size={16} 
              color={selectedField === field.key ? 'white' : '#666'} 
            />
            <Text style={[
              styles.filterTabText,
              selectedField === field.key && styles.filterTabTextActive
            ]}>
              {field.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredBursaries.length} bursary{filteredBursaries.length !== 1 ? 'ies' : ''} found
        </Text>
      </View>

      {/* Bursaries List */}
      <ScrollView style={styles.bursariesList}>
        {filteredBursaries.map((bursary) => (
          <TouchableOpacity
            key={bursary.id}
            style={styles.bursaryCard}
          >
            <View style={styles.bursaryHeader}>
              <View style={styles.bursaryInfo}>
                <Text style={styles.bursaryTitle}>{bursary.title}</Text>
                <Text style={styles.provider}>{bursary.provider}</Text>
              </View>
              <View style={styles.amountContainer}>
                <Text style={styles.amount}>R{bursary.amount.toLocaleString()}</Text>
                <Text style={styles.amountLabel}>per year</Text>
              </View>
            </View>

            <Text style={styles.description} numberOfLines={2}>
              {bursary.description}
            </Text>

            <View style={styles.fieldsContainer}>
              <Text style={styles.fieldsLabel}>Field of Study:</Text>
              <Text style={styles.fields}>{bursary.fieldOfStudy.join(', ')}</Text>
            </View>

            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsLabel}>Key Requirements:</Text>
              {bursary.requirements.slice(0, 2).map((req, index) => (
                <Text key={index} style={styles.requirement}>• {req}</Text>
              ))}
              {bursary.requirements.length > 2 && (
                <Text style={styles.moreRequirements}>
                  +{bursary.requirements.length - 2} more requirements
                </Text>
              )}
            </View>

            <View style={styles.bursaryFooter}>
              <View style={[styles.deadlineContainer, { backgroundColor: getDeadlineColor(bursary.deadline) + '20' }]}>
                <Ionicons name="calendar" size={14} color={getDeadlineColor(bursary.deadline)} />
                <Text style={[styles.deadline, { color: getDeadlineColor(bursary.deadline) }]}>
                  {getDaysUntilDeadline(bursary.deadline)} days left
                </Text>
              </View>
              <TouchableOpacity style={styles.applyButton}>
                <Text style={styles.applyButtonText}>View Details</Text>
                <Ionicons name="chevron-forward" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#2a2a2a',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: 'white',
    fontSize: 16,
  },
  filterContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#2a2a2a',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
  },
  filterTabActive: {
    backgroundColor: '#007A4D',
  },
  filterTabText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  filterTabTextActive: {
    color: 'white',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  resultsCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  bursariesList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  bursaryCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  bursaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bursaryInfo: {
    flex: 1,
    marginRight: 15,
  },
  bursaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  provider: {
    fontSize: 13,
    color: '#007A4D',
    fontWeight: '500',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  amountLabel: {
    fontSize: 11,
    color: '#666',
  },
  description: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
    marginBottom: 12,
  },
  fieldsContainer: {
    marginBottom: 10,
  },
  fieldsLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  fields: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  requirementsContainer: {
    marginBottom: 15,
  },
  requirementsLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  requirement: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  moreRequirements: {
    fontSize: 11,
    color: '#007A4D',
    fontStyle: 'italic',
  },
  bursaryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  deadline: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007A4D',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    marginRight: 5,
  },
});
