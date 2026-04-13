import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Svg, { Circle } from 'react-native-svg';

interface EyeScanProps {
  onSave: (value: number) => void;
}

enum ScanState {
  Idle,
  CameraActive,
  Scanning,
  Analyzing,
  Result,
}

const PROGRESS_RING_SIZE = 192;
const PROGRESS_RING_R = 86;
const PROGRESS_RING_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RING_R;

const EyeScan: React.FC<EyeScanProps> = ({ onSave }) => {
  const [scanState, setScanState] = useState<ScanState>(ScanState.Idle);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (scanState === ScanState.Scanning) {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setScanState(ScanState.Analyzing);
            return 100;
          }
          return prev + 1;
        });
      }, 30);
    } else if (scanState === ScanState.Analyzing) {
      timer = setTimeout(() => {
        const newReading = Math.random() * (28 - 15) + 15;
        setResult(parseFloat(newReading.toFixed(1)));
        setScanState(ScanState.Result);
      }, 2000) as unknown as ReturnType<typeof setInterval>;
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [scanState]);

  const startCamera = async () => {
    setCameraError(null);
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        setCameraError(
          'Camera access was denied. To use the scanner, please grant permission in your device settings.'
        );
        return;
      }
    }
    setScanState(ScanState.CameraActive);
  };

  const startScan = () => {
    setProgress(0);
    setResult(null);
    setScanState(ScanState.Scanning);
  };

  const handleSave = () => {
    if (result) {
      onSave(result);
    }
  };

  const resetScan = () => {
    setScanState(ScanState.Idle);
    setProgress(0);
    setResult(null);
    setCameraError(null);
  };

  const renderContent = () => {
    switch (scanState) {
      case ScanState.CameraActive:
        return (
          <View style={styles.centered}>
            <View style={styles.cameraCircle}>
              <CameraView style={styles.camera} facing="front" />
            </View>
            <Text style={styles.title}>Position Your Eye</Text>
            <Text style={styles.subtitle}>Center your eye within the circle and hold steady.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={startScan} activeOpacity={0.7}>
              <Text style={styles.primaryButtonText}>Start Measurement</Text>
            </TouchableOpacity>
          </View>
        );

      case ScanState.Scanning:
      case ScanState.Analyzing:
        return (
          <View style={styles.centered}>
            <View style={styles.scanContainer}>
              {/* Camera background */}
              <View style={styles.cameraCircle}>
                <CameraView style={styles.camera} facing="front" />
              </View>
              {/* Progress ring overlay */}
              <View style={styles.progressOverlay}>
                <Svg width={PROGRESS_RING_SIZE} height={PROGRESS_RING_SIZE}>
                  <Circle
                    cx={PROGRESS_RING_SIZE / 2}
                    cy={PROGRESS_RING_SIZE / 2}
                    r={PROGRESS_RING_R}
                    stroke="rgba(51, 65, 85, 0.5)"
                    strokeWidth={5}
                    fill="transparent"
                  />
                  <Circle
                    cx={PROGRESS_RING_SIZE / 2}
                    cy={PROGRESS_RING_SIZE / 2}
                    r={PROGRESS_RING_R}
                    stroke="#22d3ee"
                    strokeWidth={5}
                    fill="transparent"
                    strokeDasharray={PROGRESS_RING_CIRCUMFERENCE}
                    strokeDashoffset={PROGRESS_RING_CIRCUMFERENCE * (1 - progress / 100)}
                    strokeLinecap="round"
                    rotation={-90}
                    origin={`${PROGRESS_RING_SIZE / 2}, ${PROGRESS_RING_SIZE / 2}`}
                  />
                </Svg>
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressText}>
                    {scanState === ScanState.Analyzing ? '...' : `${progress}%`}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.scanStatusText}>
              {scanState === ScanState.Scanning ? 'Scanning...' : 'Analyzing...'}
            </Text>
            <Text style={styles.holdStillText}>Please hold still.</Text>
          </View>
        );

      case ScanState.Result:
        return (
          <View style={styles.centered}>
            <Text style={styles.resultLabel}>Measurement Complete</Text>
            <Text style={styles.resultValue}>{result}</Text>
            <Text style={styles.resultUnit}>mmHg</Text>
            <View style={styles.resultButtons}>
              <TouchableOpacity style={styles.discardButton} onPress={resetScan} activeOpacity={0.7}>
                <Text style={styles.discardButtonText}>Discard</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={handleSave} activeOpacity={0.7}>
                <Text style={styles.primaryButtonText}>Save Result</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case ScanState.Idle:
      default:
        return (
          <View style={styles.centered}>
            {cameraError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorTitle}>Camera Error</Text>
                <Text style={styles.errorText}>{cameraError}</Text>
              </View>
            ) : (
              <>
                <Text style={styles.readyTitle}>Ready to Scan</Text>
                <Text style={styles.readySubtitle}>
                  The scanner will use your camera to simulate a measurement.
                </Text>
              </>
            )}
            <TouchableOpacity style={styles.primaryButton} onPress={startCamera} activeOpacity={0.7}>
              <Text style={styles.primaryButtonText}>{cameraError ? 'Try Again' : 'Activate Scanner'}</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return <View style={styles.container}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraCircle: {
    width: 256,
    height: 256,
    borderRadius: 128,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: 'rgba(6, 182, 212, 0.5)',
    backgroundColor: '#0f172a',
  },
  camera: {
    flex: 1,
    transform: [{ scaleX: -1 }],
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 24,
  },
  subtitle: {
    color: '#cbd5e1',
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 280,
  },
  primaryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: '#06b6d4',
    borderRadius: 999,
  },
  primaryButtonText: {
    color: '#0f172a',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scanContainer: {
    width: 256,
    height: 256,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: PROGRESS_RING_SIZE,
    height: PROGRESS_RING_SIZE,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: PROGRESS_RING_SIZE / 2,
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scanStatusText: {
    fontSize: 20,
    color: '#cbd5e1',
    marginTop: 24,
  },
  holdStillText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },
  resultLabel: {
    color: '#94a3b8',
    fontSize: 16,
  },
  resultValue: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#67e8f9',
    marginVertical: 16,
  },
  resultUnit: {
    fontSize: 24,
    color: '#94a3b8',
    marginTop: -8,
  },
  resultButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 32,
  },
  discardButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: '#334155',
    borderRadius: 999,
  },
  discardButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  errorBox: {
    marginBottom: 16,
    backgroundColor: 'rgba(127, 29, 29, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
    padding: 16,
    borderRadius: 12,
    maxWidth: 300,
  },
  errorTitle: {
    fontWeight: 'bold',
    color: '#fca5a5',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#fca5a5',
  },
  readyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e2e8f0',
  },
  readySubtitle: {
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 280,
  },
});

export default EyeScan;
