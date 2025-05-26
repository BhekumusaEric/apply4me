import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>🎓 Apply4Me</Text>
        <Text style={styles.subtitle}>Mobile App</Text>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to Apply4Me Mobile! 🚀</Text>
          <Text style={styles.welcomeText}>
            Your gateway to South African higher education opportunities, now on mobile.
          </Text>
        </View>

        {/* Feature Cards */}
        <View style={styles.featuresGrid}>
          <TouchableOpacity style={styles.featureCard}>
            <Text style={styles.featureIcon}>🏫</Text>
            <Text style={styles.featureTitle}>Institutions</Text>
            <Text style={styles.featureText}>Browse universities, colleges & TVET</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard}>
            <Text style={styles.featureIcon}>💰</Text>
            <Text style={styles.featureTitle}>Bursaries</Text>
            <Text style={styles.featureText}>Find funding opportunities</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard}>
            <Text style={styles.featureIcon}>📝</Text>
            <Text style={styles.featureTitle}>Applications</Text>
            <Text style={styles.featureText}>Submit & track applications</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard}>
            <Text style={styles.featureIcon}>👤</Text>
            <Text style={styles.featureTitle}>Profile</Text>
            <Text style={styles.featureText}>Manage your information</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>🇿🇦 Empowering SA Students</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>150+</Text>
              <Text style={styles.statLabel}>Institutions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>75+</Text>
              <Text style={styles.statLabel}>Bursaries</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>2,847</Text>
              <Text style={styles.statLabel}>Students Helped</Text>
            </View>
          </View>
        </View>

        {/* Coming Soon */}
        <View style={styles.comingSoonSection}>
          <Text style={styles.comingSoonTitle}>📱 Mobile Features Coming Soon:</Text>
          <Text style={styles.comingSoonItem}>📷 Document Camera</Text>
          <Text style={styles.comingSoonItem}>🔔 Push Notifications</Text>
          <Text style={styles.comingSoonItem}>🔒 Biometric Login</Text>
          <Text style={styles.comingSoonItem}>📴 Offline Mode</Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Built with ❤️ for South African students</Text>
        <Text style={styles.footerLink}>apply4me-eta.vercel.app</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    backgroundColor: '#007A4D',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeSection: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  featureText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  statsSection: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007A4D',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  comingSoonSection: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  comingSoonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  comingSoonItem: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },
  footer: {
    backgroundColor: '#2a2a2a',
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 5,
  },
  footerLink: {
    fontSize: 12,
    color: '#007A4D',
  },
});
