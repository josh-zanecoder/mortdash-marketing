'use client';
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [baseUrl, setBaseUrl] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Fetch configuration from API
    fetch('/api/config')
      .then(res => res.json())
      .then(config => {
        if (config.mortdash_ae_url) {
          setBaseUrl(config.mortdash_ae_url);
        }
      })
      .catch(err => {
        console.error('Failed to load configuration:', err);
      });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setAtTop(window.scrollY < 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBackClick = (e: React.MouseEvent) => {
    if (!baseUrl) {
      e.preventDefault();
      console.warn('Mortdash URL not yet available');
      return;
    }
  };

  const backToMortdashUrl = baseUrl ? `${baseUrl}/account-executive/dashboard` : '#';

  return (
    <header
      className={`sticky top-0 z-30 w-full transition-all duration-300 ${
        atTop
          ? 'bg-[#fdf6f1] border-b-0 shadow-none'
          : 'bg-white border-b border-[#f3ede7] shadow-lg'
      }`}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 py-4">
        <Link href="/" className="text-3xl font-extrabold tracking-tight text-[#18181a]">
          Mortdash
        </Link>
        {/* Hamburger for mobile */}
        <button
          className="sm:hidden flex flex-col justify-center items-center w-10 h-10"
          aria-label="Open menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className="block w-6 h-0.5 bg-[#18181a] mb-1 rounded transition-all" />
          <span className="block w-6 h-0.5 bg-[#18181a] mb-1 rounded transition-all" />
          <span className="block w-6 h-0.5 bg-[#18181a] rounded transition-all" />
        </button>
        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-2">
          <a 
            href={backToMortdashUrl}
            onClick={handleBackClick}
            className={`inline-flex items-center gap-1 px-3 py-1 text-base font-semibold ${
              !baseUrl ? 'opacity-50 cursor-not-allowed' : ''
            } text-[#18181a] hover:text-[#ff6600] transition-colors`}
          >
            Back to Mortdash CRM
          </a>
          <Link href="/dashboard" className={`px-3 py-1 text-base font-semibold transition-colors rounded-md ${
            pathname === '/dashboard' ? 'text-[#ff6600]' : 'text-[#18181a] hover:text-[#ff6600]'
          }`}>Dashboard</Link>
          <Link href="/marketing/contacts" className={`px-3 py-1 text-base font-semibold transition-colors rounded-md ${
            pathname === '/marketing/contacts' ? 'text-[#ff6600]' : 'text-[#18181a] hover:text-[#ff6600]'
          }`}>Contact</Link>
          <Link href="/marketing/marketing-lists" className={`px-3 py-1 text-base font-semibold transition-colors rounded-md ${
            pathname.startsWith('/marketing/marketing-lists') ? 'text-[#ff6600]' : 'text-[#18181a] hover:text-[#ff6600]'
          }`}>Lists</Link>
          <Link href="/marketing/new-campaign" className={`px-3 py-1 text-base font-semibold transition-colors rounded-md ${
            pathname.startsWith('/marketing/new-campaign') ? 'text-[#ff6600]' : 'text-[#18181a] hover:text-[#ff6600]'
          }`}>Campaign</Link>
          <Link href="/marketing/tracking" className={`px-3 py-1 text-base font-semibold transition-colors rounded-md ${
            pathname.startsWith('/marketing/tracking') ? 'text-[#ff6600]' : 'text-[#18181a] hover:text-[#ff6600]'
          }`}>Tracking</Link>
          <Link href="/marketing/email-editor" className={`px-3 py-1 text-base font-semibold transition-colors rounded-md ${
            pathname.startsWith('/marketing/email-editor') ? 'text-[#ff6600]' : 'text-[#18181a] hover:text-[#ff6600]'
          }`}>Email Builder</Link>
          <Link href="/marketing/email-template" className={`px-3 py-1 text-base font-semibold transition-colors rounded-md ${
            pathname === '/marketing/email-template' ? 'text-[#ff6600]' : 'text-[#18181a] hover:text-[#ff6600]'
          }`}>Upload Template</Link>
        </div>
        {/* Mobile nav menu */}
        {mobileOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-[#f3ede7] shadow-lg flex flex-col items-center py-4 sm:hidden animate-fade-in z-40">
            <a 
              href={backToMortdashUrl}
              onClick={handleBackClick}
              className={`inline-flex items-center justify-center gap-1 py-2 text-lg font-semibold w-full text-center ${
                !baseUrl ? 'opacity-50 cursor-not-allowed' : ''
              } text-[#ff6600] hover:text-[#e65c00] border-b border-[#f3ede7]`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Mortdash CRM
            </a>
            <Link href="/dashboard" className={`py-2 text-lg font-semibold w-full text-center transition-colors ${
              pathname === '/dashboard' ? 'text-[#ff6600]' : 'text-[#18181a] hover:text-[#ff6600]'
            }`} onClick={() => setMobileOpen(false)}>Dashboard</Link>
            <Link href="/marketing/contacts" className={`py-2 text-lg font-semibold w-full text-center transition-colors ${
              pathname === '/marketing/contacts' ? 'text-[#ff6600]' : 'text-[#18181a] hover:text-[#ff6600]'
            }`} onClick={() => setMobileOpen(false)}>Contact</Link>
            <Link href="/marketing/lists" className={`py-2 text-lg font-semibold w-full text-center transition-colors ${
              pathname.startsWith('/marketing/lists') ? 'text-[#ff6600]' : 'text-[#18181a] hover:text-[#ff6600]'
            }`} onClick={() => setMobileOpen(false)}>Lists</Link>
            <Link href="/marketing/campaign-sending" className={`py-2 text-lg font-semibold w-full text-center transition-colors ${
              pathname.startsWith('/marketing/campaign') ? 'text-[#ff6600]' : 'text-[#18181a] hover:text-[#ff6600]'
            }`} onClick={() => setMobileOpen(false)}>Campaign</Link>
            <Link href="/marketing/tracking" className={`py-2 text-lg font-semibold w-full text-center transition-colors ${
              pathname.startsWith('/marketing/tracking') ? 'text-[#ff6600]' : 'text-[#18181a] hover:text-[#ff6600]'
            }`} onClick={() => setMobileOpen(false)}>Tracking</Link>
            <Link href="/marketing/email-editor" className={`py-2 text-lg font-semibold w-full text-center transition-colors ${
              pathname.startsWith('/marketing/email-editor') ? 'text-[#ff6600]' : 'text-[#18181a] hover:text-[#ff6600]'
            }`} onClick={() => setMobileOpen(false)}>Email Builder</Link>
            <Link href="/marketing/email-template" className={`py-2 text-lg font-semibold w-full text-center transition-colors ${
              pathname === '/marketing/email-template' ? 'text-[#ff6600]' : 'text-[#18181a] hover:text-[#ff6600]'
            }`} onClick={() => setMobileOpen(false)}>Upload Template</Link>
          </div>
        )}
      </nav>
    </header>
  );
}
