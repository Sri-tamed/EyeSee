import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import type { IOPReading } from '../types';
import { NEON_BLUE } from '../constants';
import { getAIInsight } from '../services/geminiService';
import { generatePDFReport } from '../utils/pdfGenerator';
import { SparklesIcon } from './icons/SparklesIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface HistoryProps {
  readings: IOPReading[];
}

const screenWidth = Dimensions.get('window').width;

const History: React.FC<HistoryProps> = ({ readings }) => {
  const [insight, setInsight] = useState<string>('');
  const [isLoadingInsight, setIsLoadingInsight] = useState<boolean>(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

  const handleGetInsight = async () => {
    setIsLoadingInsight(true);
    const result = await getAIInsight(readings);
    setInsight(result);
    setIsLoadingInsight(false);
  };

  const handleGenerateReport = async () => {
    setIsGeneratingPDF(true);
    try {
      await generatePDFReport(readings, insight);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      Alert.alert('Error', 'Could not generate PDF report. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const chartLabels = readings.map((r) =>
    r.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );
  const chartValues = readings.map((r) => r.value);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {/* Chart Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Readings History</Text>
        {chartValues.length > 0 ? (
          <BarChart
            data={{
              labels: chartLabels,
              datasets: [{ data: chartValues }],
            }}
            width={screenWidth - 64}
            height={250}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: '#1e293b',
              backgroundGradientTo: '#1e293b',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 191, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
              barPercentage: 0.6,
              propsForBackgroundLines: {
                strokeDasharray: '3 3',
                stroke: '#334155',
              },
            }}
            style={styles.chart}
            withInnerLines
            showValuesOnTopOfBars
            fromZero={false}
            yAxisLabel=""
            yAxisSuffix=""
          />
        ) : (
          <Text style={styles.noDataText}>No readings yet</Text>
        )}
      </View>

      {/* AI Insight Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>AI-Driven Insight</Text>
        {insight && !isLoadingInsight ? (
          <Text style={styles.insightText}>"{insight}"</Text>
        ) : null}
        {isLoadingInsight ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#22d3ee" />
            <Text style={styles.loadingText}>Generating analysis...</Text>
          </View>
        ) : null}
        {!insight && !isLoadingInsight ? (
          <Text style={styles.placeholderText}>Press the button to analyze your pressure trends.</Text>
        ) : null}
        <TouchableOpacity
          style={[styles.insightButton, (isLoadingInsight || isGeneratingPDF) && styles.buttonDisabled]}
          onPress={handleGetInsight}
          disabled={isLoadingInsight || isGeneratingPDF}
          activeOpacity={0.7}
        >
          <SparklesIcon width={20} height={20} color={isLoadingInsight || isGeneratingPDF ? '#94a3b8' : '#0f172a'} />
          <Text style={[styles.insightButtonText, (isLoadingInsight || isGeneratingPDF) && styles.buttonTextDisabled]}>
            {isLoadingInsight ? 'Analyzing...' : 'Get AI Insight'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Report Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Shareable Report</Text>
        <Text style={styles.placeholderText}>
          Generate a PDF report of your history and insights to share with your doctor.
        </Text>
        <TouchableOpacity
          style={[styles.reportButton, (isGeneratingPDF || isLoadingInsight || readings.length === 0) && styles.buttonDisabled]}
          onPress={handleGenerateReport}
          disabled={isGeneratingPDF || isLoadingInsight || readings.length === 0}
          activeOpacity={0.7}
        >
          <DownloadIcon
            width={20}
            height={20}
            color={isGeneratingPDF || isLoadingInsight || readings.length === 0 ? '#94a3b8' : '#67e8f9'}
          />
          <Text
            style={[
              styles.reportButtonText,
              (isGeneratingPDF || isLoadingInsight || readings.length === 0) && styles.buttonTextDisabled,
            ]}
          >
            {isGeneratingPDF ? 'Generating...' : 'Generate Report'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 16,
    gap: 24,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#67e8f9',
    marginBottom: 8,
  },
  chart: {
    borderRadius: 16,
    marginTop: 8,
  },
  noDataText: {
    color: '#64748b',
    textAlign: 'center',
    paddingVertical: 40,
  },
  insightText: {
    color: '#cbd5e1',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#94a3b8',
  },
  placeholderText: {
    color: '#94a3b8',
  },
  insightButton: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#06b6d4',
    borderRadius: 999,
    gap: 8,
  },
  insightButtonText: {
    color: '#0f172a',
    fontWeight: '600',
  },
  reportButton: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: 'rgba(51, 65, 85, 0.8)',
    borderRadius: 999,
    gap: 8,
  },
  reportButtonText: {
    color: '#67e8f9',
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#475569',
  },
  buttonTextDisabled: {
    color: '#94a3b8',
  },
});

export default History;
