import BeeFreeEditor from '@/components/BeeFreeEditor';

export default function EmailBuilderPage() {
  return (
    <main className="min-h-screen bg-[#fdf6f1] flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-12 flex flex-col items-center">
        <h1 className="text-4xl font-extrabold text-center text-slate-900 mb-2">Email Builder</h1>
        <p className="text-lg text-slate-600 text-center mb-6 max-w-2xl">
          Effortlessly design beautiful emails with our modern, drag-and-drop builder.<br />
          <span className="text-slate-500">Powered by Beefree SDK integration.</span>
        </p>
        <a
          href="https://docs.beefree.io/beefree-sdk"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mb-8 px-6 py-2 bg-slate-900 text-white rounded-lg font-semibold shadow hover:bg-slate-800 transition"
        >
          📖 Beefree SDK Docs
        </a>
        <div className="w-full flex flex-col items-center justify-center">
          <BeeFreeEditor />
        </div>
      </div>
    </main>
  );
}
