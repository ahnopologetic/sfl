'use client';

import { Toaster as HotToaster } from "react-hot-toast";

export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
        },
        success: {
          style: {
            border: "1px solid hsl(var(--success))",
          },
        },
        error: {
          style: {
            border: "1px solid hsl(var(--destructive))",
          },
        },
      }}
    />
  );
} 