// Simple typings & helpers
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export const GA_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID || "G-NSQ5VN8HDW";

export function gtag(...args: any[]) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(arguments);
  if (typeof window.gtag === "function") {
    window.gtag(...args);
  }
}

export function sendPageview(path: string) {
  if (!GA_ID) return;
  window.gtag?.("event", "page_view", {
    page_title: document.title,
    page_location: window.location.href,
    page_path: path,
  });
}

export function sendEvent(
  action: string,
  params?: Record<string, any>
) {
  if (!GA_ID) return;
  window.gtag?.("event", action, params);
}
