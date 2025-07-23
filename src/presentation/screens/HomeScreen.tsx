import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.companyName}>BudgetWise</Text>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Take Control of Your Finances</Text>
          <Text style={styles.heroSubtitle}>
            Smart budgeting made simple with BudgetWise
          </Text>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Why Choose BudgetWise?</Text>
          
          <View style={styles.feature}>
            <Text style={styles.featureTitle}>📊 Track Your Spending</Text>
            <Text style={styles.featureDescription}>
              Monitor your income and expenses in real-time with our intuitive dashboard
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureTitle}>💰 Budget Planning</Text>
            <Text style={styles.featureDescription}>
              Set budgets for different categories and stay on track with your financial goals
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureTitle}>📈 Financial Insights</Text>
            <Text style={styles.featureDescription}>
              Get detailed reports and insights to make informed financial decisions
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureTitle}>🔒 Secure & Private</Text>
            <Text style={styles.featureDescription}>
              Your financial data is protected with bank-level security measures
            </Text>
          </View>
        </View>

        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to Start Your Financial Journey?</Text>
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerButtonText}>Get Started Free</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#4A90E2',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },  loginButton: {
    backgroundColor: '#87CEEB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#87CEEB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C5282',
    textAlign: 'center',
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#4A90E2',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresSection: {
    marginVertical: 30,
  },  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C5282',
    marginBottom: 25,
    textAlign: 'center',
  },
  feature: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#87CEEB',
  },  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C5282',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#4A90E2',
    lineHeight: 20,
  },
  ctaSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingBottom: 60,
  },  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C5282',
    textAlign: 'center',
    marginBottom: 25,
  },
  registerButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },  ctaSubtext: {
    fontSize: 14,
    color: '#4A90E2',
    textAlign: 'center',
    marginTop: 10,
  },
});
