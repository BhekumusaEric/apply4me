import React, { useState } from 'react';
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

export default function ApplyScreen({ route, navigation }) {
  const { institution } = route.params || {};
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const institutionData = institution || {
    name: 'University of Cape Town',
    applicationFee: 200
  };

  const steps = [
    { number: 1, title: 'Personal Info', icon: 'person' },
    { number: 2, title: 'Academic Records', icon: 'school' },
    { number: 3, title: 'Documents', icon: 'document' },
    { number: 4, title: 'Review & Submit', icon: 'checkmark-circle' }
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    Alert.alert(
      'Submit Application',
      `Submit your application to ${institutionData.name}? You will be redirected to payment.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Submit & Pay', 
          onPress: () => {
            Alert.alert('Success!', 'Application submitted successfully! Redirecting to payment...');
            navigation.goBack();
          }
        }
      ]
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>📝 Personal Information</Text>
            <Text style={styles.stepDescription}>
              We'll use your profile information for this application.
            </Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="person" size={20} color="#007A4D" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Full Name</Text>
                  <Text style={styles.infoValue}>Thabo Mthembu</Text>
                </View>
                <TouchableOpacity>
                  <Ionicons name="create" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="mail" size={20} color="#007A4D" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email Address</Text>
                  <Text style={styles.infoValue}>thabo.mthembu@email.com</Text>
                </View>
                <TouchableOpacity>
                  <Ionicons name="create" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="call" size={20} color="#007A4D" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone Number</Text>
                  <Text style={styles.infoValue}>+27 82 123 4567</Text>
                </View>
                <TouchableOpacity>
                  <Ionicons name="create" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="card" size={20} color="#007A4D" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>ID Number</Text>
                  <Text style={styles.infoValue}>0012345678901</Text>
                </View>
                <TouchableOpacity>
                  <Ionicons name="create" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>🎓 Academic Records</Text>
            <Text style={styles.stepDescription}>
              Your academic information from your profile.
            </Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="calendar" size={20} color="#007A4D" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Grade 12 Year</Text>
                  <Text style={styles.infoValue}>2023</Text>
                </View>
                <TouchableOpacity>
                  <Ionicons name="create" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="trophy" size={20} color="#007A4D" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Average Percentage</Text>
                  <Text style={styles.infoValue}>78%</Text>
                </View>
                <TouchableOpacity>
                  <Ionicons name="create" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="book" size={20} color="#007A4D" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Subjects</Text>
                  <Text style={styles.infoValue}>Mathematics, Physical Science, English, Life Sciences</Text>
                </View>
                <TouchableOpacity>
                  <Ionicons name="create" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>📄 Required Documents</Text>
            <Text style={styles.stepDescription}>
              Upload or take photos of your required documents.
            </Text>
            
            <View style={styles.documentsContainer}>
              <TouchableOpacity style={styles.documentItem}>
                <Ionicons name="document-text" size={24} color="#007A4D" />
                <View style={styles.documentContent}>
                  <Text style={styles.documentTitle}>Grade 12 Certificate</Text>
                  <Text style={styles.documentStatus}>Required</Text>
                </View>
                <View style={styles.documentActions}>
                  <TouchableOpacity style={styles.uploadButton}>
                    <Ionicons name="camera" size={16} color="white" />
                    <Text style={styles.uploadButtonText}>Take Photo</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.documentItem}>
                <Ionicons name="card" size={24} color="#007A4D" />
                <View style={styles.documentContent}>
                  <Text style={styles.documentTitle}>ID Document</Text>
                  <Text style={styles.documentStatus}>Required</Text>
                </View>
                <View style={styles.documentActions}>
                  <TouchableOpacity style={styles.uploadButton}>
                    <Ionicons name="camera" size={16} color="white" />
                    <Text style={styles.uploadButtonText}>Take Photo</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.documentItem}>
                <Ionicons name="document" size={24} color="#666" />
                <View style={styles.documentContent}>
                  <Text style={styles.documentTitle}>Proof of Address</Text>
                  <Text style={styles.documentStatus}>Optional</Text>
                </View>
                <View style={styles.documentActions}>
                  <TouchableOpacity style={[styles.uploadButton, styles.uploadButtonSecondary]}>
                    <Ionicons name="camera" size={16} color="#007A4D" />
                    <Text style={[styles.uploadButtonText, styles.uploadButtonTextSecondary]}>Take Photo</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        );
      
      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>✅ Review & Submit</Text>
            <Text style={styles.stepDescription}>
              Review your application before submitting.
            </Text>
            
            <View style={styles.reviewCard}>
              <Text style={styles.reviewTitle}>Application Summary</Text>
              
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Institution:</Text>
                <Text style={styles.reviewValue}>{institutionData.name}</Text>
              </View>
              
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Applicant:</Text>
                <Text style={styles.reviewValue}>Thabo Mthembu</Text>
              </View>
              
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Application Fee:</Text>
                <Text style={styles.reviewValue}>R{institutionData.applicationFee}</Text>
              </View>
              
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Documents:</Text>
                <Text style={styles.reviewValue}>2 uploaded</Text>
              </View>
            </View>
            
            <View style={styles.warningCard}>
              <Ionicons name="warning" size={20} color="#FF6B35" />
              <Text style={styles.warningText}>
                Once submitted, you cannot edit this application. Please review all information carefully.
              </Text>
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Header */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressTitle}>Apply to {institutionData.name}</Text>
        <View style={styles.stepsContainer}>
          {steps.map((step) => (
            <View key={step.number} style={styles.stepIndicator}>
              <View style={[
                styles.stepCircle,
                currentStep >= step.number && styles.stepCircleActive,
                currentStep === step.number && styles.stepCircleCurrent
              ]}>
                <Ionicons 
                  name={currentStep > step.number ? 'checkmark' : step.icon} 
                  size={16} 
                  color={currentStep >= step.number ? 'white' : '#666'} 
                />
              </View>
              <Text style={[
                styles.stepLabel,
                currentStep >= step.number && styles.stepLabelActive
              ]}>
                {step.title}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Step Content */}
      <ScrollView style={styles.contentContainer}>
        {renderStepContent()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={[styles.navButton, styles.prevButton, currentStep === 1 && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={currentStep === 1}
        >
          <Ionicons name="chevron-back" size={20} color={currentStep === 1 ? '#666' : '#007A4D'} />
          <Text style={[styles.navButtonText, currentStep === 1 && styles.navButtonTextDisabled]}>
            Previous
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentStep === totalSteps ? 'Submit Application' : 'Next'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  progressContainer: {
    backgroundColor: '#2a2a2a',
    padding: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepIndicator: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepCircleActive: {
    backgroundColor: '#007A4D',
  },
  stepCircleCurrent: {
    backgroundColor: '#007A4D',
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  stepLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  stepLabelActive: {
    color: 'white',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
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
  },
  documentsContainer: {
    gap: 12,
  },
  documentItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentContent: {
    flex: 1,
    marginLeft: 12,
  },
  documentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  documentStatus: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  documentActions: {
    marginLeft: 12,
  },
  uploadButton: {
    backgroundColor: '#007A4D',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  uploadButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007A4D',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  uploadButtonTextSecondary: {
    color: '#007A4D',
  },
  reviewCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  reviewLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  reviewValue: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  warningCard: {
    backgroundColor: 'rgba(255,107,53,0.1)',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningText: {
    fontSize: 13,
    color: '#FF6B35',
    marginLeft: 10,
    flex: 1,
  },
  navigationContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#007A4D',
  },
  prevButton: {
    backgroundColor: 'transparent',
  },
  navButtonDisabled: {
    borderColor: '#666',
  },
  navButtonText: {
    color: '#007A4D',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  navButtonTextDisabled: {
    color: '#666',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#007A4D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 25,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
  },
});
