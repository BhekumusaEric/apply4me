import React, { useState } from 'react';
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

export default function InstitutionsScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  // Mock institutions data (would come from API)
  const institutions = [
    {
      id: 1,
      name: 'University of Cape Town',
      type: 'university',
      location: 'Cape Town, Western Cape',
      description: '🤖 Auto-discovered: Leading research university in Africa',
      programs: ['Medicine', 'Engineering', 'Business', 'Law'],
      applicationFee: 200,
      deadline: '2024-09-30',
      rating: 4.8
    },
    {
      id: 2,
      name: 'University of Johannesburg',
      type: 'university',
      location: 'Johannesburg, Gauteng',
      description: '🤖 Auto-discovered: Comprehensive university with diverse programs',
      programs: ['Engineering', 'Business', 'Arts', 'Science'],
      applicationFee: 200,
      deadline: '2024-09-30',
      rating: 4.6
    },
    {
      id: 3,
      name: 'Ekurhuleni East TVET College',
      type: 'tvet',
      location: 'Ekurhuleni, Gauteng',
      description: '🤖 Auto-discovered: Technical and vocational training college',
      programs: ['Electrical Engineering', 'Mechanical Engineering', 'Business'],
      applicationFee: 50,
      deadline: '2024-11-30',
      rating: 4.2
    },
    {
      id: 4,
      name: 'Cape Peninsula University of Technology',
      type: 'university',
      location: 'Cape Town, Western Cape',
      description: '🤖 Auto-discovered: Technology-focused university',
      programs: ['Information Technology', 'Engineering', 'Applied Sciences'],
      applicationFee: 150,
      deadline: '2024-08-31',
      rating: 4.4
    },
    {
      id: 5,
      name: 'Varsity College',
      type: 'private',
      location: 'Multiple Locations',
      description: 'Private higher education institution',
      programs: ['Business', 'Information Technology', 'Law', 'Psychology'],
      applicationFee: 300,
      deadline: '2024-10-15',
      rating: 4.3
    }
  ];

  const institutionTypes = [
    { key: 'all', label: 'All Types', icon: 'apps' },
    { key: 'university', label: 'Universities', icon: 'school' },
    { key: 'tvet', label: 'TVET Colleges', icon: 'construct' },
    { key: 'private', label: 'Private', icon: 'business' }
  ];

  const filteredInstitutions = institutions.filter(institution => {
    const matchesSearch = institution.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         institution.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || institution.type === selectedType;
    return matchesSearch && matchesType;
  });

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search institutions..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {institutionTypes.map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[
              styles.filterTab,
              selectedType === type.key && styles.filterTabActive
            ]}
            onPress={() => setSelectedType(type.key)}
          >
            <Ionicons 
              name={type.icon} 
              size={16} 
              color={selectedType === type.key ? 'white' : '#666'} 
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

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredInstitutions.length} institution{filteredInstitutions.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Institutions List */}
      <ScrollView style={styles.institutionsList}>
        {filteredInstitutions.map((institution) => (
          <TouchableOpacity
            key={institution.id}
            style={styles.institutionCard}
            onPress={() => navigation.navigate('InstitutionDetail', { institution })}
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
              <Text style={styles.location}>{institution.location}</Text>
            </View>

            <Text style={styles.description} numberOfLines={2}>
              {institution.description}
            </Text>

            <View style={styles.programsContainer}>
              <Text style={styles.programsLabel}>Programs:</Text>
              <Text style={styles.programs} numberOfLines={1}>
                {institution.programs.slice(0, 3).join(', ')}
                {institution.programs.length > 3 && '...'}
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
                  Due: {new Date(institution.deadline).toLocaleDateString()}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
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
  institutionsList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  institutionCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
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
    color: 'white',
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
    color: 'white',
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
    color: 'rgba(255,255,255,0.7)',
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
    color: 'rgba(255,255,255,0.8)',
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
