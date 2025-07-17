'use client';

import { useEffect, useRef } from 'react';

// Extend the Window interface to include BeePlugin
declare global {
  interface Window {
    BeePlugin: any;
  }
}

export default function BeeFreeEditor() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamically load BeePlugin.js if not already loaded
    function loadBeePluginScript(): Promise<void> {
      return new Promise((resolve, reject) => {
        if (window.BeePlugin) return resolve();
        const script = document.createElement('script');
        script.src = 'https://app-rsrc.getbee.io/plugin/BeePlugin.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load BeePlugin.js'));
        document.body.appendChild(script);
      });
    }

    async function initializeEditor() {
      try {
        await loadBeePluginScript();
        const res = await fetch('/api/email-builder-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: 'demo-user' }),
        });
        const data = await res.json();
        const token = data.token || data.access_token;
        if (!token) throw new Error(data.error || 'No token received');
        if (!containerRef.current) throw new Error('Container ref is null');

        const beeConfig = {
          container: containerRef.current.id,
          language: 'en-US',
          onSave: (jsonFile: string, htmlFile: string) => {
            console.log('Saved!', { jsonFile, htmlFile });
          },
          onError: (error: unknown) => {
            console.error('Editor error:', error);
          },
        };

        window.BeePlugin.create(token, beeConfig, (beeInstance: any) => {
          // Optionally store beeInstance for later use
          beeInstance.start();
        });
      } catch (err: any) {
        console.error('Editor init failed:', err);
      }
    }

    initializeEditor();
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div
        id="beefree-react-demo"
        ref={containerRef}
        className="w-full min-h-[600px] bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center"
        style={{ maxWidth: 1200 }}
      />
    </div>
  );
}
