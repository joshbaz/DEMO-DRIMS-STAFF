import React, { useState, useEffect } from 'react';
import { X, Download, RefreshCw } from 'lucide-react';

const PWAInstaller = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [debugPanelClosed, setDebugPanelClosed] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      setDebugInfo('App already installed');
      return;
    }

    // Check if PWA criteria are met
    const isPWAReady = () => {
      return (
        'serviceWorker' in navigator &&
        (window.location.protocol === 'https:' || window.location.hostname === 'localhost')
      );
    };

    if (!isPWAReady()) {
      setDebugInfo('PWA criteria not met');
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('PWA: beforeinstallprompt event fired');
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
      setDebugInfo('Install prompt ready');
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA: App installed');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      setDebugInfo('App installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Debug: Check if event has already fired
    setTimeout(() => {
      if (!deferredPrompt && !isInstalled) {
        setDebugInfo('Waiting for install event...');
        console.log('PWA: Waiting for beforeinstallprompt event');
      }
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    console.log('PWA: Showing install prompt');
    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log('PWA: User choice:', outcome);
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Hide for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
    console.log('PWA: Install prompt dismissed for this session');
  };

  const handleClearDismissal = () => {
    sessionStorage.removeItem('pwa-install-dismissed');
    setShowInstallPrompt(true);
    setDebugInfo('Dismissal cleared - prompt should show');
    console.log('PWA: Cleared dismissal flag');
  };

  const handleCloseDebugPanel = () => {
    setDebugPanelClosed(true);
    console.log('PWA: Debug panel closed');
  };

  // Show debug info in development
  const isDev = import.meta.env.DEV;
  const isDismissed = sessionStorage.getItem('pwa-install-dismissed');
  
  // In development, always show something for debugging
  if (isDev && !debugPanelClosed) {
    return (
      <div className="fixed bottom-4 left-4 bg-gray-900 text-white text-xs p-3 rounded z-50 max-w-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold">PWA Debug</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearDismissal}
              className="text-blue-400 hover:text-blue-300"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
            <button
              onClick={handleCloseDebugPanel}
              className="text-gray-400 hover:text-gray-300"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
        <div>Status: {debugInfo || 'Initializing...'}</div>
        <div>Prompt Available: {deferredPrompt ? 'Yes' : 'No'}</div>
        <div>Dismissed: {isDismissed ? 'Yes' : 'No'}</div>
        <div>Installed: {isInstalled ? 'Yes' : 'No'}</div>
        <div className="mt-2 text-xs text-gray-400">
          For PWA testing, use: <code>npm run build && npm run preview</code>
        </div>
      </div>
    );
  }
  
  // Don't show if already installed or dismissed this session
  if (isInstalled || !showInstallPrompt || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Download className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Install DRIMS STAFF PORTAL
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Install our app for quick access and offline functionality
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-3 flex space-x-2">
        <button
          onClick={handleInstallClick}
          disabled={!deferredPrompt}
          className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium py-2 px-3 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  );
};

export default PWAInstaller; 