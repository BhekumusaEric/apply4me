import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function InstitutionDetailScreen({ route, navigation }) {
  const { institution } = route.params || {};

  // Fallback data if no institution is passed
  const institutionData = institution || {
    id: 1,
    name: 'University of Cape Town',
    type: 'university',
    location: 'Cape Town, Western Cape',
    description: '🤖 Auto-discovered: Leading research university in Africa with world-class facilities',
    programs: ['Medicine', 'Engineering', 'Business', 'Law', 'Science'],
    applicationFee: 200,
    deadline: '2024-09-30',
    rating: 4.8,
    website: 'https://www.uct.ac.za',
    phone: '+27 21 650 9111',
    email: 'admissions@uct.ac.za'
  };

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

  const handleApply = () => {
    Alert.alert(
      'Apply to Institution',
      `Start your application to ${institutionData.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Application', 
          onPress: () => navigation.navigate('Apply', { institution: institutionData })
        }
      ]
    );
  };

  const handleContact = (method) => {
    switch (method) {
      case 'phone':
        Alert.alert('Call Institution', `Call ${institutionData.phone}?`);
        break;
      case 'email':
        Alert.alert('Email Institution', `Email ${institutionData.email}?`);
        break;
      case 'website':
        Alert.alert('Visit Website', `Open ${institutionData.website}?`);
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Institution Header */}
        <View style={styles.header}>
          <View style={styles.institutionInfo}>
            <Text style={styles.institutionName}>{institutionData.name}</Text>
            <View style={styles.institutionMeta}>
              <View style={[styles.typeTag, { backgroundColor: getTypeColor(institutionData.type) }]}>
                <Text style={styles.typeTagText}>{getTypeLabel(institutionData.type)}</Text>
              </View>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.rating}>{institutionData.rating}</Text>
              </View>
            </View>
            
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={16} color="#666" />
              <Text style={styles.location}>{institutionData.location}</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="school" size={24} color="#007A4D" />
            <Text style={styles.statValue}>{institutionData.programs.length}</Text>
            <Text style={styles.statLabel}>Programs</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="card" size={24} color="#FF6B35" />
            <Text style={styles.statValue}>R{institutionData.applicationFee}</Text>
            <Text style={styles.statLabel}>App Fee</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={24} color="#4ECDC4" />
            <Text style={styles.statValue}>
              {Math.ceil((new Date(institutionData.deadline) - new Date()) / (1000 * 60 * 60 * 24))}
            </Text>
            <Text style={styles.statLabel}>Days Left</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 About</Text>
          <Text style={styles.description}>{institutionData.description}</Text>
        </View>

        {/* Programs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎓 Available Programs</Text>
          <View style={styles.programsGrid}>
            {institutionData.programs.map((program, index) => (
              <View key={index} style={styles.programCard}>
                <Text style={styles.programName}>{program}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Application Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Application Information</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color="#FF6B35" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Application Deadline</Text>
              <Text style={styles.infoValue}>
                {new Date(institutionData.deadline).toLocaleDateString('en-ZA', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="card" size={20} color="#007A4D" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Application Fee</Text>
              <Text style={styles.infoValue}>R{institutionData.applicationFee}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color="#4ECDC4" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Processing Time</Text>
              <Text style={styles.infoValue}>2-4 weeks after deadline</Text>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 Contact Information</Text>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleContact('phone')}
          >
            <Ionicons name="call" size={20} color="#007A4D" />
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactValue}>{institutionData.phone}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleContact('email')}
          >
            <Ionicons name="mail" size={20} color="#007A4D" />
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>{institutionData.email}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleContact('website')}
          >
            <Ionicons name="globe" size={20} color="#007A4D" />
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Website</Text>
              <Text style={styles.contactValue}>{institutionData.website}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Ionicons name="document-text" size={20} color="white" />
            <Text style={styles.applyButtonText}>Start Application</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={20} color="#007A4D" />
            <Text style={styles.favoriteButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#2a2a2a',
    padding: 20,
  },
  institutionInfo: {
    marginBottom: 15,
  },
  institutionName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  institutionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
    marginRight: 12,
  },
  typeTagText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: 'white',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#2a2a2a',
    paddingVertical: 20,
    marginBottom: 15,
  },
  statCard: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#2a2a2a',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  programsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  programCard: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007A4D',
  },
  programName: {
    fontSize: 12,
    color: '#007A4D',
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  contactContent: {
    flex: 1,
    marginLeft: 12,
  },
  contactLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: 'white',
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 20,
    gap: 12,
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#007A4D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  favoriteButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007A4D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  favoriteButtonText: {
    color: '#007A4D',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
});
