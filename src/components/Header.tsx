'use client';
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { mortdash_ae_url } from "@/config/mortdash";
import { ArrowLeft } from "lucide-react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setAtTop(window.scrollY < 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        <div className="hidden sm:flex gap-2">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <a 
                    href={`https://ameritrust-test.app.mortdash.com/account-executive/dashboard`}
                    className="inline-flex items-center gap-1 px-3 py-1 text-base font-semibold text-[#18181a] hover:text-[#ff6600] transition-colors"
                  >
                    Back to Mortdash CRM
                  </a>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/dashboard" className="px-3 py-1 text-base font-semibold text-[#18181a] hover:text-[#ff6600] transition-colors">Dashboard</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/marketing/contacts" className="px-3 py-1 text-base font-semibold text-[#18181a] hover:text-[#ff6600] transition-colors">Contact</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/marketing/lists" className="px-3 py-1 text-base font-semibold text-[#18181a] hover:text-[#ff6600] transition-colors">Lists</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/marketing/campaign" className="px-3 py-1 text-base font-semibold text-[#18181a] hover:text-[#ff6600] transition-colors">Campaign</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/marketing/tracking" className="px-3 py-1 text-base font-semibold text-[#18181a] hover:text-[#ff6600] transition-colors">Tracking</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/email-builder" className="px-3 py-1 text-base font-semibold text-[#18181a] hover:text-[#ff6600] transition-colors">Email Builder</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        {/* Mobile nav menu */}
        {mobileOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-[#f3ede7] shadow-lg flex flex-col items-center py-4 sm:hidden animate-fade-in z-40">
            <a 
              href={`https://ameritrust-test.app.mortdash.com/account-executive/dashboard`}
              className="inline-flex items-center justify-center gap-1 py-2 text-lg font-semibold w-full text-center text-[#ff6600] hover:text-[#e65c00] border-b border-[#f3ede7]"
              onClick={() => setMobileOpen(false)}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Mortdash CRM
            </a>
            <Link href="/dashboard" className="py-2 text-lg font-semibold w-full text-center text-[#18181a] hover:text-[#ff6600]" onClick={() => setMobileOpen(false)}>Dashboard</Link>
            <Link href="/marketing/contacts" className="py-2 text-lg font-semibold w-full text-center text-[#18181a] hover:text-[#ff6600]" onClick={() => setMobileOpen(false)}>Contact</Link>
            <Link href="/marketing/lists" className="py-2 text-lg font-semibold w-full text-center text-[#18181a] hover:text-[#ff6600]" onClick={() => setMobileOpen(false)}>Lists</Link>
            <Link href="/marketing/campaign" className="py-2 text-lg font-semibold w-full text-center text-[#18181a] hover:text-[#ff6600]" onClick={() => setMobileOpen(false)}>Campaign</Link>
            <Link href="/marketing/tracking" className="py-2 text-lg font-semibold w-full text-center text-[#18181a] hover:text-[#ff6600]" onClick={() => setMobileOpen(false)}>Tracking</Link>
            <Link href="/email-builder" className="py-2 text-lg font-semibold w-full text-center text-[#18181a] hover:text-[#ff6600]" onClick={() => setMobileOpen(false)}>Email Builder</Link>
          </div>
        )}
      </nav>
    </header>
  );
}
