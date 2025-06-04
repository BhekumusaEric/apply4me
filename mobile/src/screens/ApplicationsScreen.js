import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ApplicationsScreen({ navigation }) {
  // No mock data - fetch from API
  const [applications, setApplications] = useState([])

  useEffect(() => {
    // Fetch applications from API
    // TODO: Implement API call to fetch real applications
    setApplications([])
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return '#007A4D';
      case 'payment_pending': return '#FF6B35';
      case 'draft': return '#666';
      case 'accepted': return '#4ECDC4';
      case 'rejected': return '#FF4444';
      default: return '#666';
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{applications.length}</Text>
          <Text style={styles.statLabel}>Total Applications</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {applications.filter(app => app.status === 'submitted').length}
          </Text>
          <Text style={styles.statLabel}>Submitted</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {applications.filter(app => app.status === 'payment_pending').length}
          </Text>
          <Text style={styles.statLabel}>Pending Payment</Text>
        </View>
      </View>

      {/* Applications List */}
      <ScrollView style={styles.applicationsList}>
        <Text style={styles.sectionTitle}>📝 My Applications</Text>
        
        {applications.map((application) => (
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
        ))}

        {/* Empty State */}
        {applications.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#666" />
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
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>🚀 Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('Institutions')}
          >
            <Ionicons name="add-circle" size={24} color="#007A4D" />
            <View style={styles.quickActionText}>
              <Text style={styles.quickActionTitle}>New Application</Text>
              <Text style={styles.quickActionSubtitle}>Start a new application</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard}>
            <Ionicons name="document" size={24} color="#4ECDC4" />
            <View style={styles.quickActionText}>
              <Text style={styles.quickActionTitle}>Upload Documents</Text>
              <Text style={styles.quickActionSubtitle}>Add supporting documents</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard}>
            <Ionicons name="help-circle" size={24} color="#FF6B35" />
            <View style={styles.quickActionText}>
              <Text style={styles.quickActionTitle}>Application Help</Text>
              <Text style={styles.quickActionSubtitle}>Get help with your applications</Text>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#2a2a2a',
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007A4D',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
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
