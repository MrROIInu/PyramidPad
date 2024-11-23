import React, { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  endDate: Date;
  onComplete?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ endDate, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +endDate - +new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else if (onComplete) {
        onComplete();
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, [endDate, onComplete]);

  return (
    <div className="bg-gradient-to-r from-amber-900/20 to-yellow-900/20 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <Timer className="text-yellow-600" />
        <h3 className="text-xl font-semibold text-yellow-600">Presale Ends In</h3>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(timeLeft).map(([key, value]) => (
          <div key={key} className="text-center">
            <div className="bg-gradient-to-b from-yellow-600 to-amber-800 text-white rounded-lg p-3">
              <span className="text-2xl font-bold">{value}</span>
            </div>
            <span className="text-sm text-yellow-600 mt-1 block capitalize">{key}</span>
          </div>
        ))}
      </div>
    </div>
  );
};