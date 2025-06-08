import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

export default function ApplicationsScreen({ navigation }) {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          institutions(name, type, province),
          programs(name, qualification_level)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const applicationsWithDetails = data?.map(app => ({
        ...app,
        institutionName: app.institutions?.name || 'Unknown Institution',
        program: app.programs?.name || 'Unknown Program',
        deadline: app.deadline || new Date(),
        applicationFee: app.application_fee || 0,
        submittedDate: app.submitted_at,
        paymentStatus: app.payment_status || 'pending'
      })) || [];

      setApplications(applicationsWithDetails);
    } catch (error) {
      console.error('Error fetching applications:', error);
      Alert.alert('Error', 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchApplications();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'submitted': return theme.colors.tertiary;
      case 'under_review': return theme.colors.secondary;
      case 'payment_pending': return theme.colors.secondary;
      case 'draft': return theme.colors.onSurfaceVariant;
      case 'accepted': return theme.colors.primary;
      case 'rejected': return theme.colors.error;
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'submitted': return 'Submitted';
      case 'payment_pending': return 'Payment Pending';
      case 'draft': return 'Draft';
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      default: return 'Unknown';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted': return 'checkmark-circle';
      case 'payment_pending': return 'card';
      case 'draft': return 'create';
      case 'accepted': return 'trophy';
      case 'rejected': return 'close-circle';
      default: return 'help-circle';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading applications...</Text>
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
          <Text style={styles.headerTitle}>My Applications</Text>
          <Text style={styles.headerSubtitle}>
            Track your application progress
          </Text>
        </Animatable.View>
      </LinearGradient>
      {/* Header Stats */}
      <Animatable.View animation="fadeInUp" delay={200} style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{applications.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {applications.filter(app => app.status === 'submitted' || app.status === 'under_review').length}
          </Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {applications.filter(app => app.status === 'accepted').length}
          </Text>
          <Text style={styles.statLabel}>Accepted</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {applications.filter(app => app.status === 'draft').length}
          </Text>
          <Text style={styles.statLabel}>Drafts</Text>
        </View>
      </Animatable.View>

      {/* Applications List */}
      <FlatList
        data={applications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item: application, index }) => (
          <Animatable.View
            animation="fadeInUp"
            delay={300 + (index * 100)}
            style={styles.applicationCardContainer}
          >
          <TouchableOpacity
            key={application.id}
            style={styles.applicationCard}
          >
            <View style={styles.applicationHeader}>
              <View style={styles.applicationInfo}>
                <Text style={styles.institutionName}>{application.institutionName}</Text>
                <Text style={styles.program}>{application.program}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) }]}>
                <Ionicons 
                  name={getStatusIcon(application.status)} 
                  size={14} 
                  color="white" 
                />
                <Text style={styles.statusText}>{getStatusLabel(application.status)}</Text>
              </View>
            </View>

            <View style={styles.applicationDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar" size={14} color="#666" />
                <Text style={styles.detailText}>
                  Deadline: {new Date(application.deadline).toLocaleDateString()}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Ionicons name="card" size={14} color="#666" />
                <Text style={styles.detailText}>
                  Fee: R{application.applicationFee}
                </Text>
                <View style={[
                  styles.paymentStatus,
                  { backgroundColor: application.paymentStatus === 'paid' ? '#007A4D' : '#FF6B35' }
                ]}>
                  <Text style={styles.paymentStatusText}>
                    {application.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                  </Text>
                </View>
              </View>

              {application.submittedDate && (
                <View style={styles.detailRow}>
                  <Ionicons name="checkmark" size={14} color="#666" />
                  <Text style={styles.detailText}>
                    Submitted: {new Date(application.submittedDate).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.applicationActions}>
              {application.status === 'draft' && (
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Continue Application</Text>
                </TouchableOpacity>
              )}
              
              {application.status === 'payment_pending' && (
                <TouchableOpacity style={[styles.actionButton, styles.payButton]}>
                  <Text style={styles.actionButtonText}>Complete Payment</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View Details</Text>
                <Ionicons name="chevron-forward" size={16} color="#007A4D" />
              </TouchableOpacity>
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
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.emptyTitle}>No Applications Yet</Text>
            <Text style={styles.emptyText}>
              Start your journey by browsing institutions and submitting your first application.
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('Institutions')}
            >
              <Text style={styles.browseButtonText}>Browse Institutions</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          <Animatable.View animation="fadeInUp" delay={600} style={styles.quickActions}>
            <Text style={styles.sectionTitle}>🚀 Quick Actions</Text>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Institutions')}
            >
              <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
              <View style={styles.quickActionText}>
                <Text style={styles.quickActionTitle}>New Application</Text>
                <Text style={styles.quickActionSubtitle}>Start a new application</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <Ionicons name="document" size={24} color={theme.colors.tertiary} />
              <View style={styles.quickActionText}>
                <Text style={styles.quickActionTitle}>Upload Documents</Text>
                <Text style={styles.quickActionSubtitle}>Add supporting documents</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <Ionicons name="help-circle" size={24} color={theme.colors.secondary} />
              <View style={styles.quickActionText}>
                <Text style={styles.quickActionTitle}>Application Help</Text>
                <Text style={styles.quickActionSubtitle}>Get help with your applications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
          </Animatable.View>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  applicationCardContainer: {
    marginBottom: 16,
  },
  applicationsList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 20,
  },
  applicationCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  applicationInfo: {
    flex: 1,
    marginRight: 10,
  },
  institutionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  program: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  applicationDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 8,
    flex: 1,
  },
  paymentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  paymentStatusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  applicationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#007A4D',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  payButton: {
    backgroundColor: '#FF6B35',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#007A4D',
    fontSize: 13,
    fontWeight: 'bold',
    marginRight: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 15,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  browseButton: {
    backgroundColor: '#007A4D',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  quickActions: {
    marginTop: 20,
    marginBottom: 30,
  },
  quickActionCard: {
    backgroundColor: '#2a2a2a',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  quickActionText: {
    flex: 1,
    marginLeft: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
});
