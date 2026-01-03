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

import { eq } from "drizzle-orm";
import { connect } from "./index";
import type { Day } from "./schema/attendance";
import { attendance, attendancePolicy } from "./schema/attendance";
import { account, user } from "./schema/core";
import { leave, leaveRequest } from "./schema/leave";
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

async function main() {
  console.log("🌱 Starting database seeding...");

  // Optional: Clear existing data (set CLEAR_DB=true environment variable)
  if (process.env.CLEAR_DB === "true") {
    console.log("🗑️  Clearing existing data...");
    await db.delete(attendance);
    await db.delete(invitation);
    await db.delete(member);
    await db.delete(attendancePolicy);
    await db.delete(account);
    await db.delete(organization);
    await db.delete(user);
    await db.delete(leaveRequest);
    await db.delete(leave);
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
    },
    {
      id: crypto.randomUUID(),
      name: "Six Day Work Week",
      timezone: "Asia/Tokyo" as const,
      clockInSec: 8 * 3600, // 8:00 AM
      clockOutSec: 16 * 3600, // 4:00 PM
      workdays: ["MON", "TUE", "WED", "THU", "FRI", "SAT"] as Day[],
    },
    {
      id: crypto.randomUUID(),
      name: "Middle East Schedule",
      timezone: "Asia/Dubai" as const,
      clockInSec: 10 * 3600, // 10:00 AM
      clockOutSec: 18 * 3600, // 6:00 PM
      workdays: ["SUN", "MON", "TUE", "WED", "THU"] as Day[],
    },
  ];

  for (const policy of policies) {
    await db.insert(attendancePolicy).values({
      id: policy.id,
      name: policy.name,
      timezone: policy.timezone,
      clockInSec: policy.clockInSec,
      clockOutSec: policy.clockOutSec,
      workdays: policy.workdays,
      organizationId: orgId,
    });
  }

  // 4. Create Members
  console.log("👔 Creating members...");
  const memberRecords: { userId: string; policyId: string; policyData: (typeof policies)[0] }[] =
    [];

  for (let i = 0; i < userIds.length; i++) {
    const policyIndex = i % 3; // Distribute members across 3 policies
    const policy = policies[policyIndex];

    await db.insert(member).values({
      id: crypto.randomUUID(),
      organizationId: orgId,
      userId: userIds[i].id,
      attendancePolicyId: policy.id,
      role: userIds[i].role,
      position: i === 0 ? "CEO" : i < 3 ? "Manager" : "Employee",
    });

    memberRecords.push({
      userId: userIds[i].id,
      policyId: policy.id,
      policyData: policy,
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
    },
    {
      email: "kyle.reese@example.com",
      role: "member",
      position: "Designer",
    },
    {
      email: "john.connor@example.com",
      role: "member",
      position: "Product Manager",
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

      // Generate CHECK_IN
      const checkInTime = addMinutesVariance(policy.clockInSec, 30);
      const checkInTimestamp = createTimestamp(date, checkInTime);

      await db.insert(attendance).values({
        id: crypto.randomUUID(),
        type: "CHECK_IN",
        userId: memberRecord.userId,
        attendancePolicyId: policy.id,
        latitude: baseLatitude + (Math.random() * 0.01 - 0.005),
        longitude: baseLongitude + (Math.random() * 0.01 - 0.005),
        accuracy: 10 + Math.random() * 40, // 10-50 meters
        updatedAt: checkInTimestamp,
      });

      // Generate CHECK_OUT
      const checkOutTime = addMinutesVariance(policy.clockOutSec, 30);
      const checkOutTimestamp = createTimestamp(date, checkOutTime);

      await db.insert(attendance).values({
        id: crypto.randomUUID(),
        type: "CHECK_OUT",
        userId: memberRecord.userId,
        attendancePolicyId: policy.id,
        latitude: baseLatitude + (Math.random() * 0.01 - 0.005),
        longitude: baseLongitude + (Math.random() * 0.01 - 0.005),
        accuracy: 10 + Math.random() * 40, // 10-50 meters
        updatedAt: checkOutTimestamp,
      });

      attendanceCount += 2;
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

  // 8. Create Leave Requests
  console.log("📝 Creating leave requests...");
  const memberIds: { userId: string; memberId: string; policyId: string }[] = [];

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

      await db.insert(leaveRequest).values({
        id: crypto.randomUUID(),
        memberId: memberData.memberId,
        leaveId: leaveTypeData.id,
        startDate: startDate,
        endDate: endDate,
        status: status,
        reason: `${leaveTypeData.name} request for ${duration} day(s)`,
        reviewerId: reviewerId,
        reviewedAt: reviewedAt,
      });
    }
  }

  console.log("✅ Seeding complete!");
  console.log("   - 1 organization created");
  console.log(`   - ${userIds.length} users created`);
  console.log(`   - ${userIds.length} accounts created`);
  console.log(`   - ${policies.length} attendance policies created`);
  console.log(`   - ${leaveTypes.length} leave types created`);
  console.log(`   - ${leaveRequestsCount} leave requests created`);
  console.log(`   - ${memberRecords.length} members created`);
  console.log(`   - ${invitations.length} invitations created`);
  console.log(`   - ${attendanceCount} attendance records created`);

  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
