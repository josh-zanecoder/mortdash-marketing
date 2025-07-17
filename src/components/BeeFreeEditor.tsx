'use client';

import { useEffect, useRef } from 'react';
import BeefreeSDK from '@beefree.io/sdk';

export default function BeeFreeEditor() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function initializeEditor() {
      try {
        const beeConfig = {
          container: 'beefree-react-demo',
          language: 'en-US',
          onSave: (pageJson: string, pageHtml: string, ampHtml: string | null, templateVersion: number, language: string | null) => {
            console.log('Saved!', { pageJson, pageHtml, ampHtml, templateVersion, language });
          },
          onError: (error: unknown) => {
            console.error('Error:', error);
          }
        };

        const res = await fetch('/api/email-builder-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: 'demo-user' })
        });
        const data = await res.json();
        const token = data.token || data.access_token;
        if (!token) throw new Error(data.error || 'No token received');

        if (!containerRef.current) {
          throw new Error('Container ref is null');
        }

        const bee = new BeefreeSDK(token);
        bee.start(beeConfig, {});
      } catch (err: any) {
        // Optionally handle error
        console.error(err);
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
