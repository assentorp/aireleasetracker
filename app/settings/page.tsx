'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '../../assets/Logo';

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [frequency, setFrequency] = useState('immediately');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
  }, [isLoaded, user, router]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    // TODO: Implement actual API call to save settings
    // Placeholder simulation
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    }, 500);
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <header className="sticky top-0 bg-[#0A0A0A] z-50 py-3 md:py-8 px-4 md:px-8 border-b border-white/5">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <Logo className="cursor-pointer scale-50 md:scale-100 origin-left" />
          </Link>
        </div>
      </header>

      {/* Settings Content */}
      <main className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-12">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-sm md:text-base text-gray-300">Manage your notification preferences</p>
        </div>

        {/* Notification Settings Card */}
        <div className="bg-[#151515] border border-white/20 rounded-lg p-4 md:p-6 space-y-4 md:space-y-6">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4">Email Notifications</h2>
            <p className="text-xs md:text-sm text-gray-300 mb-4 md:mb-6">
              Get notified about new AI model releases from your favorite companies
            </p>
          </div>

          {/* Enable/Disable Notifications */}
          <div className="flex items-center justify-between py-3 md:py-4 border-b border-white/10">
            <div className="flex-1">
              <div className="text-xs md:text-sm font-medium text-white mb-1">
                Enable email notifications
              </div>
              <div className="text-[10px] md:text-xs text-gray-400">
                Receive updates about new model releases
              </div>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors border ${
                emailNotifications
                  ? 'bg-white border-white'
                  : 'bg-white/5 border-white/30'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                  emailNotifications
                    ? 'translate-x-6 bg-[#0A0A0A]'
                    : 'translate-x-1 bg-white'
                }`}
              />
            </button>
          </div>

          {/* Frequency Selection */}
          {emailNotifications && (
            <div className="py-3 md:py-4">
              <div className="text-xs md:text-sm font-medium text-white mb-3 md:mb-4">
                Notification frequency
              </div>
              <div className="space-y-2 md:space-y-3">
                <label className="flex items-start gap-2 md:gap-3 cursor-pointer group p-2 md:p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input
                      type="radio"
                      name="frequency"
                      value="immediately"
                      checked={frequency === 'immediately'}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="appearance-none w-4 md:w-5 h-4 md:h-5 border-2 border-white/40 rounded-full checked:border-white checked:bg-transparent cursor-pointer"
                    />
                    {frequency === 'immediately' && (
                      <div className="absolute w-2 md:w-2.5 h-2 md:h-2.5 bg-white rounded-full pointer-events-none" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs md:text-sm font-medium text-white group-hover:text-gray-200 transition-colors">
                      Immediately
                    </div>
                    <div className="text-[10px] md:text-xs text-gray-400 mt-0.5">
                      Get notified as soon as a new model is released
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-2 md:gap-3 cursor-pointer group p-2 md:p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input
                      type="radio"
                      name="frequency"
                      value="weekly"
                      checked={frequency === 'weekly'}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="appearance-none w-4 md:w-5 h-4 md:h-5 border-2 border-white/40 rounded-full checked:border-white checked:bg-transparent cursor-pointer"
                    />
                    {frequency === 'weekly' && (
                      <div className="absolute w-2 md:w-2.5 h-2 md:h-2.5 bg-white rounded-full pointer-events-none" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs md:text-sm font-medium text-white group-hover:text-gray-200 transition-colors">
                      Once a week
                    </div>
                    <div className="text-[10px] md:text-xs text-gray-400 mt-0.5">
                      Receive a weekly digest of new releases
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-2 md:gap-3 cursor-pointer group p-2 md:p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input
                      type="radio"
                      name="frequency"
                      value="monthly"
                      checked={frequency === 'monthly'}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="appearance-none w-4 md:w-5 h-4 md:h-5 border-2 border-white/40 rounded-full checked:border-white checked:bg-transparent cursor-pointer"
                    />
                    {frequency === 'monthly' && (
                      <div className="absolute w-2 md:w-2.5 h-2 md:h-2.5 bg-white rounded-full pointer-events-none" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs md:text-sm font-medium text-white group-hover:text-gray-200 transition-colors">
                      Once a month
                    </div>
                    <div className="text-[10px] md:text-xs text-gray-400 mt-0.5">
                      Receive a monthly summary of new releases
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-3 md:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 md:px-6 py-2 bg-white text-black text-xs md:text-sm font-medium rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>

            {saveMessage && (
              <div className="text-xs md:text-sm text-green-400 text-center sm:text-left">
                {saveMessage}
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 md:mt-6 text-sm text-gray-400 bg-[#151515] border border-white/10 rounded-lg p-3 md:p-4">
          <div className="flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mt-0.5 flex-shrink-0 md:w-4 md:h-4">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <p className="text-[10px] md:text-xs text-gray-400">
              Notification settings are currently in preview mode. Full implementation coming soon.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
