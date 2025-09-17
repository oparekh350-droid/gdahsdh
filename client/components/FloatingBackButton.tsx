import React from "react";
import { useLocation } from "react-router-dom";
import BackButton from "@/components/BackButton";

export default function FloatingBackButton() {
  const location = useLocation();
  const path = location.pathname;

  // Show on most feature pages, hide on landing/auth/root
  const shouldShow = (
    path.startsWith("/dashboard") ||
    path.startsWith("/sales") ||
    path.startsWith("/imports")
  ) && path !== "/dashboard";

  if (!shouldShow) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 md:hidden">
      <div className="rounded-full bg-white/90 backdrop-blur border shadow-lg">
        <BackButton showBreadcrumb={false} className="px-3 py-1" />
      </div>
    </div>
  );
}
