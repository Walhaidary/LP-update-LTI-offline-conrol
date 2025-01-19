import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface NotificationProps {
  type: 'success' | 'error';
  message: React.ReactNode;
}

export function Notification({ type, message }: NotificationProps) {
  const styles = {
    success: {
      wrapper: 'bg-green-50 border-green-400',
      text: 'text-green-700',
      icon: <CheckCircle className="h-5 w-5 text-green-400" />
    },
    error: {
      wrapper: 'bg-red-50 border-red-400',
      text: 'text-red-700',
      icon: <AlertCircle className="h-5 w-5 text-red-400" />
    }
  }[type];

  return (
    <div className={`mb-6 p-4 border rounded-md ${styles.wrapper}`}>
      <div className="flex items-start gap-3">
        {styles.icon}
        <span className={styles.text}>{message}</span>
      </div>
    </div>
  );
}