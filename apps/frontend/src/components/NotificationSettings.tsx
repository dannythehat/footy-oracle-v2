import React, { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { notificationService } from '../services/notifications';

export const NotificationSettings: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    setIsSupported(notificationService.isSupported());
    setPermission(notificationService.getPermission());
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await notificationService.requestPermission();
    setPermission(granted ? 'granted' : 'denied');
    
    if (granted) {
      // Show test notification
      await notificationService.show({
        title: '🎉 Notifications Enabled!',
        body: "You'll now receive alerts for Golden Bets and live matches",
      });
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg border border-gray-700">
        <BellOff className="w-5 h-5 text-gray-500" />
        <span className="text-sm text-gray-400">
          Notifications not supported in this browser
        </span>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-red-900/20 rounded-lg border border-red-800">
        <BellOff className="w-5 h-5 text-red-400" />
        <span className="text-sm text-red-300">
          Notifications blocked. Enable in browser settings.
        </span>
      </div>
    );
  }

  if (permission === 'granted') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-900/20 rounded-lg border border-green-800">
        <Bell className="w-5 h-5 text-green-400" />
        <span className="text-sm text-green-300">
          Notifications enabled
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={handleEnableNotifications}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
    >
      <Bell className="w-5 h-5" />
      <span className="text-sm font-medium">Enable Notifications</span>
    </button>
  );
};
