import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const quickActions = [
    {
      id: 1,
      title: 'Browse Institutions',
      subtitle: '150+ Universities & Colleges',
      icon: 'school',
      color: '#007A4D',
      onPress: () => navigation.navigate('Institutions')
    },
    {
      id: 2,
      title: 'Find Bursaries',
      subtitle: '75+ Funding Opportunities',
      icon: 'cash',
      color: '#FF6B35',
      onPress: () => navigation.navigate('Bursaries')
    },
    {
      id: 3,
      title: 'My Applications',
      subtitle: 'Track Your Progress',
      icon: 'document-text',
      color: '#4ECDC4',
      onPress: () => navigation.navigate('Applications')
    },
    {
      id: 4,
      title: 'Profile Settings',
      subtitle: 'Manage Your Info',
      icon: 'person',
      color: '#45B7D1',
      onPress: () => navigation.navigate('Profile')
    }
  ];

  const stats = [
    { label: 'Institutions', value: '150+', icon: 'school' },
    { label: 'Bursaries', value: '75+', icon: 'cash' },
    { label: 'Students Helped', value: '2,847', icon: 'people' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to Apply4Me! 🇿🇦</Text>
          <Text style={styles.welcomeSubtitle}>
            Your gateway to South African higher education
          </Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>📊 Platform Statistics</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Ionicons name={stat.icon} size={24} color="#007A4D" />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>🚀 Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionCard, { borderLeftColor: action.color }]}
                onPress={action.onPress}
              >
                <View style={styles.actionHeader}>
                  <Ionicons name={action.icon} size={28} color={action.color} />
                  <Text style={styles.actionTitle}>{action.title}</Text>
                </View>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Updates */}
        <View style={styles.updatesContainer}>
          <Text style={styles.sectionTitle}>📢 Recent Updates</Text>
          <View style={styles.updateCard}>
            <View style={styles.updateHeader}>
              <Ionicons name="megaphone" size={20} color="#007A4D" />
              <Text style={styles.updateTitle}>🤖 Automation Active!</Text>
            </View>
            <Text style={styles.updateText}>
              Our system discovered 5 new institutions and 12 new bursaries today!
            </Text>
            <Text style={styles.updateTime}>Just now</Text>
          </View>
          
          <View style={styles.updateCard}>
            <View style={styles.updateHeader}>
              <Ionicons name="card" size={20} color="#FF6B35" />
              <Text style={styles.updateTitle}>💳 Payment System Live</Text>
            </View>
            <Text style={styles.updateText}>
              EFT, Capitec Pay, and mobile payments now available for applications.
            </Text>
            <Text style={styles.updateTime}>2 hours ago</Text>
          </View>
        </View>

        {/* Help Section */}
        <View style={styles.helpContainer}>
          <Text style={styles.sectionTitle}>❓ Need Help?</Text>
          <TouchableOpacity style={styles.helpCard}>
            <Ionicons name="help-circle" size={24} color="#007A4D" />
            <View style={styles.helpText}>
              <Text style={styles.helpTitle}>How to Apply</Text>
              <Text style={styles.helpSubtitle}>Step-by-step guide</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.helpCard}>
            <Ionicons name="call" size={24} color="#007A4D" />
            <View style={styles.helpText}>
              <Text style={styles.helpTitle}>Contact Support</Text>
              <Text style={styles.helpSubtitle}>+27 69 343 4126</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
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
  welcomeSection: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  statsContainer: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 12,
    minWidth: 80,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007A4D',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
    textAlign: 'center',
  },
  actionsContainer: {
    marginBottom: 30,
  },
  actionsGrid: {
    paddingHorizontal: 20,
  },
  actionCard: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
  actionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginLeft: 40,
    flex: 1,
  },
  updatesContainer: {
    marginBottom: 30,
  },
  updateCard: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  updateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  updateTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  updateText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
    marginBottom: 8,
  },
  updateTime: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  helpContainer: {
    marginBottom: 30,
  },
  helpCard: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpText: {
    flex: 1,
    marginLeft: 12,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  helpSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
});
