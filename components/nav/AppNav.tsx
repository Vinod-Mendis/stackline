"use client";

import React, { useEffect, useSyncExternalStore } from "react";
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

const COLLAPSED_KEY = "stackline_sidebar_collapsed";
const collapsedListeners = new Set<() => void>();

function subscribeCollapsed(listener: () => void) {
  collapsedListeners.add(listener);
  return () => {
    collapsedListeners.delete(listener);
  };
}

function getCollapsed(): boolean {
  try {
    return window.localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

function setCollapsed(next: boolean) {
  try {
    window.localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
  } catch {}
  collapsedListeners.forEach((listener) => listener());
}

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 min-w-0 select-none">
      <span
        className="w-7 h-7 rounded-[6px] bg-[var(--accent)] flex items-center justify-center shrink-0"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="var(--on-accent)">
          <rect x="3" y="4" width="12" height="3.5" rx="1.75" />
          <rect x="8" y="10.25" width="13" height="3.5" rx="1.75" />
          <rect x="3" y="16.5" width="9" height="3.5" rx="1.75" />
        </svg>
      </span>
      <span
        className={`text-[14px] font-semibold tracking-tight text-[var(--ink)] whitespace-nowrap transition-opacity duration-200 ${
          collapsed ? "opacity-0" : "opacity-100"
        }`}
      >
        Stackline
      </span>
    </Link>
  );
}

export function AppNav() {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(
    subscribeCollapsed,
    getCollapsed,
    () => false
  );

  const toggleCollapsed = () => setCollapsed(!getCollapsed());

  // Ctrl+B / Cmd+B toggles the sidebar
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return;
      if (e.key.toLowerCase() !== "b") return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) {
        return;
      }
      e.preventDefault();
      setCollapsed(!getCollapsed());
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const toggleLabel = collapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)";

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex shrink-0 flex-col overflow-hidden border-r border-[var(--line)] bg-[var(--sidebar)] transition-[width] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          collapsed ? "w-[56px]" : "w-[220px]"
        }`}
      >
        <div className="group relative h-12 px-[14px] flex items-center justify-between border-b border-[var(--line)] shrink-0">
          <Brand collapsed={collapsed} />
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={toggleLabel}
            aria-expanded={!collapsed}
            title={toggleLabel}
            className={`w-6 h-6 rounded-[6px] flex items-center justify-center shrink-0 text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--hover)] cursor-pointer transition-opacity duration-200 ${
              collapsed
                ? "absolute left-[14px] w-7 h-7 bg-[var(--sidebar)] opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                : ""
            }`}
          >
            <svg
              viewBox="0 0 16 16"
              className={`w-4 h-4 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9.5 4 5.5 8l4 4M13 3v10" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-[10px] py-3 flex flex-col gap-0.5" aria-label="Main navigation">
          <span
            className={`px-2 pb-1.5 text-[11px] font-medium text-[var(--muted)] whitespace-nowrap transition-opacity duration-200 ${
              collapsed ? "opacity-0" : "opacity-100"
            }`}
          >
            Workspace
          </span>
          {NAV_ITEMS.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                className={`h-8 px-[10px] rounded-[6px] flex items-center gap-2.5 text-[13px] font-medium whitespace-nowrap transition-colors ${
                  active
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--hover)]"
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                <span
                  className={`transition-opacity duration-200 ${
                    collapsed ? "opacity-0" : "opacity-100"
                  }`}
                >
                  {item.label}
                </span>
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
