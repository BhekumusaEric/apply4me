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

export default function ProfileScreen({ navigation }) {
  const user = {
    name: 'Thabo Mthembu',
    email: 'thabo.mthembu@email.com',
    phone: '+27 69 343 4126',
    idNumber: '0012345678901',
    address: 'Johannesburg, Gauteng',
    grade12Year: '2023',
    subjects: ['Mathematics', 'Physical Science', 'English', 'Life Sciences'],
    averagePercentage: 78
  };

  const profileSections = [
    {
      title: 'Personal Information',
      icon: 'person',
      items: [
        { label: 'Full Name', value: user.name, icon: 'person-outline' },
        { label: 'Email Address', value: user.email, icon: 'mail-outline' },
        { label: 'Phone Number', value: user.phone, icon: 'call-outline' },
        { label: 'ID Number', value: user.idNumber, icon: 'card-outline' },
        { label: 'Address', value: user.address, icon: 'location-outline' }
      ]
    },
    {
      title: 'Academic Information',
      icon: 'school',
      items: [
        { label: 'Grade 12 Year', value: user.grade12Year, icon: 'calendar-outline' },
        { label: 'Average Percentage', value: `${user.averagePercentage}%`, icon: 'trophy-outline' },
        { label: 'Subjects', value: user.subjects.join(', '), icon: 'book-outline' }
      ]
    }
  ];

  const settingsOptions = [
    {
      title: 'Account Settings',
      options: [
        { label: 'Edit Profile', icon: 'create-outline', action: () => Alert.alert('Coming Soon', 'Profile editing will be available soon!') },
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
        { text: 'Logout', style: 'destructive', onPress: () => Alert.alert('Logged Out', 'You have been logged out successfully.') }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Applications</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>1</Text>
              <Text style={styles.statLabel}>Submitted</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>78%</Text>
              <Text style={styles.statLabel}>Grade 12 Avg</Text>
            </View>
          </View>
        </View>

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
