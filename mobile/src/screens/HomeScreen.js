import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Dimensions,
  Alert,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Application Update',
      message: 'Your application to University of Cape Town has been received',
      time: '2 hours ago',
      read: false,
      type: 'application'
    },
    {
      id: 2,
      title: 'New Bursary Available',
      message: 'MTN Foundation Bursary applications now open',
      time: '1 day ago',
      read: false,
      type: 'bursary'
    },
    {
      id: 3,
      title: 'Document Required',
      message: 'Please upload your matric certificate',
      time: '3 days ago',
      read: true,
      type: 'document'
    }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    setGreetingMessage();
  }, []);

  const setGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 17) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh and update greeting
    setGreetingMessage();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Choose how you would like to contact us:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Call +27693434126',
          onPress: () => {
            // In a real app, this would open the phone dialer
            Alert.alert('Call Support', 'Calling +27693434126...');
          },
        },
        {
          text: 'WhatsApp',
          onPress: () => {
            // In a real app, this would open WhatsApp
            Alert.alert('WhatsApp Support', 'Opening WhatsApp to +27693434126...');
          },
        },
      ]
    );
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const quickActions = [
    {
      id: 1,
      title: 'Browse Institutions',
      subtitle: 'Find your perfect university',
      icon: 'school',
      gradient: [theme.colors.primary, theme.colors.primaryContainer],
      onPress: () => navigation.navigate('Institutions')
    },
    {
      id: 2,
      title: 'Find Bursaries',
      subtitle: 'Discover funding opportunities',
      icon: 'wallet',
      gradient: [theme.colors.secondary, theme.colors.secondaryContainer],
      onPress: () => navigation.navigate('Bursaries')
    },
    {
      id: 3,
      title: 'My Applications',
      subtitle: 'Track your progress',
      icon: 'document-text',
      gradient: [theme.colors.tertiary, '#64B5F6'],
      onPress: () => navigation.navigate('Applications')
    },
    {
      id: 4,
      title: 'Profile Settings',
      subtitle: 'Manage your information',
      icon: 'person',
      gradient: ['#9C27B0', '#BA68C8'],
      onPress: () => navigation.navigate('Profile')
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

      {/* Top Navigation Bar */}
      <View style={styles.topNavBar}>
        <View style={styles.navLeft}>
          <Text style={styles.appTitle}>Apply4Me</Text>
        </View>
        <View style={styles.navRight}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setShowNotifications(!showNotifications)}
          >
            <Ionicons name="notifications" size={24} color="white" />
            {unreadNotifications > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>{unreadNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications Panel */}
      {showNotifications && (
        <Animatable.View animation="slideInDown" style={styles.notificationsPanel}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle}>Notifications</Text>
            <TouchableOpacity onPress={() => setShowNotifications(false)}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.notificationsList}>
            {notifications.map((notification) => (
              <TouchableOpacity key={notification.id} style={styles.notificationItem}>
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text style={[styles.notificationItemTitle, !notification.read && styles.unreadTitle]}>
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationTime}>{notification.time}</Text>
                  </View>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  {!notification.read && <View style={styles.unreadDot} />}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animatable.View>
      )}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryContainer]}
          style={styles.headerGradient}
        >
          <Animatable.View animation="fadeInDown" style={styles.headerContent}>
            <Text style={styles.greetingText}>{greeting}!</Text>
            <Text style={styles.userNameText}>
              {user?.email?.split('@')[0] || 'Student'}
            </Text>
            <Text style={styles.headerSubtitle}>
              Ready to explore your future? 🚀
            </Text>
          </Animatable.View>
        </LinearGradient>

        {/* Quick Actions */}
        <Animatable.View animation="fadeInUp" delay={300} style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <Animatable.View
                key={action.id}
                animation="fadeInUp"
                delay={400 + (index * 100)}
              >
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={action.onPress}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={action.gradient}
                    style={styles.actionGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.actionContent}>
                      <Ionicons name={action.icon} size={32} color="white" />
                      <View style={styles.actionTextContainer}>
                        <Text style={styles.actionTitle}>{action.title}</Text>
                        <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </View>
        </Animatable.View>

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
              <Text style={styles.helpSubtitle}>Step-by-step application guide</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.helpCard} onPress={handleContactSupport}>
            <Ionicons name="call" size={24} color="#007A4D" />
            <View style={styles.helpText}>
              <Text style={styles.helpTitle}>Contact Support</Text>
              <Text style={styles.helpSubtitle}>+27693434126 (Phone/WhatsApp)</Text>
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
  topNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  navLeft: {
    flex: 1,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  navButton: {
    marginLeft: 15,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notificationsPanel: {
    backgroundColor: '#2a2a2a',
    maxHeight: 300,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  notificationsList: {
    maxHeight: 200,
  },
  notificationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  notificationContent: {
    position: 'relative',
  },
  notificationItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  unreadTitle: {
    color: theme.colors.primary,
  },
  notificationMessage: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  userNameText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  actionsContainer: {
    marginBottom: 30,
  },
  actionsGrid: {
    paddingHorizontal: 20,
  },
  actionCard: {
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  actionGradient: {
    borderRadius: 16,
    padding: 20,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
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
