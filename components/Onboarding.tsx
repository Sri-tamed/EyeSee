import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { EyeIcon } from './icons/EyeIcon';
import { ChartTrendingUpIcon } from './icons/ChartTrendingUpIcon';
import { WifiIcon } from './icons/WifiIcon';
import { BluetoothIcon } from './icons/BluetoothIcon';

interface OnboardingProps {
  onComplete: () => void;
}

const onboardingSteps = [
  {
    icon: <EyeIcon width={64} height={64} color="#22d3ee" />,
    title: 'Welcome to EyeSee',
    text: "Your personal companion for monitoring eye health. Let's get you started on the path to proactive care.",
  },
  {
    icon: <ChartTrendingUpIcon width={64} height={64} color="#22d3ee" />,
    title: 'Proactive Eye Care',
    text: 'Regularly tracking your intraocular pressure (IOP) is key to early detection of conditions like glaucoma. Stay ahead with consistent monitoring.',
  },
  {
    icon: (
      <View style={{ flexDirection: 'row', gap: 24 }}>
        <WifiIcon width={48} height={48} color="#22d3ee" />
        <BluetoothIcon width={48} height={48} color="#22d3ee" />
      </View>
    ),
    title: 'Simple & Secure Connection',
    text: "Connect your EyeSee Monitor via Wi-Fi or Bluetooth to start taking measurements. It's quick, easy, and secure.",
  },
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const currentStepData = onboardingSteps[step];
  const isLastStep = step === onboardingSteps.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* Skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={onComplete}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>{currentStepData.icon}</View>
        <Text style={styles.title}>{currentStepData.title}</Text>
        <Text style={styles.text}>{currentStepData.text}</Text>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomSection}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === step ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </View>

        {/* Navigation buttons */}
        <View style={styles.navRow}>
          <View style={styles.navSide}>
            {step > 0 && (
              <TouchableOpacity onPress={handleBack}>
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.7}>
            <Text style={styles.nextButtonText}>{isLastStep ? 'Get Started' : 'Next'}</Text>
          </TouchableOpacity>
          <View style={styles.navSide} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    zIndex: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
  },
  skipText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#67e8f9',
    marginBottom: 16,
    textAlign: 'center',
  },
  text: {
    color: '#cbd5e1',
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    maxWidth: 320,
  },
  bottomSection: {
    paddingBottom: 40,
    width: '100%',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    backgroundColor: '#22d3ee',
    transform: [{ scale: 1.25 }],
  },
  dotInactive: {
    backgroundColor: '#475569',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navSide: {
    width: 80,
  },
  backText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  nextButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: '#06b6d4',
    borderRadius: 999,
  },
  nextButtonText: {
    color: '#0f172a',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default Onboarding;
