"use client";

import React, { useEffect, useRef } from "react";

interface ModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  titleId?: string;
  className?: string;
  children: React.ReactNode;
}

export function ModalDialog({
  isOpen,
  onClose,
  titleId,
  className = "max-w-lg",
  children,
}: ModalDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      className={`stackline-dialog fixed inset-0 m-auto z-50 w-full rounded-[8px] p-0 text-[var(--ink)] bg-[var(--surface)] border border-[var(--line)] backdrop:bg-black/40 dark:backdrop:bg-black/65 backdrop:backdrop-blur-none ${className}`}
      aria-labelledby={titleId}
    >
      {children}
    </dialog>
  );
}
