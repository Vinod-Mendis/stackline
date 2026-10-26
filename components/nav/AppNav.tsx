"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Projects",
    match: (p: string) => p === "/",
    icon: (
      <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M2 4h7M2 8h11M2 12h5" />
      </svg>
    ),
  },
  {
    href: "/interns",
    label: "Interns",
    match: (p: string) => p.startsWith("/interns"),
    icon: (
      <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="5.5" r="2.5" />
        <path d="M1.5 13.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" />
        <path d="M10.5 3.2a2.5 2.5 0 0 1 0 4.6M12 9.8c1.6.5 2.5 1.8 2.5 3.7" />
      </svg>
    ),
  },
];

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5 min-w-0 select-none">
      <span
        className="w-7 h-7 rounded-[6px] bg-[var(--accent)] flex items-center justify-center shrink-0"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#fff">
          <rect x="3" y="4" width="12" height="3.5" rx="1.75" />
          <rect x="8" y="10.25" width="13" height="3.5" rx="1.75" />
          <rect x="3" y="16.5" width="9" height="3.5" rx="1.75" />
        </svg>
      </span>
      <span className="text-[14px] font-semibold tracking-tight text-[var(--ink)] truncate">
        Stackline
      </span>
    </Link>
  );
}

export function AppNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[220px] shrink-0 flex-col border-r border-[var(--line)] bg-[var(--sidebar)]">
        <div className="h-12 px-4 flex items-center border-b border-[var(--line)]">
          <Brand />
        </div>
        <nav className="flex-1 px-2.5 py-3 flex flex-col gap-0.5" aria-label="Main navigation">
          <span className="px-2 pb-1.5 text-[11px] font-medium text-[var(--muted)]">
            Workspace
          </span>
          {NAV_ITEMS.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`h-8 px-2 rounded-[6px] flex items-center gap-2.5 text-[13px] font-medium transition-colors ${
                  active
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--hover)]"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden shrink-0 border-b border-[var(--line)] bg-[var(--sidebar)] px-3 h-12 flex items-center justify-between gap-4">
        <Brand />
        <nav className="flex items-center gap-1" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`h-8 px-2.5 rounded-[6px] flex items-center gap-2 text-[13px] font-medium ${
                  active
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--muted)]"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}
