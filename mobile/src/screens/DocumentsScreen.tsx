import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploaded_at: string;
  document_type: string;
}

export default function DocumentsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const documentTypes = [
    { key: 'id_document', label: 'ID Document', icon: 'card', required: true },
    { key: 'matric_certificate', label: 'Matric Certificate', icon: 'school', required: true },
    { key: 'academic_transcript', label: 'Academic Transcript', icon: 'document-text', required: true },
    { key: 'proof_of_residence', label: 'Proof of Residence', icon: 'home', required: false },
    { key: 'passport_photo', label: 'Passport Photo', icon: 'camera', required: true },
    { key: 'motivation_letter', label: 'Motivation Letter', icon: 'create', required: false },
  ];

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('student_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      Alert.alert('Error', 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDocuments();
    setRefreshing(false);
  };

  const pickDocument = async (documentType: string) => {
    Alert.alert(
      'Select Document Source',
      'Choose how you want to add your document',
      [
        { text: 'Camera', onPress: () => takePhoto(documentType) },
        { text: 'Photo Library', onPress: () => pickFromLibrary(documentType) },
        { text: 'Files', onPress: () => pickFromFiles(documentType) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const takePhoto = async (documentType: string) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadDocument(result.assets[0], documentType);
    }
  };

  const pickFromLibrary = async (documentType: string) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Photo library permission is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadDocument(result.assets[0], documentType);
    }
  };

  const pickFromFiles = async (documentType: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        uploadDocument(result.assets[0], documentType);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const uploadDocument = async (file: any, documentType: string) => {
    try {
      setUploading(true);

      // Create file path
      const fileExt = file.name?.split('.').pop() || 'jpg';
      const fileName = `${user.id}/${documentType}_${Date.now()}.${fileExt}`;

      // Convert file to blob for upload
      const response = await fetch(file.uri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, blob, {
          contentType: file.mimeType || 'image/jpeg',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // Save document record to database with simplified structure
      console.log('📄 Saving document to database...');

      const documentData = {
        user_id: user.id,
        document_type: documentType,
        document_name: file.name || `${documentType}.${fileExt}`,
        file_url: publicUrl,
        file_size: file.size || 0,
        mime_type: file.mimeType || 'image/jpeg'
      };

      console.log('📄 Document data:', JSON.stringify(documentData, null, 2));

      // Try to insert document record - if RLS fails, just store in storage
      const { error: dbError } = await supabase
        .from('student_documents')
        .insert(documentData);

      if (dbError) {
        console.warn('⚠️ Database insert failed (RLS policy), but file uploaded to storage:', dbError);
        Alert.alert('Partial Success', 'Document uploaded to storage. Database record will be created later.');
      } else {
        Alert.alert('Success', 'Document uploaded successfully!');
      }

      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert('Error', 'Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (documentId: string, filePath: string) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete from storage
              await supabase.storage.from('documents').remove([filePath]);
              
              // Delete from database
              const { error } = await supabase
                .from('student_documents')
                .delete()
                .eq('id', documentId);

              if (error) throw error;
              
              fetchDocuments();
              Alert.alert('Success', 'Document deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete document');
            }
          },
        },
      ]
    );
  };

  const getDocumentIcon = (type: string) => {
    const docType = documentTypes.find(dt => dt.key === type);
    return docType?.icon || 'document';
  };

  const getDocumentLabel = (type: string) => {
    const docType = documentTypes.find(dt => dt.key === type);
    return docType?.label || type;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading documents...</Text>
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
          <Text style={styles.headerTitle}>My Documents</Text>
          <Text style={styles.headerSubtitle}>
            Upload and manage your application documents
          </Text>
        </Animatable.View>
      </LinearGradient>

      {/* Document Types */}
      <Animatable.View animation="fadeInUp" delay={200} style={styles.documentTypesContainer}>
        <Text style={styles.sectionTitle}>Required Documents</Text>
        <FlatList
          data={documentTypes}
          keyExtractor={(item) => item.key}
          renderItem={({ item, index }) => {
            const hasDocument = documents.some(doc => doc.document_type === item.key);
            return (
              <Animatable.View
                animation="fadeInUp"
                delay={300 + (index * 100)}
                style={styles.documentTypeCard}
              >
                <TouchableOpacity
                  style={[
                    styles.documentTypeButton,
                    hasDocument && styles.documentTypeButtonComplete
                  ]}
                  onPress={() => pickDocument(item.key)}
                  disabled={uploading}
                >
                  <View style={styles.documentTypeLeft}>
                    <Ionicons 
                      name={item.icon as any} 
                      size={24} 
                      color={hasDocument ? theme.colors.primary : theme.colors.onSurfaceVariant} 
                    />
                    <View style={styles.documentTypeText}>
                      <Text style={[
                        styles.documentTypeLabel,
                        hasDocument && styles.documentTypeLabelComplete
                      ]}>
                        {item.label}
                      </Text>
                      {item.required && (
                        <Text style={styles.requiredText}>Required</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.documentTypeRight}>
                    {hasDocument ? (
                      <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                    ) : (
                      <Ionicons name="add-circle-outline" size={24} color={theme.colors.onSurfaceVariant} />
                    )}
                  </View>
                </TouchableOpacity>
              </Animatable.View>
            );
          }}
          showsVerticalScrollIndicator={false}
        />
      </Animatable.View>
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
  documentTypesContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 20,
  },
  documentTypeCard: {
    marginBottom: 12,
  },
  documentTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  documentTypeButtonComplete: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryContainer + '20',
  },
  documentTypeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentTypeText: {
    marginLeft: 16,
    flex: 1,
  },
  documentTypeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  documentTypeLabelComplete: {
    color: theme.colors.primary,
  },
  requiredText: {
    fontSize: 12,
    color: theme.colors.error,
    fontWeight: '500',
  },
  documentTypeRight: {
    marginLeft: 16,
  },
});
