import React, { useState, useEffect, useRef, useCallback } from 'react';

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

const EyeScan: React.FC<EyeScanProps> = ({ onSave }) => {
  const [scanState, setScanState] = useState<ScanState>(ScanState.Idle);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    let timer: number | undefined;
    if (scanState === ScanState.Scanning) {
      timer = window.setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setScanState(ScanState.Analyzing);
            return 100;
          }
          return prev + 1;
        });
      }, 30);
    } else if (scanState === ScanState.Analyzing) {
      timer = window.setTimeout(() => {
        const newReading = Math.random() * (28 - 15) + 15;
        setResult(parseFloat(newReading.toFixed(1)));
        stopCamera();
        setScanState(ScanState.Result);
      }, 2000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [scanState, stopCamera]);
  
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Ensure camera is stopped on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);


  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(mediaStream);
      setScanState(ScanState.CameraActive);
    } catch (err) {
      console.error("Camera access denied:", err);
      alert("Camera access is required. Please allow camera access in your browser settings and refresh the page.");
    }
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
    stopCamera();
    setScanState(ScanState.Idle);
    setProgress(0);
    setResult(null);
  }

  const renderContent = () => {
    switch (scanState) {
      case ScanState.CameraActive:
        return (
           <div className="flex flex-col items-center justify-center text-center">
             <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-cyan-500/50 shadow-lg bg-slate-900">
               <video 
                 ref={videoRef} 
                 autoPlay 
                 playsInline 
                 muted 
                 className="w-full h-full object-cover scale-x-[-1]"
               />
             </div>
             <h3 className="text-xl font-semibold text-white mt-6">Position Your Eye</h3>
             <p className="text-slate-300 mt-1 max-w-xs">Center your eye within the circle and hold steady.</p>
             <button onClick={startScan} className="mt-6 px-6 py-3 bg-cyan-500 text-slate-900 rounded-full font-semibold hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/30">
               Start Measurement
             </button>
           </div>
        );

      case ScanState.Scanning:
      case ScanState.Analyzing:
        return (
          <div className="flex flex-col items-center justify-center">
             <div className="relative w-64 h-64 flex items-center justify-center">
                 {/* Video Background */}
                <div className="absolute inset-0 w-64 h-64 rounded-full overflow-hidden bg-slate-900">
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover scale-x-[-1]"
                    />
                </div>
                 {/* Progress indicator on top */}
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-slate-700/50"
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
                  <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white bg-black/20 rounded-full">
                    {scanState === ScanState.Analyzing ? "..." : `${progress}%`}
                  </div>
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
              The scanner will use your camera to simulate a measurement.
            </p>
            <button
              onClick={startCamera}
              className="mt-8 px-8 py-4 bg-cyan-500 text-slate-900 rounded-full font-bold text-lg hover:bg-cyan-400 transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-cyan-500/40"
            >
              Activate Scanner
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