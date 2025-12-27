import type { DehydratedState } from "@tanstack/svelte-query";
import { env } from "$env/dynamic/public";

export const PROTECTED_PATHS: string[] = ["/app", "/dashboard", "/account"];

const replacements = {
  "<": "\\u003C",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
};
const pattern = new RegExp(`[${Object.keys(replacements).join("")}]`, "g");

export function createDehydratedScript(dehydratedState: DehydratedState) {
  const escaped = JSON.stringify(dehydratedState).replace(
    pattern,
    (match) => replacements[match as keyof typeof replacements],
  );
  return `<script>window.dehydrated = ${escaped}</script>`;
}

export function getSeparator(locale: Intl.LocalesArgument, separatorType: "decimal" | "group") {
  const numberWithGroupAndDecimal = 10000.1;
  const parts = new Intl.NumberFormat(locale).formatToParts(numberWithGroupAndDecimal);
  const separatorPart = parts.find((part) => part.type === separatorType);
  return separatorPart ? separatorPart.value : "N/A";
}

export function getImageContentType(file: string) {
  return file.endsWith(".svg")
    ? "image/svg+xml"
    : file.endsWith("webp")
      ? "image/webp"
      : file.endsWith("png")
        ? "image/png"
        : "image/jpeg";
}

export function getBaseURL() {
  return env["PUBLIC_WEBSITE_URL"] ?? "http://localhost:5173";
}

// Function to get role badge color based on role
export function getRoleBadgeClass(role: "owner" | "admin" | "member"): string {
    return role === "owner"?
       "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400": 
     role == "admin" ?
       "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400": 
       "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
}

export function getStatusBadgeClass(status: "ENABLED" | "DISABLED" ): string {
    return status === "ENABLED"?
       "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
       "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatWorkdays(workdays: string[]): string {
  if (!workdays || workdays.length === 0) return "N/A";

  // Map to short forms
  const shortForms: Record<string, string> = {
    SUN: "Sun",
    MON: "Mon",
    TUE: "Tue",
    WED: "Wed",
    THU: "Thu",
    FRI: "Fri",
    SAT: "Sat",
  };

  return `${shortForms[workdays[0]]} - ${shortForms[workdays[workdays.length - 1]]}`;
}

export function timeToSeconds(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 3600 + minutes * 60;
}

export function secondsToTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

export function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const period = hours < 12 ? "AM" : "PM";
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${hours12.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`;
}


export const noop = () => {}
