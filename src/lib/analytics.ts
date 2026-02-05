import { AnalyticsEvent } from './types';

const STORAGE_KEY = 'crashguard_analytics';

export function trackEvent(type: AnalyticsEvent['type'], label: string, metadata?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  const event: AnalyticsEvent = {
    id: Math.random().toString(36).substring(2, 11),
    type,
    label,
    timestamp: new Date().toISOString(),
    metadata
  };

  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    localStorage.setItem(STORAGE_KEY, JSON.stringify([event, ...existing].slice(0, 1000)));
  } catch (e) {
    console.error('Analytics tracking failed', e);
  }
}

export function getAnalytics() {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}
