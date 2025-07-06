import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

export default function SplashScreen({ onAnimationComplete }: SplashScreenProps) {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(50)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const sloganSlide = useRef(new Animated.Value(30)).current;
  const sloganOpacity = useRef(new Animated.Value(0)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;
  
  const [currentDot, setCurrentDot] = useState(0);

  useEffect(() => {
    startAnimation();
  }, []);

  const startAnimation = () => {
    // Logo animation
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Title animation (delayed)
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(titleSlide, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, 300);

    // Slogan animation (more delayed)
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(sloganSlide, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(sloganOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, 600);

    // Loading dots animation
    setTimeout(() => {
      Animated.timing(dotsOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
      
      // Start dot animation cycle
      startDotAnimation();
    }, 1000);

    // Complete splash after total time
    setTimeout(() => {
      onAnimationComplete();
    }, 3000);
  };

  const startDotAnimation = () => {
    const animateDots = () => {
      setCurrentDot((prev) => (prev + 1) % 3);
      setTimeout(animateDots, 500);
    };
    animateDots();
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#2C5282" />
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Logo Animation */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [{ scale: logoScale }],
                opacity: logoOpacity,
              },
            ]}
          >
            <View style={styles.logoBackground}>
              <MaterialIcons name="account-balance-wallet" size={60} color="#FFFFFF" />
            </View>
            <View style={styles.logoAccent}>
              <Ionicons name="trending-up" size={24} color="#4A90E2" />
            </View>
          </Animated.View>

          {/* App Title */}
          <Animated.View
            style={[
              styles.titleContainer,
              {
                transform: [{ translateY: titleSlide }],
                opacity: titleOpacity,
              },
            ]}
          >
            <Text style={styles.appTitle}>BudgetWise</Text>
            <View style={styles.titleUnderline} />
          </Animated.View>

          {/* Slogan */}
          <Animated.View
            style={[
              styles.sloganContainer,
              {
                transform: [{ translateY: sloganSlide }],
                opacity: sloganOpacity,
              },
            ]}
          >
            <Text style={styles.slogan}>Your Money, Your Way, Your Groups</Text>
            <Text style={styles.subSlogan}>Smart expense tracking for everyone</Text>
          </Animated.View>

          {/* Loading Dots */}
          <Animated.View
            style={[
              styles.loadingContainer,
              { opacity: dotsOpacity },
            ]}
          >
            <Text style={styles.loadingText}>Loading</Text>
            <View style={styles.dotsContainer}>
              {[0, 1, 2].map((index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      opacity: currentDot >= index ? 1 : 0.3,
                      transform: [
                        {
                          scale: currentDot === index ? 1.2 : 1,
                        },
                      ],
                    },
                  ]}
                />
              ))}
            </View>
          </Animated.View>
        </View>

        {/* Background Pattern */}
        <View style={styles.backgroundPattern}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
        </View>

        {/* Bottom Branding */}
        <View style={styles.bottomContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.brandText}>by Akshay & Prem</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoAccent: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  titleUnderline: {
    width: 60,
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    marginTop: 8,
  },
  sloganContainer: {
    alignItems: 'center',
    marginBottom: 60,
    paddingHorizontal: 40,
  },
  slogan: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  subSlogan: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '400',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
    fontWeight: '500',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
  },
  backgroundPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  circle1: {
    width: 300,
    height: 300,
    top: -150,
    left: -100,
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: -100,
    right: -50,
  },
  circle3: {
    width: 150,
    height: 150,
    top: height * 0.3,
    right: -75,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  brandText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
});
