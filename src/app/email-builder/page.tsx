import BeeFreeEditor from '@/components/BeeFreeEditor';

export default function EmailBuilderPage() {
  return (
    <main className="min-h-screen bg-[#fdf6f1] flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-12 flex flex-col items-center">
        <h1 className="text-4xl font-extrabold text-center text-slate-900 mb-2">Email Builder</h1>
        <div className="w-full flex flex-col items-center justify-center">
          <BeeFreeEditor />
        </div>
      </div>
    </main>
  );
}
