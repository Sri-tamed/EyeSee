import React, { useState } from 'react';
import { EyeIcon } from './icons/EyeIcon';
import { ChartTrendingUpIcon } from './icons/ChartTrendingUpIcon';
import { WifiIcon } from './icons/WifiIcon';
import { BluetoothIcon } from './icons/BluetoothIcon';

interface OnboardingProps {
  onComplete: () => void;
}

const onboardingSteps = [
  {
    icon: <EyeIcon className="w-16 h-16 text-cyan-400" />,
    title: 'Welcome to EyeSee',
    text: "Your personal companion for monitoring eye health. Let's get you started on the path to proactive care.",
  },
  {
    icon: <ChartTrendingUpIcon className="w-16 h-16 text-cyan-400" />,
    title: 'Proactive Eye Care',
    text: 'Regularly tracking your intraocular pressure (IOP) is key to early detection of conditions like glaucoma. Stay ahead with consistent monitoring.',
  },
  {
    icon: (
      <div className="flex space-x-6">
        <WifiIcon className="w-12 h-12 text-cyan-400" />
        <BluetoothIcon className="w-12 h-12 text-cyan-400" />
      </div>
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
  }

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md text-center flex flex-col h-full">
        
        <div className="absolute top-4 right-4">
          <button onClick={onComplete} className="text-slate-400 hover:text-white transition-colors font-semibold px-3 py-1">
            Skip
          </button>
        </div>
        
        <div className="flex-grow flex flex-col items-center justify-center">
            <div className="mb-8">{currentStepData.icon}</div>
            <h2 className="text-3xl font-bold text-cyan-300 mb-4 font-poppins">{currentStepData.title}</h2>
            <p className="text-slate-300 text-lg leading-relaxed max-w-sm">{currentStepData.text}</p>
        </div>
        
        <div className="pb-8">
          <div className="flex justify-center space-x-2 mb-8">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === step ? 'bg-cyan-400 scale-125' : 'bg-slate-600'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between min-h-[50px]">
             <div className="w-24 text-left">
                {step > 0 && (
                    <button onClick={handleBack} className="px-6 py-3 text-slate-400 font-semibold hover:text-white transition-colors">
                        Back
                    </button>
                )}
            </div>
            
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-cyan-500 text-slate-900 rounded-full font-bold text-lg hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/30"
            >
              {isLastStep ? 'Get Started' : 'Next'}
            </button>
            <div className="w-24" /> 
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;