"use client";

import React, { useCallback, useEffect, useRef } from "react";

export function useTimelineScroll(todayIndex: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasInitiallyScrolledRef = useRef(false);

  const scrollToToday = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      const container = containerRef.current;
      if (!container || todayIndex < 0) return;

      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const todayPixelOffset = todayIndex * 36;
      const leftColOffset = window.innerWidth < 640 ? 132 : 210;
      const targetLeft = Math.max(
        0,
        todayPixelOffset - (container.clientWidth - leftColOffset) / 2 + 36
      );

      container.scrollTo({
        left: targetLeft,
        behavior: prefersReducedMotion ? "auto" : behavior,
      });
    },
    [todayIndex]
  );

  // Scroll to today on initial mount
  useEffect(() => {
    if (!hasInitiallyScrolledRef.current && todayIndex >= 0) {
      const timer = setTimeout(() => {
        scrollToToday("auto");
        hasInitiallyScrolledRef.current = true;
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [todayIndex, scrollToToday]);

  // Sideways scrolling via mouse wheel and trackpad
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.altKey) return;
      if (Math.abs(e.deltaX) > 0) return;

      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return { containerRef, scrollToToday };
}

interface TimelineContainerProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
  className?: string;
}

export function TimelineContainer({
  containerRef,
  children,
  className = "",
}: TimelineContainerProps) {
  return (
    <div
      ref={containerRef}
      className={`timeline-scrollbar flex-1 min-h-0 w-full relative overflow-auto overscroll-x-contain bg-[var(--surface)] ${className}`}
    >
      <div className="inline-flex flex-col min-w-full min-h-full">
        {children}
      </div>
    </div>
  );
}
