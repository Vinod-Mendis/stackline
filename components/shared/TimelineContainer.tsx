"use client";

import React, { useCallback, useEffect, useRef } from "react";

export function useTimelineScroll(todayIndex: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasInitiallyScrolledRef = useRef(false);
  const animationRef = useRef<number | null>(null);

  const cancelAnimation = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const scrollToToday = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      const container = containerRef.current;
      if (!container || todayIndex < 0) return;

      const todayPixelOffset = todayIndex * 36;
      const leftColOffset = window.innerWidth < 640 ? 132 : 210;
      const targetLeft = Math.max(
        0,
        todayPixelOffset - (container.clientWidth - leftColOffset) / 2 + 36
      );

      cancelAnimation();

      const startLeft = container.scrollLeft;
      const distance = targetLeft - startLeft;
      if (behavior === "auto" || Math.abs(distance) < 1) {
        container.scrollLeft = targetLeft;
        return;
      }

      // Hand-rolled easing so the glide is consistent (native smooth scrolling
      // is cut short or skipped by some OS animation settings). Longer trips
      // take longer, within 450-900ms.
      const duration = Math.min(900, Math.max(450, Math.abs(distance) * 0.6));
      const startTime = performance.now();
      const easeInOutCubic = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const step = (now: number) => {
        const t = Math.min(1, (now - startTime) / duration);
        container.scrollLeft = startLeft + distance * easeInOutCubic(t);
        animationRef.current = t < 1 ? requestAnimationFrame(step) : null;
      };
      animationRef.current = requestAnimationFrame(step);
    },
    [todayIndex, cancelAnimation]
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
      cancelAnimation();
      if (e.ctrlKey || e.altKey) return;
      if (Math.abs(e.deltaX) > 0) return;

      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", cancelAnimation, { passive: true });
    container.addEventListener("pointerdown", cancelAnimation, { passive: true });
    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", cancelAnimation);
      container.removeEventListener("pointerdown", cancelAnimation);
      cancelAnimation();
    };
  }, [cancelAnimation]);

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
