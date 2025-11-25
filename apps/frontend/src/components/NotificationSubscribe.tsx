import React, { useState } from 'react';
import { Bell, Mail, Check, X } from 'lucide-react';

interface NotificationSubscribeProps {
  onClose?: () => void;
}

export const NotificationSubscribe: React.FC<NotificationSubscribeProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [preferences, setPreferences] = useState({
    dailyDigest: true,
    results: true,
    highConfidence: true,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          preferences,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      } else {
        setError(data.error || 'Failed to subscribe');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 border border-green-500/50 rounded-xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
          <Check className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">You're Subscribed! 🎉</h3>
        <p className="text-gray-300">
          You'll receive daily bet builder notifications at <span className="text-green-400 font-semibold">{email}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-500/50 rounded-xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-3">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Get Daily Bet Builders</h3>
            <p className="text-gray-400 text-sm">Never miss a high-value opportunity</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubscribe} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Email Address <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Name (Optional)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm text-gray-300 mb-2">Notification Preferences</label>
          
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={preferences.dailyDigest}
              onChange={(e) => setPreferences({ ...preferences, dailyDigest: e.target.checked })}
              className="w-5 h-5 rounded border-purple-500/30 bg-gray-900/50 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
            />
            <div>
              <div className="text-white group-hover:text-purple-400 transition-colors">Daily Digest</div>
              <div className="text-xs text-gray-400">Get today's bet builders every morning</div>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={preferences.results}
              onChange={(e) => setPreferences({ ...preferences, results: e.target.checked })}
              className="w-5 h-5 rounded border-purple-500/30 bg-gray-900/50 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
            />
            <div>
              <div className="text-white group-hover:text-purple-400 transition-colors">Result Notifications</div>
              <div className="text-xs text-gray-400">Get notified when bet builders win or lose</div>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={preferences.highConfidence}
              onChange={(e) => setPreferences({ ...preferences, highConfidence: e.target.checked })}
              className="w-5 h-5 rounded border-purple-500/30 bg-gray-900/50 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
            />
            <div>
              <div className="text-white group-hover:text-purple-400 transition-colors">High Confidence Alerts</div>
              <div className="text-xs text-gray-400">Only 85%+ confidence opportunities</div>
            </div>
          </label>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              <span>Subscribing...</span>
            </>
          ) : (
            <>
              <Bell className="w-5 h-5" />
              <span>Subscribe to Notifications</span>
            </>
          )}
        </button>

        <p className="text-xs text-gray-400 text-center">
          We'll never spam you. Unsubscribe anytime.
        </p>
      </form>
    </div>
  );
};

export default NotificationSubscribe;
