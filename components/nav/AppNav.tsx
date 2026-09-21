"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppNav() {
  const pathname = usePathname();

  const isProjects = pathname === "/";
  const isInterns = pathname.startsWith("/interns");

  return (
    <header className="w-full border-b border-[var(--line)] bg-[var(--bg)] px-3 sm:px-4 shrink-0">
      <div className="flex items-center h-11 gap-6">
        {/* Plain text wordmark in Bricolage Grotesque in the ink color */}
        <Link
          href="/"
          className="font-['var(--font-bricolage)'] text-[17px] font-bold tracking-tight text-[var(--ink)] select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)] rounded"
        >
          Stackline
        </Link>

        {/* Text navigation: 2px underline in ink color for active item, no pills, no icons */}
        <nav className="flex items-center gap-5 h-full" aria-label="Main navigation">
          <Link
            href="/"
            className={`h-full flex items-center text-[13px] font-medium transition-colors border-b-2 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)] ${
              isProjects
                ? "text-[var(--ink)] border-[var(--ink)]"
                : "text-[var(--muted)] hover:text-[var(--ink)] border-transparent"
            }`}
            aria-current={isProjects ? "page" : undefined}
          >
            Projects
          </Link>
          <Link
            href="/interns"
            className={`h-full flex items-center text-[13px] font-medium transition-colors border-b-2 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)] ${
              isInterns
                ? "text-[var(--ink)] border-[var(--ink)]"
                : "text-[var(--muted)] hover:text-[var(--ink)] border-transparent"
            }`}
            aria-current={isInterns ? "page" : undefined}
          >
            Interns
          </Link>
        </nav>
      </div>
    </header>
  );
}
