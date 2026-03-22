/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { InterventionOverlay } from './components/InterventionOverlay';
import { Toast } from './components/Toast';
import { useAudioMixer } from './hooks/useAudioMixer';

export default function App() {
  // Initialize audio mixer at the root level
  useAudioMixer();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        },
        (err) => {
          console.log('ServiceWorker registration failed: ', err);
        }
      );
    }
  }, []);

  return (
    <>
      <Dashboard />
      <InterventionOverlay />
      <Toast />
    </>
  );
}
