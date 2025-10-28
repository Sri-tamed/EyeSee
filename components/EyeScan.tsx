import React, { useState, useEffect } from 'react';

interface EyeScanProps {
  onSave: (value: number) => void;
}

enum ScanState {
  Idle,
  Scanning,
  Analyzing,
  Result,
}

const EyeScan: React.FC<EyeScanProps> = ({ onSave }) => {
  const [scanState, setScanState] = useState<ScanState>(ScanState.Idle);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    // FIX: Replaced NodeJS.Timeout with `number` which is the correct type for timers in a browser environment.
    // Also improved the timer cleanup logic to be safer.
    let timer: number | undefined;
    if (scanState === ScanState.Scanning) {
      timer = window.setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            // The interval is now cleared by the effect's cleanup function when the state changes,
            // which is a more robust pattern in React.
            setScanState(ScanState.Analyzing);
            return 100;
          }
          return prev + 1;
        });
      }, 30);
    } else if (scanState === ScanState.Analyzing) {
      timer = window.setTimeout(() => {
        // Simulate a new reading between 15 and 28
        const newReading = Math.random() * (28 - 15) + 15;
        setResult(parseFloat(newReading.toFixed(1)));
        setScanState(ScanState.Result);
      }, 2000);
    }

    // The cleanup function will run when the component unmounts or when scanState changes.
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [scanState]);

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
  }

  const renderContent = () => {
    switch (scanState) {
      case ScanState.Scanning:
      case ScanState.Analyzing:
        return (
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-slate-700"
                  strokeWidth="5"
                  stroke="currentColor"
                  fill="transparent"
                  r="45"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="text-cyan-400 transition-all duration-300"
                  strokeWidth="5"
                  strokeDasharray={2 * Math.PI * 45}
                  strokeDashoffset={(2 * Math.PI * 45) * (1 - progress / 100)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="45"
                  cx="50"
                  cy="50"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-cyan-300">
                {scanState === ScanState.Analyzing ? "..." : `${progress}%`}
              </div>
            </div>
            <p className="mt-6 text-xl text-slate-300">
              {scanState === ScanState.Scanning ? 'Scanning...' : 'Analyzing...'}
            </p>
             <p className="mt-2 text-sm text-slate-400">Please hold still.</p>
          </div>
        );
      case ScanState.Result:
        return (
          <div className="flex flex-col items-center justify-center text-center animate-fade-in">
            <p className="text-slate-400">Measurement Complete</p>
            <p className="text-7xl font-bold my-4 text-cyan-300">{result}</p>
            <p className="text-2xl text-slate-400 -mt-2">mmHg</p>
            <div className="flex space-x-4 mt-8">
              <button onClick={resetScan} className="px-6 py-3 bg-slate-700 rounded-full font-semibold hover:bg-slate-600 transition-colors">
                Discard
              </button>
              <button onClick={handleSave} className="px-6 py-3 bg-cyan-500 text-slate-900 rounded-full font-semibold hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/30">
                Save Result
              </button>
            </div>
          </div>
        );
      case ScanState.Idle:
      default:
        return (
          <div className="flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold text-slate-200">Ready to Scan</h2>
            <p className="text-slate-400 mt-2 max-w-xs">
              Place the device gently over your eye and press the button below to start the measurement.
            </p>
            <button
              onClick={startScan}
              className="mt-8 px-8 py-4 bg-cyan-500 text-slate-900 rounded-full font-bold text-lg hover:bg-cyan-400 transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-cyan-500/40"
            >
              Start Measurement
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {renderContent()}
    </div>
  );
};

export default EyeScan;
