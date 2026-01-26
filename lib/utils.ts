import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(priceInCents / 100);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function generateSessionId(): string {
  if (typeof window === 'undefined') return '';
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sessionId = localStorage.getItem('guest_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('guest_session_id', sessionId);
  }
  return sessionId;
}

export function clearSessionId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('guest_session_id');
}
