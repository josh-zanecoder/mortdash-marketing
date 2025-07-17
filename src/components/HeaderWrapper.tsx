"use client";
import Header from "./Header";
import { usePathname } from "next/navigation";

export default function HeaderWrapper() {
  const pathname = usePathname();
  if (pathname === "/dashboard") return null;
  return <Header />;
} 