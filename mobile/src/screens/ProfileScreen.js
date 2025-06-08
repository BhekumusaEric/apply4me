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
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

export default function ProfileScreen({ navigation }) {
  const { user: authUser, signOut } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (authUser) {
      fetchUserProfile();
      fetchUserApplications();
    }
  }, [authUser]);

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

        setUserProfile({
          full_name: personalInfo.full_name || `${data.first_name || ''} ${data.last_name || ''}`.trim() || authUser.email?.split('@')[0] || 'Student',
          email: data.email || authUser.email,
          phone: data.phone || contactInfo.phone || '+27693434126',
          id_number: data.id_number || '',
          address: personalInfo.address || '',
          grade12_year: academicHistory.grade12_year || '',
          subjects: academicHistory.subjects || [],
          average_percentage: academicHistory.average_percentage || 0
        });
      } else {
        setUserProfile({
          full_name: authUser.email?.split('@')[0] || 'Student',
          email: authUser.email,
          phone: '+27693434126',
          id_number: '',
          address: '',
          grade12_year: '',
          subjects: [],
          average_percentage: 0
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchUserApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', authUser.id);

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUserProfile(), fetchUserApplications()]);
    setRefreshing(false);
  };

  const profileSections = userProfile ? [
    {
      title: 'Personal Information',
      icon: 'person',
      items: [
        { label: 'Full Name', value: userProfile.full_name || 'Not provided', icon: 'person-outline' },
        { label: 'Email Address', value: userProfile.email || authUser.email, icon: 'mail-outline' },
        { label: 'Phone Number', value: userProfile.phone || 'Not provided', icon: 'call-outline' },
        { label: 'ID Number', value: userProfile.id_number || 'Not provided', icon: 'card-outline' },
        { label: 'Address', value: userProfile.address || 'Not provided', icon: 'location-outline' }
      ]
    },
    {
      title: 'Academic Information',
      icon: 'school',
      items: [
        { label: 'Grade 12 Year', value: userProfile.grade12_year || 'Not provided', icon: 'calendar-outline' },
        { label: 'Average Percentage', value: userProfile.average_percentage ? `${userProfile.average_percentage}%` : 'Not provided', icon: 'trophy-outline' },
        { label: 'Subjects', value: userProfile.subjects?.length ? userProfile.subjects.join(', ') : 'Not provided', icon: 'book-outline' }
      ]
    }
  ] : [];

  const settingsOptions = [
    {
      title: 'Account Settings',
      options: [
        { label: 'Edit Profile', icon: 'create-outline', action: () => navigation.navigate('EditProfile') },
        { label: 'Change Password', icon: 'lock-closed-outline', action: () => Alert.alert('Coming Soon', 'Password change will be available soon!') },
        { label: 'Notification Settings', icon: 'notifications-outline', action: () => Alert.alert('Coming Soon', 'Notification settings will be available soon!') }
      ]
    },
    {
      title: 'Application Settings',
      options: [
        { label: 'Document Templates', icon: 'document-outline', action: () => Alert.alert('Coming Soon', 'Document templates will be available soon!') },
        { label: 'Payment Methods', icon: 'card-outline', action: () => Alert.alert('Coming Soon', 'Payment methods will be available soon!') },
        { label: 'Application History', icon: 'time-outline', action: () => navigation.navigate('Applications') }
      ]
    },
    {
      title: 'Support & Help',
      options: [
        { label: 'Help Center', icon: 'help-circle-outline', action: () => Alert.alert('Help Center', 'Visit our website for comprehensive help guides.') },
        { label: 'Contact Support', icon: 'call-outline', action: () => Alert.alert('Contact Support', 'Call us at +27 69 343 4126 or email apply4me2025@outlook.com') },
        { label: 'About Apply4Me', icon: 'information-circle-outline', action: () => Alert.alert('About Apply4Me', 'Apply4Me v1.0.0\nEmpowering South African students to access higher education opportunities.') }
      ]
    }
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
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

  const userName = userProfile?.full_name || authUser?.email?.split('@')[0] || 'Student';
  const userEmail = userProfile?.email || authUser?.email || '';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryContainer]}
          style={styles.profileHeader}
        >
          <Animatable.View animation="fadeInDown" style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{userInitials}</Text>
              </View>
            </View>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userEmail}>{userEmail}</Text>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{applications.length}</Text>
                <Text style={styles.statLabel}>Applications</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {applications.filter(app => app.status === 'submitted' || app.status === 'under_review').length}
                </Text>
                <Text style={styles.statLabel}>In Progress</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {userProfile?.average_percentage ? `${userProfile.average_percentage}%` : 'N/A'}
                </Text>
                <Text style={styles.statLabel}>Grade 12 Avg</Text>
              </View>
            </View>
          </Animatable.View>
        </LinearGradient>

        {/* Profile Information */}
        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name={section.icon} size={20} color="#007A4D" />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            
            {section.items.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.infoItem}>
                <Ionicons name={item.icon} size={18} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}

        {/* Settings Options */}
        {settingsOptions.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{group.title}</Text>
            
            {group.options.map((option, optionIndex) => (
              <TouchableOpacity
                key={optionIndex}
                style={styles.settingItem}
                onPress={option.action}
              >
                <Ionicons name={option.icon} size={20} color="#666" />
                <Text style={styles.settingLabel}>{option.label}</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Apply4Me Mobile v1.0.0</Text>
          <Text style={styles.versionSubtext}>Built with ❤️ for South African students</Text>
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
  profileHeader: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007A4D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007A4D',
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
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
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  settingLabel: {
    flex: 1,
    fontSize: 14,
    color: 'white',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(255,68,68,0.1)',
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  logoutText: {
    fontSize: 14,
    color: '#FF4444',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  versionSubtext: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
  },
});
