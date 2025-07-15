'use client';

import { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  items?: { category: string; description: string }[];
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

export default function Toast({ message, items, type = 'success', duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }[type];

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className={`${bgColor} text-white p-4 rounded-lg shadow-lg max-w-md`}>
        <p className="font-semibold">{message}</p>
        {items && items.length > 0 && (
          <div className="mt-2 text-sm">
            {items.map((item, index) => (
              <div key={index} className="ml-2">
                • {item.category}: {item.description}
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className="absolute top-2 right-2 text-white hover:text-gray-200"
        >
          ✕
        </button>
      </div>
    </div>
  );
}