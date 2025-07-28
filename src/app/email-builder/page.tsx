'use client';
import BeeFreeEditor from '@/components/BeeFreeEditor';
import { Toaster } from '@/components/ui/sonner';
import { useState } from 'react';

export default function EmailBuilderPage() {
  const [loading, setLoading] = useState(true);

  return (
    <main className="min-h-screen bg-[#fdf6f1] flex flex-col items-center justify-center py-12 px-4">
      <Toaster />
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg border border-gray-200 p-8 md:p-12">
        {/* Simple Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Email Builder
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl">
            Create professional email templates with our intuitive drag-and-drop editor
          </p>
        </div>
        {/* Loader */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-[800px]">
            <div className="w-12 h-12 border-4 border-orange-300 border-t-[#ff6600] rounded-full animate-spin mb-4"></div>
            <div className="text-gray-500 text-lg">Loading Email Builder...</div>
          </div>
        )}
        {/* Editor */}
        <div id="bee-plugin-container" className="w-full h-[800px] border rounded-lg overflow-hidden" style={{ display: loading ? 'none' : 'block' }}>
          <BeeFreeEditor onLoad={() => setLoading(false)} />
        </div>
      </div>
    </main>
  );
}
