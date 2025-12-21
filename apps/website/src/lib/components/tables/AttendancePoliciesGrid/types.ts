import type { Day } from "@repo/db";
import type { TIMEZONE } from "@repo/db/timezone";

export type AttendancePolicy = {
  id: string;
  name?: string | null;
  enabled: boolean;
  timezone: (typeof TIMEZONE)[number];
  offset: string;
  clockIn: number;
  clockOut: number;
  workdays: Day[];
  updatedAt: Date;
};

