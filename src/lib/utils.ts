import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function utcToLocal(utcDateString: string): Date {
  return new Date(utcDateString);
}

export function formatDate(utcDateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = utcToLocal(utcDateString);
  return date.toLocaleDateString("ru-RU", options ?? {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(utcDateString: string): string {
  const date = utcToLocal(utcDateString);
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(utcDateString: string): string {
  const date = utcToLocal(utcDateString);
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function localToUtc(localDate: Date): string {
  return localDate.toISOString();
}
