/**
 * Database Seeding Script
 *
 * This script seeds the database with test data including:
 * - 1 organization (Acme Corporation)
 * - 10 users with verified email addresses
 * - 10 credential-based accounts (email/password)
 * - 10 members (1 admin, 9 regular members)
 * - 3 attendance policies with different schedules
 * - 3 pending invitations
 * - ~3 months of realistic attendance data for all members
 *
 * Usage:
 *   bun run packages/db/src/seed.ts
 *
 * To clear existing data before seeding:
 *   CLEAR_DB=true bun run packages/db/src/seed.ts
 *
 * Environment Variables:
 *   DATABASE_URL - Database connection string (default: file:../../databases/gakom.db)
 *   CLEAR_DB - Set to "true" to clear all data before seeding
 */

import { and, eq } from "drizzle-orm";
import { connect } from "./index";
import type { AttendanceLocation, Day } from "./schema/attendance";
import { attendance, attendancePolicy } from "./schema/attendance";
import { account, user } from "./schema/core";
import { leave, leaveBalance, leaveBalanceAdjustment, leaveRequest } from "./schema/leave";
import { invitation, member, organization } from "./schema/organization";

// Database connection
const DATABASE_URL = process.env.DATABASE_URL || "file:../../databases/gakom.db";
const db = connect(DATABASE_URL);

