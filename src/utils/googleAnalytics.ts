const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
const GA_SCRIPT_ID = 'quiz-google-analytics';

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
    __quizGoogleAnalyticsId?: string;
  }
}

function isValidMeasurementId(value: string | undefined): value is string {
  return Boolean(value && /^G-[A-Z0-9]+$/i.test(value));
}

export function initializeGoogleAnalytics(): void {
  if (!import.meta.env.PROD || !isValidMeasurementId(GA_MEASUREMENT_ID)) return;
  if (window.__quizGoogleAnalyticsId === GA_MEASUREMENT_ID) return;

  window.__quizGoogleAnalyticsId = GA_MEASUREMENT_ID;
  window.dataLayer ??= [];
  window.gtag ??= (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID);

  if (!document.getElementById(GA_SCRIPT_ID)) {
    const script = document.createElement('script');
    script.id = GA_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
    document.head.appendChild(script);
  }
}
