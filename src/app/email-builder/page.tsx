import BeeFreeEditor from '@/components/BeeFreeEditor';
import { Toaster } from '@/components/ui/sonner';

export default function EmailBuilderPage() {
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

        {/* Editor */}
        <div className="w-full">
          <BeeFreeEditor />
        </div>
      </div>
    </main>
  );
}
