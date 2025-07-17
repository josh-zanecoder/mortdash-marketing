export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white/80 py-4 text-center text-slate-500 text-sm mt-12">
      © {new Date().getFullYear()} Mortdash Marketing. All rights reserved.
    </footer>
  );
}
