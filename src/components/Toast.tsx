"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  onClose: () => void;
}

export default function Toast({ message, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = message.includes("sent") || message.includes("Sent");

  return (
    <div
      className={`fixed left-4 right-4 top-[env(safe-area-inset-top,16px)] z-[100] mx-auto max-w-lg transition-all duration-300 ease-out ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
      }`}
    >
      <div className="flex items-center gap-3 rounded-2xl bg-zinc-900 px-4 py-3.5 shadow-2xl dark:bg-zinc-100">
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isSuccess ? "bg-emerald-500" : "bg-zinc-600 dark:bg-zinc-400"}`}>
          {isSuccess ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="white" className="h-3.5 w-3.5">
              <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 01.208 1.04l-5 7.5a.75.75 0 01-1.154.114l-3-3a.75.75 0 011.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 011.04-.207z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="white" className="h-3.5 w-3.5">
              <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm.75-9.25a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5zM8 11a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <p className="text-[13px] font-medium text-white dark:text-zinc-900">
          {message}
        </p>
      </div>
    </div>
  );
}
