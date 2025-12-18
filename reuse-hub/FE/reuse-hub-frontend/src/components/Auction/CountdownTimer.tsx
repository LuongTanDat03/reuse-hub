import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endTime: string;
  onEnd?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ endTime, onEnd }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endTime).getTime();
      const now = new Date().getTime();
      const difference = end - now;

      if (difference <= 0) {
        setIsEnded(true);
        if (onEnd) onEnd();
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onEnd]);

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 1;

  if (isEnded) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 text-center">
        <p className="text-gray-600 font-medium">Phiên đấu giá đã kết thúc</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-4 ${isUrgent ? 'bg-red-50 border-2 border-red-300' : 'bg-blue-50'}`}>
      <p className={`text-sm text-center mb-2 ${isUrgent ? 'text-red-600' : 'text-blue-600'}`}>
        {isUrgent ? '⚡ Sắp kết thúc!' : '⏰ Thời gian còn lại'}
      </p>
      
      <div className="flex justify-center gap-2">
        {timeLeft.days > 0 && (
          <TimeBlock value={timeLeft.days} label="Ngày" isUrgent={isUrgent} />
        )}
        <TimeBlock value={timeLeft.hours} label="Giờ" isUrgent={isUrgent} />
        <TimeBlock value={timeLeft.minutes} label="Phút" isUrgent={isUrgent} />
        <TimeBlock value={timeLeft.seconds} label="Giây" isUrgent={isUrgent} />
      </div>
    </div>
  );
};

interface TimeBlockProps {
  value: number;
  label: string;
  isUrgent: boolean;
}

const TimeBlock: React.FC<TimeBlockProps> = ({ value, label, isUrgent }) => (
  <div className="text-center">
    <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
      isUrgent ? 'bg-red-500 text-white animate-pulse' : 'bg-white shadow'
    }`}>
      <span className="text-2xl font-bold">{value.toString().padStart(2, '0')}</span>
    </div>
    <p className={`text-xs mt-1 ${isUrgent ? 'text-red-600' : 'text-gray-500'}`}>{label}</p>
  </div>
);
