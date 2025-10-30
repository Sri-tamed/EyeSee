import React, { useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { IOPReading } from '../types';
import { NORMAL_IOP_RANGE, NEON_BLUE } from '../constants';
import { getAIInsight } from '../services/geminiService';
import { generatePDFReport } from '../utils/pdfGenerator';
import { SparklesIcon } from './icons/SparklesIcon';
import { DownloadIcon } from './icons/DownloadIcon';


interface HistoryProps {
  readings: IOPReading[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-700/80 p-2 border border-slate-600 rounded-md shadow-lg">
        <p className="label text-sm text-cyan-300">{`${new Date(label).toLocaleDateString()}`}</p>
        <p className="intro text-lg font-bold">{`IOP: ${payload[0].value} mmHg`}</p>
      </div>
    );
  }
  return null;
};

const History: React.FC<HistoryProps> = ({ readings }) => {
  const [insight, setInsight] = useState<string>('');
  const [isLoadingInsight, setIsLoadingInsight] = useState<boolean>(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleGetInsight = async () => {
    setIsLoadingInsight(true);
    const result = await getAIInsight(readings);
    setInsight(result);
    setIsLoadingInsight(false);
  };

  const handleGenerateReport = async () => {
    if (!chartRef.current) return;
    setIsGeneratingPDF(true);
    try {
      await generatePDFReport(chartRef.current, readings, insight);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Could not generate PDF report. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  const chartData = readings.map(r => ({
    name: r.date.getTime(),
    IOP: r.value,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div ref={chartRef} className="bg-slate-800/50 p-4 rounded-xl backdrop-blur-sm border border-slate-700">
        <h2 className="text-xl font-bold text-cyan-300 mb-4">Readings History</h2>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="name" 
                tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 191, 255, 0.1)' }} />
              <Bar dataKey="IOP">
                 {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.IOP > NORMAL_IOP_RANGE.max || entry.IOP < NORMAL_IOP_RANGE.min ? '#FBBF24' : NEON_BLUE} />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-800/50 p-4 rounded-xl backdrop-blur-sm border border-slate-700">
        <h2 className="text-xl font-bold text-cyan-300 mb-2">AI-Driven Insight</h2>
        {insight && !isLoadingInsight && (
           <p className="text-slate-300 italic">"{insight}"</p>
        )}
        {isLoadingInsight && (
            <div className="flex items-center space-x-2 text-slate-400">
                <div className="w-4 h-4 border-2 border-t-cyan-400 border-slate-600 rounded-full animate-spin"></div>
                <span>Generating analysis...</span>
            </div>
        )}
        {!insight && !isLoadingInsight && (
            <p className="text-slate-400">Press the button to analyze your pressure trends.</p>
        )}
        <button
          onClick={handleGetInsight}
          disabled={isLoadingInsight || isGeneratingPDF}
          className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-cyan-500 text-slate-900 rounded-full font-semibold hover:bg-cyan-400 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/30"
        >
          <SparklesIcon className="w-5 h-5 mr-2" />
          {isLoadingInsight ? 'Analyzing...' : 'Get AI Insight'}
        </button>
      </div>

       <div className="bg-slate-800/50 p-4 rounded-xl backdrop-blur-sm border border-slate-700">
        <h2 className="text-xl font-bold text-cyan-300 mb-2">Shareable Report</h2>
        <p className="text-slate-400">Generate a PDF report of your history and insights to share with your doctor.</p>
        <button
          onClick={handleGenerateReport}
          disabled={isGeneratingPDF || isLoadingInsight || readings.length === 0}
          className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-slate-700/80 text-cyan-300 rounded-full font-semibold hover:bg-slate-600 transition-colors disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed"
        >
          <DownloadIcon className="w-5 h-5 mr-2" />
          {isGeneratingPDF ? 'Generating...' : 'Generate Report'}
        </button>
      </div>
    </div>
  );
};

export default History;