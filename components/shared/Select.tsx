"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
  color?: string;
  disabled?: boolean;
}

interface SelectProps {
  id?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  size?: "md" | "sm";
}

const MENU_MAX_HEIGHT = 240;

export function Select({
  id,
  value,
  options,
  onChange,
  placeholder = "Select...",
  ariaLabel,
  className = "",
  size = "md",
}: SelectProps) {
  const listId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [pos, setPos] = useState<{
    left: number;
    width: number;
    top?: number;
    bottom?: number;
  } | null>(null);

  const selected = options.find((o) => o.value === value);
  const enabledIndexes = options
    .map((o, i) => (o.disabled ? -1 : i))
    .filter((i) => i >= 0);

  const open = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const spaceBelow = window.innerHeight - rect.bottom;
    const menuHeight = Math.min(MENU_MAX_HEIGHT, options.length * 32 + 8);
    const openUp = spaceBelow < menuHeight && rect.top > spaceBelow;
    setPos({
      left: rect.left,
      width: rect.width,
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    });
    const current = options.findIndex((o) => o.value === value);
    setActiveIndex(current >= 0 ? current : (enabledIndexes[0] ?? -1));
    setIsOpen(true);
  };

  const close = useCallback((refocus = true) => {
    setIsOpen(false);
    if (refocus) triggerRef.current?.focus();
  }, []);

  const choose = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    close();
  };

  const move = (dir: 1 | -1) => {
    if (enabledIndexes.length === 0) return;
    const at = enabledIndexes.indexOf(activeIndex);
    const next =
      at === -1
        ? dir === 1
          ? 0
          : enabledIndexes.length - 1
        : (at + dir + enabledIndexes.length) % enabledIndexes.length;
    setActiveIndex(enabledIndexes[next]);
  };

  // Close on outside click, scroll or resize (the menu is positioned from the trigger)
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      close(false);
    };
    const onViewportChange = (e: Event) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      close(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("scroll", onViewportChange, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange, true);
    };
  }, [isOpen, close]);

  // Keep the highlighted option in view
  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    menuRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [isOpen, activeIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        open();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        move(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        move(-1);
        break;
      case "Home":
        e.preventDefault();
        if (enabledIndexes.length) setActiveIndex(enabledIndexes[0]);
        break;
      case "End":
        e.preventDefault();
        if (enabledIndexes.length) {
          setActiveIndex(enabledIndexes[enabledIndexes.length - 1]);
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(activeIndex);
        break;
      case "Escape":
        // Keep Escape from also closing the surrounding dialog
        e.preventDefault();
        e.stopPropagation();
        close();
        break;
      case "Tab":
        close(false);
        break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          const ch = e.key.toLowerCase();
          const match = options.findIndex(
            (o, i) =>
              !o.disabled &&
              i !== activeIndex &&
              o.label.toLowerCase().startsWith(ch)
          );
          if (match >= 0) setActiveIndex(match);
        }
    }
  };

  const heightClass = size === "sm" ? "h-[30px]" : "h-8";

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listId : undefined}
        aria-label={ariaLabel}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleKeyDown}
        className={`field ${heightClass} w-full flex items-center justify-between gap-2 text-left cursor-pointer ${className}`}
      >
        <span className="flex items-center gap-2 min-w-0">
          {selected?.color && (
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: selected.color }}
              aria-hidden="true"
            />
          )}
          <span className={`truncate ${selected ? "" : "text-[var(--muted)]"}`}>
            {selected ? selected.label : placeholder}
          </span>
        </span>
        <svg
          viewBox="0 0 16 16"
          className={`w-3.5 h-3.5 shrink-0 text-[var(--muted)] transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>

      {isOpen && pos && (
        <ul
          ref={menuRef}
          id={listId}
          role="listbox"
          style={{
            position: "fixed",
            left: pos.left,
            width: pos.width,
            top: pos.top,
            bottom: pos.bottom,
            maxHeight: MENU_MAX_HEIGHT,
          }}
          className="z-[70] overflow-y-auto rounded-[8px] border border-[var(--line)] bg-[var(--surface-2)] p-1 shadow-[var(--dialog-shadow)]"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;
            return (
              <li
                key={option.value}
                role="option"
                data-index={index}
                aria-selected={isSelected}
                aria-disabled={option.disabled}
                onPointerEnter={() => !option.disabled && setActiveIndex(index)}
                onClick={() => choose(index)}
                className={`h-8 px-2 rounded-[5px] flex items-center gap-2 text-[13px] ${
                  option.disabled
                    ? "text-[var(--muted)]/50 cursor-not-allowed"
                    : "cursor-pointer text-[var(--ink)]"
                } ${isActive ? "bg-[var(--hover)]" : ""}`}
              >
                {option.color && (
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: option.color }}
                    aria-hidden="true"
                  />
                )}
                <span className="truncate flex-1">{option.label}</span>
                {isSelected && (
                  <svg
                    viewBox="0 0 16 16"
                    className="w-3.5 h-3.5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m3.5 8.5 3 3 6-7" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
