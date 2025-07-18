'use client';

import { useEffect, useRef } from 'react';
import BeefreeSDK from '@beefree.io/sdk';

export default function BeefreeEditor() {
  // Create a reference to the DOM element where the editor will be mounted
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize the editor once when the component mounts
  useEffect(() => {
    async function initializeEditor() {
      // Beefree SDK configuration object
      // container: (required) The ID of the DOM element where the editor will be mounted
      // language: (optional) The language for the editor UI
      // onSave: Callback when user saves - returns both JSON structure and HTML output
      // onError: Callback for handling errors like token expiration
      const beeConfig = {
        container: 'beefree-react-demo',
        language: 'en-US',
        onSave: (pageJson: string, pageHtml: string, ampHtml: string | null, templateVersion: number, language: string | null) => {
          console.log('Saved!', { pageJson, pageHtml, ampHtml, templateVersion, language });
          // TODO: Implement your save logic here
          // pageJson: Contains the template structure
          // pageHtml: Contains the rendered HTML output
        },
        onError: (error: unknown) => {
          console.error('Error:', error);
          // TODO: Implement your error handling here
          // Common errors: token expiration, network issues
        }
      };

      try {
        // Get authentication token from the Next.js API route
        const token = await fetch('/api/proxy/bee-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: 'demo-user' })
        }).then(res => res.json());

        // Initialize the Beefree SDK with the authentication token
        const bee = new BeefreeSDK(token);
        // Start the editor with our configuration
        bee.start(beeConfig, {});
      } catch (error) {
        console.error('Failed to initialize Beefree editor:', error);
      }
    }

    initializeEditor();
  }, []); // Empty dependency array ensures this only runs once on mount

  // Render the container div where Beefree SDK will mount the editor
  return (
    <div
      id="beefree-react-demo"
      ref={containerRef}
      style={{
        height: '600px',
        width: '90%',
        margin: '20px auto',
        border: '1px solid #ddd',
        borderRadius: '8px'
      }}
    />
  );
}
