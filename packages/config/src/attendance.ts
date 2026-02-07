export const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;
export const ATTENDANCE_STATUS = ["PRESENT", "LATE", "EARLY_LEAVE", "ABSENT", "INCOMPLETE"] as const;

export type Days = (typeof DAYS)[number];
export type AttendanceStatus = (typeof ATTENDANCE_STATUS)[number];
