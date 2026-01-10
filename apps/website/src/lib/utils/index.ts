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
  return role === "owner"
    ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
    : role === "admin"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
}

export function getStatusBadgeClass(status: "ENABLED" | "DISABLED"): string {
  return status === "ENABLED"
    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
}

export function getAttendanceStatusBadgeClass(
  status: "PRESENT" | "LATE" | "EARLY_LEAVE" | "ABSENT" | "INCOMPLETE",
): string {
  switch (status) {
    case "PRESENT":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "LATE":
    case "EARLY_LEAVE":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    case "ABSENT":
    case "INCOMPLETE":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
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

export const noop = () => {};

export function getNameIntials(name: string) {
  const split = name.split(" ");
  const firstWord = split.at(0)?.at(0)?.toUpperCase();
  const secondWord = split.at(1)?.at(0)?.toUpperCase() ?? split.at(0)?.at(1)?.toUpperCase();
  return { firstWord, secondWord };
}

export function getDaysDifference(date1: Date, date2: Date) {
  const oneDay = 1000 * 60 * 60 * 24;
  const differenceMs = Math.abs(date1.getTime() - date2.getTime());
  const differenceDays = Math.floor(differenceMs / oneDay);
  return differenceDays;
}

/**
 * Calculate the leave year number based on member's join date.
 *
 * Leave year 0 starts from the join date and ends one day before the next anniversary.
 * Leave year 1 starts from the first anniversary, and so on.
 *
 * @param joinedDate - The date when the member joined the organization
 * @param currentDate - The current date to calculate the leave year for
 * @returns The leave year number (0, 1, 2, ...)
 *
 * @example
 * // Joined Dec 15, 2025
 * getLeaveYearNumber(new Date('2025-12-15'), new Date('2026-01-01')) // returns 0
 * getLeaveYearNumber(new Date('2025-12-15'), new Date('2026-12-15')) // returns 1
 * getLeaveYearNumber(new Date('2025-12-15'), new Date('2027-12-15')) // returns 2
 */
export function getLeaveYearNumber(joinedDate: Date, currentDate: Date): number {
  const joinedYear = joinedDate.getUTCFullYear();
  const currentYear = currentDate.getUTCFullYear();
  const joinedMonth = joinedDate.getUTCMonth();
  const joinedDay = joinedDate.getUTCDate();
  const currentMonth = currentDate.getUTCMonth();
  const currentDay = currentDate.getUTCDate();

  // Calculate the difference in years
  let yearsDiff = currentYear - joinedYear;

  // If current month/day is before the joined month/day,
  // we're still in the previous leave year
  if (currentMonth < joinedMonth || (currentMonth === joinedMonth && currentDay < joinedDay)) {
    yearsDiff -= 1;
  }

  return yearsDiff;
}

/**
 * Get the start and end dates for a specific leave year.
 *
 * @param joinedDate - The date when the member joined the organization
 * @param leaveYearNumber - The leave year number (0, 1, 2, ...)
 * @returns Object with startDate and endDate as Date objects
 *
 * @example
 * // Joined Dec 15, 2025
 * getLeaveYearDates(new Date('2025-12-15'), 0)
 * // returns { startDate: 2025-12-15, endDate: 2026-12-14 }
 */
export function getLeaveYearDates(
  joinedDate: Date,
  leaveYearNumber: number,
): {
  startDate: Date;
  endDate: Date;
} {
  const startDate = new Date(joinedDate);
  startDate.setUTCFullYear(startDate.getUTCFullYear() + leaveYearNumber);
  startDate.setUTCHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setUTCFullYear(endDate.getUTCFullYear() + 1);
  endDate.setUTCDate(endDate.getUTCDate() - 1);
  endDate.setUTCHours(23, 59, 59, 999);

  return { startDate, endDate };
}

export function getYMDToday() {
  const today = new Date();
  const year = today.getFullYear();

  // getMonth() is zero-based, so add 1
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}