// Helper function to generate a date offset from today
function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function daysAhead(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

// Helper function to check if a date is a workday according to policy
function isWorkday(date: Date, workdays: Day[]): boolean {
  const dayNames: Day[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const dayOfWeek = dayNames[date.getDay()];
  return workdays.includes(dayOfWeek);
}

// Helper function to add random minutes variance to time
function addMinutesVariance(baseSeconds: number, varianceMinutes: number): number {
  const varianceSeconds = (Math.random() * 2 - 1) * varianceMinutes * 60;
  return Math.floor(baseSeconds + varianceSeconds);
}

// Helper function to create a timestamp for a specific date and time in seconds
function createTimestamp(date: Date, timeInSeconds: number): Date {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

// Helper function to hash password (simple for demo - use proper hashing in production)
function hashPassword(password: string): string {
  // In production, use bcrypt or similar
  // For seeding purposes, we'll store a simple hash indicator
  return `hashed_${password}`;
}

// Helper function to convert date to policy timezone and return local date string
function getDateInTimezone(date: Date, timezone: string): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  const formatter = new Intl.DateTimeFormat("en-CA", options);
  return formatter.format(date);
}

async function main() {
  console.log("🌱 Starting database seeding...");

  // Optional: Clear existing data (set CLEAR_DB=true environment variable)
  if (process.env.CLEAR_DB === "true") {
    console.log("🗑️  Clearing existing data...");
    await db.delete(attendance);
    await db.delete(leaveBalanceAdjustment);
    await db.delete(leaveRequest);
    await db.delete(leaveBalance);
    await db.delete(invitation);
    await db.delete(member);
    await db.delete(attendancePolicy);
    await db.delete(leave);
    await db.delete(account);
    await db.delete(organization);
    await db.delete(user);
    console.log("✨ Database cleared!");
  }

  // 1. Create Organization
  console.log("📦 Creating organization...");
  const orgId = crypto.randomUUID();
  await db.insert(organization).values({
    id: orgId,
    name: "Acme Corporation",
    slug: "acme-corp",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=AC",
    countryCode: "US",
    metadata: JSON.stringify({ industry: "Technology", size: "50-100" }),
  });

  // 2. Create Users and Accounts
  console.log("👥 Creating users and accounts...");
  const userNames = [
    { name: "John Doe", email: "john.doe@acme.com", city: "New York", role: "admin" },
    { name: "Jane Smith", email: "jane.smith@acme.com", city: "Los Angeles", role: "member" },
    { name: "Bob Johnson", email: "bob.johnson@acme.com", city: "Chicago", role: "member" },
    { name: "Alice Williams", email: "alice.williams@acme.com", city: "Houston", role: "member" },
    { name: "Charlie Brown", email: "charlie.brown@acme.com", city: "Phoenix", role: "member" },
    { name: "Diana Prince", email: "diana.prince@acme.com", city: "Philadelphia", role: "member" },
    { name: "Eve Martinez", email: "eve.martinez@acme.com", city: "San Antonio", role: "member" },
    { name: "Frank Miller", email: "frank.miller@acme.com", city: "San Diego", role: "member" },
    { name: "Grace Lee", email: "grace.lee@acme.com", city: "Dallas", role: "member" },
    { name: "Henry Wilson", email: "henry.wilson@acme.com", city: "San Jose", role: "member" },
  ];

  const userIds: { id: string; role: string }[] = [];

  for (const userData of userNames) {
    const userId = crypto.randomUUID();
    await db.insert(user).values({
      id: userId,
      name: userData.name,
      email: userData.email,
      emailVerified: true,
      twoFactorEnabled: false,
      address: `${Math.floor(Math.random() * 9999)} Main St`,
      city: userData.city,
      countryCode: "US",
    });

    // Create credential account for each user
    await db.insert(account).values({
      id: crypto.randomUUID(),
      accountId: userData.email,
      providerId: "credential",
      userId: userId,
      password: hashPassword("password123"),
    });

    userIds.push({ id: userId, role: userData.role });
  }

  // 3. Create Attendance Policies
  console.log("📋 Creating attendance policies...");
  const policies = [
    {
      id: crypto.randomUUID(),
      name: "Standard Weekday Schedule",
      timezone: "America/New_York" as const,
      clockInSec: 9 * 3600, // 9:00 AM
      clockOutSec: 17 * 3600, // 5:00 PM
      workdays: ["MON", "TUE", "WED", "THU", "FRI"] as Day[],
      organizationId: orgId,
    },
    {
      id: crypto.randomUUID(),
      name: "Six Day Work Week",
      timezone: "Asia/Tokyo" as const,
      clockInSec: 8 * 3600, // 8:00 AM
      clockOutSec: 16 * 3600, // 4:00 PM
      workdays: ["MON", "TUE", "WED", "THU", "FRI", "SAT"] as Day[],
      organizationId: orgId,
    },
    {
      id: crypto.randomUUID(),
      name: "Middle East Schedule",
      timezone: "Asia/Dubai" as const,
      clockInSec: 10 * 3600, // 10:00 AM
      clockOutSec: 18 * 3600, // 6:00 PM
      workdays: ["SUN", "MON", "TUE", "WED", "THU"] as Day[],
      organizationId: orgId,
    },
  ];

  for (const policy of policies) {
    await db.insert(attendancePolicy).values(policy);
  }

  // 4. Create Members with varied join dates (for tenure calculation)
  console.log("👔 Creating members...");
  const memberRecords: {
    id: string;
    userId: string;
    memberId: string;
    policyId: string;
    policyData: (typeof policies)[0];
    createdAt: Date;
  }[] = [];

  // Member tenure configurations (0-3 years)
  const memberTenures = [
    { yearsAgo: 3, monthsAgo: 0 }, // 3 years tenure
    { yearsAgo: 2, monthsAgo: 6 }, // 2.5 years tenure
    { yearsAgo: 2, monthsAgo: 0 }, // 2 years tenure
    { yearsAgo: 1, monthsAgo: 6 }, // 1.5 years tenure
    { yearsAgo: 1, monthsAgo: 0 }, // 1 year tenure
    { yearsAgo: 0, monthsAgo: 9 }, // 0.75 years tenure
    { yearsAgo: 0, monthsAgo: 6 }, // 0.5 years tenure
    { yearsAgo: 0, monthsAgo: 3 }, // 0.25 years tenure
    { yearsAgo: 0, monthsAgo: 1 }, // ~1 month tenure
    { yearsAgo: 0, monthsAgo: 0 }, // Just joined
  ];

  function calculateJoinDate(yearsAgo: number, monthsAgo: number): Date {
    const date = new Date();
    date.setFullYear(date.getFullYear() - yearsAgo);
    date.setMonth(date.getMonth() - monthsAgo);
    date.setDate(1);
    date.setHours(9, 0, 0, 0);
    return date;
  }

  for (let i = 0; i < userIds.length; i++) {
    const policyIndex = i % 3;
    const policy = policies[policyIndex];
    const tenure = memberTenures[i] || memberTenures[memberTenures.length - 1];
    const joinDate = calculateJoinDate(tenure.yearsAgo, tenure.monthsAgo);

    const memberId = crypto.randomUUID();
    await db.insert(member).values({
      id: memberId,
      organizationId: orgId,
      userId: userIds[i].id,
      attendancePolicyId: policy.id,
      role: userIds[i].role,
      position: i === 0 ? "CEO" : i < 3 ? "Manager" : "Employee",
      createdAt: joinDate,
    });

    memberRecords.push({
      id: memberId,
      userId: userIds[i].id,
      memberId: memberId,
      policyId: policy.id,
      policyData: policy,
      createdAt: joinDate,
    });
  }

  // 5. Create Invitations
  console.log("✉️ Creating invitations...");
  const inviterUserId = userIds[0].id; // First user (admin) is the inviter
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7); // Expires in 7 days

  const invitations = [
    {
      email: "sarah.connor@example.com",
      role: "member",
      position: "Developer",
      status: "pending",
    },
    {
      email: "kyle.reese@example.com",
      role: "member",
      position: "Designer",
      status: "pending",
    },
    {
      email: "john.connor@example.com",
      role: "member",
      position: "Product Manager",
      status: "canceled",
    },
  ];

  for (const inv of invitations) {
    await db.insert(invitation).values({
      id: crypto.randomUUID(),
      organizationId: orgId,
      email: inv.email,
      role: inv.role,
      position: inv.position,
      status: "pending",
      expiresAt: futureDate,
      attendancePolicyId: policies[0].id,
      inviterId: inviterUserId,
    });
  }

  // 6. Generate 3 months of attendance data
  console.log("🕐 Generating 3 months of attendance data...");
  const DAYS_TO_GENERATE = 90;

  // Base office location (New York coordinates with slight variations)
  const baseLatitude = 40.7128;
  const baseLongitude = -74.006;

  let attendanceCount = 0;

  for (const memberRecord of memberRecords) {
    const policy = memberRecord.policyData;

    for (let dayOffset = DAYS_TO_GENERATE; dayOffset >= 0; dayOffset--) {
      const date = daysAgo(dayOffset);

      // Check if this date is a workday for this policy
      if (!isWorkday(date, policy.workdays)) {
        continue;
      }

      // Generate check-in and check-out times with variance
      let checkInTime = addMinutesVariance(policy.clockInSec, 30);
      let checkOutTime = addMinutesVariance(policy.clockOutSec, 30);

      // Apply status distribution
      const statusRoll = Math.random();
      let status: "PRESENT" | "LATE" | "EARLY_LEAVE";

      if (statusRoll < 0.7) {
        // 70% PRESENT - already on time
        status = "PRESENT";
      } else if (statusRoll < 0.9) {
        // 20% LATE - add 15-60 minutes late
        checkInTime += (15 + Math.random() * 45) * 60;
        status = "LATE";
      } else {
        // 10% EARLY_LEAVE - subtract 15-60 minutes from checkout
        checkOutTime -= (15 + Math.random() * 45) * 60;
        status = "EARLY_LEAVE";
      }

      const checkInTimestamp = createTimestamp(date, checkInTime);
      const checkOutTimestamp = createTimestamp(date, checkOutTime);

      // Calculate worked seconds
      const workedSeconds = Math.floor(
        (checkOutTimestamp.getTime() - checkInTimestamp.getTime()) / 1000,
      );

      // Get date string in policy timezone
      const dateInTimezone = getDateInTimezone(date, policy.timezone);

      // Generate location data
      const checkInLocation: AttendanceLocation = {
        latitude: baseLatitude + (Math.random() * 0.01 - 0.005),
        longitude: baseLongitude + (Math.random() * 0.01 - 0.005),
        accuracy: 10 + Math.random() * 40,
      };

      const checkOutLocation: AttendanceLocation = {
        latitude: baseLatitude + (Math.random() * 0.01 - 0.005),
        longitude: baseLongitude + (Math.random() * 0.01 - 0.005),
        accuracy: 10 + Math.random() * 40,
      };

      await db.insert(attendance).values({
        id: crypto.randomUUID(),
        userId: memberRecord.userId,
        memberId: memberRecord.id,
        organizationId: orgId,
        attendancePolicyId: policy.id,
        date: dateInTimezone,
        checkInAt: checkInTimestamp,
        checkOutAt: checkOutTimestamp,
        checkInLocation,
        checkOutLocation,
        workedSeconds,
        status,
        updatedAt: checkOutTimestamp,
      });

      attendanceCount += 1;
    }
  }

  // 7. Create Leave Types
  console.log("🏖️ Creating leave types...");
  const leaveTypes = [
    {
      id: crypto.randomUUID(),
      name: "Annual Leave",
      days: 10,
    },
    {
      id: crypto.randomUUID(),
      name: "Sick Leave",
      days: 5,
    },
    {
      id: crypto.randomUUID(),
      name: "Personal Leave",
      days: 10,
    },
  ];

  for (const leaveTypeData of leaveTypes) {
    await db.insert(leave).values({
      id: leaveTypeData.id,
      name: leaveTypeData.name,
      days: leaveTypeData.days,
      organizationId: orgId,
    });
  }

  // 8. Create Leave Requests and track approved ones for adjustments
  console.log("📝 Creating leave requests...");
  const memberIds: {
    userId: string;
    memberId: string;
    policyId: string;
  }[] = [];
  const approvedLeaveRequests: {
    memberId: string;
    leaveId: string;
    days: number;
    requestId: string;
  }[] = [];

  // First collect member IDs
  for (const memberRecord of memberRecords) {
    const [memberData] = await db
      .select({ id: member.id })
      .from(member)
      .where(eq(member.userId, memberRecord.userId));

    if (memberData) {
      memberIds.push({
        userId: memberRecord.userId,
        memberId: memberData.id,
        policyId: memberRecord.policyId,
      });
    }
  }

  let leaveRequestsCount = 0;
  // Generate leave requests for each member
  for (const memberData of memberIds) {
    const numRequests = Math.floor(Math.random() * 3) + 1; // 1-3 leave requests per member

    for (let i = 0; i < numRequests; i++) {
      leaveRequestsCount += 1;
      const leaveTypeIndex = Math.floor(Math.random() * leaveTypes.length);
      const leaveTypeData = leaveTypes[leaveTypeIndex];

      // Random start date within the last 3 months
      const startDaysAgo = Math.floor(Math.random() * 80);
      const startDate = daysAhead(startDaysAgo);
      const duration = Math.floor(Math.random() * 3) + 1; // 1-3 days duration
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + duration);

      // Random status with weighted probability
      const statusRoll = Math.random();
      let status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" = "PENDING";
      let reviewerId: string | undefined;
      let reviewedAt: Date | undefined;

      if (statusRoll > 0.7) {
        status = "APPROVED";
        // First member (admin) reviews requests
        if (memberIds.length > 0) {
          reviewerId = memberIds[0].memberId;
          reviewedAt = new Date();
          // Track approved request for later adjustment
          approvedLeaveRequests.push({
            memberId: memberData.memberId,
            leaveId: leaveTypeData.id,
            days: duration,
            requestId: "", // Will be filled after insert
          });
        }
      } else if (statusRoll > 0.85) {
        status = "REJECTED";
        if (memberIds.length > 0) {
          reviewerId = memberIds[0].memberId;
          reviewedAt = new Date();
        }
      } else if (statusRoll > 0.95) {
        status = "CANCELLED";
      }

      const requestId = crypto.randomUUID();
      await db.insert(leaveRequest).values({
        id: requestId,
        memberId: memberData.memberId,
        leaveId: leaveTypeData.id,
        startDate: startDate,
        endDate: endDate,
        status: status,
        reason: `${leaveTypeData.name} request for ${duration} day(s)`,
        reviewerId: reviewerId,
        reviewedAt: reviewedAt,
      });

      // Update the last approved request with its ID
      if (status === "APPROVED" && approvedLeaveRequests.length > 0) {
        approvedLeaveRequests[approvedLeaveRequests.length - 1].requestId = requestId;
      }
    }
  }

  // 9. Create Leave Balances based on member tenure
  console.log("📊 Creating leave balances...");
  let leaveBalancesCount = 0;

  for (const memberRecord of memberRecords) {
    // Calculate tenure years (0, 1, 2, 3) based on createdAt and current date
    const currentDate = new Date();
    const joinDate = memberRecord.createdAt;
    const tenureYears = Math.floor(
      (currentDate.getTime() - joinDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
    );

    // For each leave type, create a balance for current tenure year
    for (const leaveTypeData of leaveTypes) {
      const year = tenureYears;
      // Base days + 1 extra day per year of tenure
      const totalDays = leaveTypeData.days + year;

      await db.insert(leaveBalance).values({
        id: crypto.randomUUID(),
        memberId: memberRecord.memberId,
        leaveId: leaveTypeData.id,
        totalDays: totalDays,
        usedDays: 0,
        pendingDays: 0,
        year: year,
      });

      leaveBalancesCount++;
    }
  }

  // 10. Create Leave Balance Adjustments for approved requests
  console.log("📝 Creating leave balance adjustments...");
  let leaveBalanceAdjustmentsCount = 0;

  for (const approvedRequest of approvedLeaveRequests) {
    // Find the appropriate leave balance
    const [balanceRecord] = await db
      .select()
      .from(leaveBalance)
      .where(
        and(
          eq(leaveBalance.memberId, approvedRequest.memberId),
          eq(leaveBalance.leaveId, approvedRequest.leaveId),
        ),
      );

    if (balanceRecord) {
      // Create usage adjustment for the approved leave request
      await db.insert(leaveBalanceAdjustment).values({
        id: crypto.randomUUID(),
        balanceId: balanceRecord.id,
        memberId: approvedRequest.memberId,
        leaveId: approvedRequest.leaveId,
        adjustmentType: "USAGE",
        days: approvedRequest.days,
        reason: "Leave usage for approved request",
        adjustedBy: memberIds[0]?.memberId,
        requestId: approvedRequest.requestId,
      });

      leaveBalanceAdjustmentsCount++;
    }
  }

  console.log("✅ Seeding complete!");
  console.log("   - 1 organization created");
  console.log(`   - ${userIds.length} users created`);
  console.log(`   - ${userIds.length} accounts created`);
  console.log(`   - ${policies.length} attendance policies created`);
  console.log(`   - ${leaveTypes.length} leave types created`);
  console.log(`   - ${leaveBalancesCount} leave balances created`);
  console.log(`   - ${leaveRequestsCount} leave requests created`);
  console.log(`   - ${leaveBalanceAdjustmentsCount} leave balance adjustments created`);
  console.log(`   - ${memberRecords.length} members created`);
  console.log(`   - ${invitations.length} invitations created`);
  console.log(`   - ${attendanceCount} daily attendance records created`);

  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
