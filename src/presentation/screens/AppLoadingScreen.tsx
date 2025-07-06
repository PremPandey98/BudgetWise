import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AppLoadingScreenProps {
  message?: string;
}

export default function AppLoadingScreen({ 
  message = "Loading your financial data..." 
}: AppLoadingScreenProps) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Spinning animation
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    // Pulsing animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Fade in animation
    const fadeAnimation = Animated.timing(fadeValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    });

    fadeAnimation.start();
    spinAnimation.start();
    pulseAnimation.start();

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
    };
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const pulse = pulseValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#2C5282" />
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeValue },
          ]}
        >
          {/* Main Loading Icon */}
          <View style={styles.loadingIconContainer}>
            <Animated.View
              style={[
                styles.outerRing,
                {
                  transform: [{ rotate: spin }, { scale: pulse }],
                },
              ]}
            >
              <Ionicons name="trending-up" size={40} color="#FFFFFF" />
            </Animated.View>
            
            <Animated.View
              style={[
                styles.innerDots,
                { transform: [{ rotate: spin }] },
              ]}
            >
              <View style={[styles.loadingDot, styles.dot1]} />
              <View style={[styles.loadingDot, styles.dot2]} />
              <View style={[styles.loadingDot, styles.dot3]} />
            </Animated.View>
          </View>

          {/* Loading Text */}
          <View style={styles.textContainer}>
            <Text style={styles.loadingMessage}>{message}</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      transform: [{ scaleX: pulseValue }],
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Background Elements */}
          <View style={styles.backgroundElements}>
            <Animated.View
              style={[
                styles.floatingIcon,
                styles.icon1,
                { transform: [{ rotate: spin }] },
              ]}
            >
              <Ionicons name="wallet" size={24} color="rgba(255, 255, 255, 0.1)" />
            </Animated.View>
            
            <Animated.View
              style={[
                styles.floatingIcon,
                styles.icon2,
                { 
                  transform: [
                    { rotate: spin },
                    { scale: pulse },
                  ],
                },
              ]}
            >
              <Ionicons name="bar-chart" size={20} color="rgba(255, 255, 255, 0.1)" />
            </Animated.View>
            
            <Animated.View
              style={[
                styles.floatingIcon,
                styles.icon3,
                { transform: [{ rotate: spin }] },
              ]}
            >
              <Ionicons name="people" size={18} color="rgba(255, 255, 255, 0.1)" />
            </Animated.View>
          </View>
        </Animated.View>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIconContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  outerRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  innerDots: {
    position: 'absolute',
    width: 120,
    height: 120,
  },
  loadingDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  dot1: {
    top: 10,
    left: '50%',
    marginLeft: -4,
  },
  dot2: {
    top: '50%',
    right: 10,
    marginTop: -4,
  },
  dot3: {
    bottom: 10,
    left: '50%',
    marginLeft: -4,
  },
  textContainer: {
    alignItems: 'center',
  },
  loadingMessage: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    transform: [{ scaleX: 0.7 }],
  },
  backgroundElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  floatingIcon: {
    position: 'absolute',
  },
  icon1: {
    top: -40,
    left: -20,
  },
  icon2: {
    top: -20,
    right: -30,
  },
  icon3: {
    bottom: -30,
    left: 20,
  },
});
