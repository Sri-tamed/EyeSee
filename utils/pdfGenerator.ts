import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import type { IOPReading } from '../types';

// FIX: The module augmentation `declare module 'jspdf'` was causing an error:
// "Invalid module name in augmentation, module 'jspdf' cannot be found."
// Replacing it with an interface and a type assertion below is a robust way to add the types for the autoTable plugin.
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export const generatePDFReport = async (
  chartElement: HTMLElement,
  readings: IOPReading[],
  insight: string
): Promise<void> => {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  const latestReading = readings.length > 0 ? readings[readings.length - 1] : null;

  // --- Header ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor('#0891b2'); // cyan-700
  doc.text('EyeSee - IOP Report', 14, 22);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#475569'); // slate-600
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

  // --- Summary ---
  doc.setFontSize(12);
  doc.setTextColor('#0f172a'); // slate-900
  doc.text('Summary', 14, 45);
  doc.setDrawColor('#e2e8f0'); // slate-200
  doc.line(14, 47, 196, 47);
  
  doc.setFontSize(10);
  const summaryText = `This report contains ${readings.length} readings.
The latest reading was ${latestReading?.value.toFixed(1) ?? 'N/A'} mmHg on ${latestReading?.date.toLocaleDateString() ?? 'N/A'}.`;
  doc.text(summaryText, 14, 54);

  // --- AI Insight ---
  if (insight) {
    doc.setFontSize(12);
    doc.setTextColor('#0f172a');
    doc.text('AI-Driven Insight', 14, 75);
    doc.line(14, 77, 196, 77);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    const insightLines = doc.splitTextToSize(`"${insight}"`, 182);
    doc.text(insightLines, 14, 84);
  }

  // --- Chart ---
  const canvas = await html2canvas(chartElement, {
    backgroundColor: '#1e293b', // slate-800
    scale: 2,
  });
  const imgData = canvas.toDataURL('image/png');
  const chartYPosition = insight ? 100 : 75;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#0f172a');
  doc.text('Readings History Chart', 14, chartYPosition);
  doc.line(14, chartYPosition + 2, 196, chartYPosition + 2);
  
  const imgProps = doc.getImageProperties(imgData);
  const pdfWidth = 182;
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  doc.addImage(imgData, 'PNG', 14, chartYPosition + 5, pdfWidth, pdfHeight);

  // --- Data Table ---
  const tableData = readings.map(r => [
    r.date.toLocaleDateString(),
    r.date.toLocaleTimeString(),
    r.value.toFixed(1),
  ]);

  doc.autoTable({
    startY: chartYPosition + pdfHeight + 15,
    head: [['Date', 'Time', 'IOP (mmHg)']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: '#0e2940', // Custom dark blue from Iris
      textColor: '#e0f2fe', // light cyan/sky
    },
    styles: {
      font: 'helvetica',
      fontSize: 10,
    },
  });

  // --- Save ---
  doc.save('EyeSee_IOP_Report.pdf');
};
