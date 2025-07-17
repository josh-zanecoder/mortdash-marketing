import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[70vh] w-full px-4">
      <Image
        className="dark:invert mb-8"
        src="/next.svg"
        alt="Next.js logo"
        width={180}
        height={38}
        priority
      />
      <h1 className="text-5xl font-extrabold text-center text-slate-900 mb-4 drop-shadow-sm">
        Welcome to Mortdash Marketing
      </h1>
      <p className="text-lg text-slate-600 text-center mb-8 max-w-2xl">
        Your all-in-one platform for managing contacts, lists, campaigns, tracking, and building beautiful emails.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link href="/dashboard" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition">
          Go to Dashboard
        </Link>
        <Link href="/email-builder" className="px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold shadow hover:bg-slate-800 transition">
          Email Builder
        </Link>
      </div>
    </section>
  );
}
