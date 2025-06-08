import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryContainer]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Logo Animation */}
          <Animatable.View
            animation="bounceIn"
            duration={1500}
            style={styles.logoContainer}
          >
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🎓</Text>
            </View>
          </Animatable.View>

          {/* App Name */}
          <Animatable.Text
            animation="fadeInUp"
            delay={800}
            duration={1000}
            style={styles.appName}
          >
            Apply4Me
          </Animatable.Text>

          {/* Tagline */}
          <Animatable.Text
            animation="fadeInUp"
            delay={1200}
            duration={1000}
            style={styles.tagline}
          >
            Your Gateway to Higher Education
          </Animatable.Text>

          {/* Loading Indicator */}
          <Animatable.View
            animation="pulse"
            iterationCount="infinite"
            delay={1500}
            style={styles.loadingContainer}
          >
            <View style={styles.loadingDot} />
            <View style={[styles.loadingDot, { marginLeft: 8 }]} />
            <View style={[styles.loadingDot, { marginLeft: 8 }]} />
          </Animatable.View>

          {/* Version and Copyright */}
          <Animatable.View
            animation="fadeIn"
            delay={2000}
            duration={1000}
            style={styles.footerContainer}
          >
            <Text style={styles.version}>v1.0.0</Text>
            <Text style={styles.footer}>Empowering South African Students</Text>
            <Text style={styles.copyright}>© 2024 eric_tech. All rights reserved.</Text>
          </Animatable.View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoEmoji: {
    fontSize: 60,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 60,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 80,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 30,
    alignItems: 'center',
    width: '100%',
  },
  version: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginBottom: 4,
  },
  footer: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 4,
  },
  copyright: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});