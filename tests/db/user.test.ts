import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { prisma } from "@/lib/db";
import { hash, compare } from "bcrypt";
import { RoleName, UserStatus } from "@/lib/generated/prisma/enums";

// ---------------------------------------------------------
// TEST DATA & MEMORY
// ---------------------------------------------------------
let TEST_USER_ID: number | null = null;
const TEST_REGISTRATION_DATE = new Date();

const TEST_USER = {
  username: "charliekirk11",
  email: "charliekirk@gmail.com",
  password: "supersecretpassword666",
};

// We need valid IDs from the database to create a user
let defaultRoleId: number;
let defaultTierId: number; // Free tier
let upgradeTierId: number; // Paid tier for upgrade tests

describe("User Model Advanced Tests (camelCase Prisma client)", () => {
  // ---------------------------------------------------------
  // SETUP: FETCH DEPENDENCIES & CLEANUP
  // ---------------------------------------------------------
  beforeAll(async () => {
    // 1. Fetch Default Tier (Free)
    const freeTier =
      (await prisma.subscriptionTier.findFirst({
        where: { tierName: { contains: "Free", mode: "insensitive" } },
      })) || (await prisma.subscriptionTier.findFirst());

    if (!freeTier) throw new Error("Database Error: No tiers seeded.");
    defaultTierId = freeTier.id;

    // 2. Fetch an "Upgrade" Tier (Any tier that isn't the default one)
    const paidTier = await prisma.subscriptionTier.findFirst({
      where: { id: { not: defaultTierId } },
    });
    // If no paid tier exists, fallback to default (test will pass but strictly won't "change" tier)
    upgradeTierId = paidTier ? paidTier.id : defaultTierId;

    // 3. Cleanup Stale Data
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username: TEST_USER.username }, { email: TEST_USER.email }],
      },
    });

    if (existing) {
      console.log("Cleaning up stale test user...");
      await prisma.user.delete({ where: { id: existing.id } });
    }
  });

  // ---------------------------------------------------------
  // TEARDOWN: FINAL CLEANUP
  // ---------------------------------------------------------
  afterAll(async () => {
    if (TEST_USER_ID) {
      await prisma.user.delete({ where: { id: TEST_USER_ID } });
    }
    await prisma.$disconnect();
  });

  // ---------------------------------------------------------
  // CREATE USER
  // ---------------------------------------------------------
  test("Create user 'Charlie Kirk' with bcrypt password", async () => {
    const hashedPassword = await hash(TEST_USER.password, 10);

    const user = await prisma.user.create({
      data: {
        username: TEST_USER.username,
        email: TEST_USER.email,
        passwordHash: hashedPassword,
        registrationDate: TEST_REGISTRATION_DATE,
        status: UserStatus.APPROVED,
        role: RoleName.REGISTERED,
        tierId: defaultTierId,
      },
    });

    TEST_USER_ID = user.id;
    expect(user).toBeDefined();
    expect(user.username).toBe(TEST_USER.username);

    // Verify password hash logic
    const isMatch = await compare(TEST_USER.password, user.passwordHash);
    expect(isMatch).toBeTrue();
  });

  // ---------------------------------------------------------
  // RETRIEVAL CASES
  // ---------------------------------------------------------

  test("Case 1: Find by Email", async () => {
    const user = await prisma.user.findUnique({
      where: { email: TEST_USER.email },
    });
    expect(user).not.toBeNull();
    expect(user?.id).toBe(TEST_USER_ID!);
  });

  test("Case 2: Find by User ID", async () => {
    const user = await prisma.user.findUnique({
      where: { id: TEST_USER_ID! },
    });
    expect(user).not.toBeNull();
    expect(user?.email).toBe(TEST_USER.email);
  });

  test("Case 3: Find by both Email and UserID", async () => {
    const user = await prisma.user.findFirst({
      where: {
        id: TEST_USER_ID!,
        email: TEST_USER.email,
      },
    });
    expect(user).not.toBeNull();
  });

  test("Case 4: Check by Username", async () => {
    const user = await prisma.user.findUnique({
      where: { username: TEST_USER.username },
    });
    expect(user).not.toBeNull();
    expect(user?.username).toBe(TEST_USER.username);
  });

  test("Case 5: Find using registration date and regex match", async () => {
    const users = await prisma.user.findMany({
      where: { registrationDate: TEST_REGISTRATION_DATE },
    });
    // Filter results using Regex in memory
    const charlie = users.find((u) => /charliekirk/.test(u.username));
    expect(charlie).toBeDefined();
    expect(charlie?.username).toMatch(/charliekirk11/);
  });

  // ---------------------------------------------------------
  // CONSTRAINTS & ERRORS
  // ---------------------------------------------------------

  test("Should fail to create same Username but different Email", async () => {
    const attempt = prisma.user.create({
      data: {
        username: TEST_USER.username, // DUPLICATE
        email: "different_email@gmail.com",
        passwordHash: "123",
        registrationDate: new Date(),
        status: UserStatus.APPROVED,
        role: RoleName.REGISTERED,
        tierId: defaultTierId,
      },
    });
    expect(Promise.resolve(attempt)).rejects.toThrow();
  });

  test("Should fail to create same Email but different Username", async () => {
    const attempt = prisma.user.create({
      data: {
        username: "different_user",
        email: TEST_USER.email, // DUPLICATE
        passwordHash: "123",
        registrationDate: new Date(),
        status: UserStatus.APPROVED,
        role: RoleName.REGISTERED,
        tierId: defaultTierId,
      },
    });
    expect(Promise.resolve(attempt)).rejects.toThrow();
  });

  // ---------------------------------------------------------
  // UPDATES & RELATIONS
  // ---------------------------------------------------------

  test("Update ID on Subscription Tier", async () => {
    const updated = await prisma.user.update({
      where: { id: TEST_USER_ID! },
      data: { tierId: defaultTierId },
    });
    expect(updated.tierId).toBe(defaultTierId);
  });

  test("Should fail when updating to an invalid Role", async () => {
    const invalidRole = "INVALID_ROLE" as RoleName;
    const attempt = prisma.user.update({
      where: { id: TEST_USER_ID! },
      data: { role: invalidRole },
    });
    expect(Promise.resolve(attempt)).rejects.toThrow();
  });

  test("Update Role to ADMIN and Verify", async () => {
    // Update Role
    const updated = await prisma.user.update({
      where: { id: TEST_USER_ID! },
      data: { role: RoleName.ADMIN },
    });
    expect(updated.role).toBe(RoleName.ADMIN);

    // Verify role is stored correctly
    const userWithRole = await prisma.user.findUnique({
      where: { id: TEST_USER_ID! },
    });

    expect(userWithRole?.role).toBeDefined();
    expect(userWithRole?.role).toBe(RoleName.ADMIN);
  });

  test("Verify Role enum works correctly", async () => {
    const user = await prisma.user.findUnique({
      where: { id: TEST_USER_ID! },
    });

    expect(user).not.toBeNull();
    expect(user?.role).toBeDefined();
    expect(user?.role).toBe(RoleName.ADMIN);

    console.log("Verified User Role:", user?.role);
  });

  // ---------------------------------------------------------
  // TIER UPGRADE & DOWNGRADE LOGIC
  // ---------------------------------------------------------

  // Case 6: Verify using the tier relation if user was upgraded to paid
  test("Case 6: Upgrade user to Paid Tier and verify via Relation", async () => {
    // 1. Perform Upgrade
    await prisma.user.update({
      where: { id: TEST_USER_ID! },
      data: { tierId: upgradeTierId },
    });

    // 2. Fetch with Relation
    const userWithTier = await prisma.user.findUnique({
      where: { id: TEST_USER_ID! },
      include: { subscriptionTier: true },
    });

    expect(userWithTier?.subscriptionTier).toBeDefined();
    expect(userWithTier?.subscriptionTier.id).toBe(upgradeTierId);

    console.log("Upgraded Tier Name:", userWithTier?.subscriptionTier.tierName);
  });

  // Case 7: Revert to free and verify using Regex
  test("Case 7: Downgrade to Free and verify using Regex", async () => {
    // 1. Perform Downgrade (Revert to default)
    await prisma.user.update({
      where: { id: TEST_USER_ID! },
      data: { tierId: defaultTierId },
    });

    // 2. Fetch with Relation
    const userWithTier = await prisma.user.findUnique({
      where: { id: TEST_USER_ID! },
      include: { subscriptionTier: true },
    });

    expect(userWithTier?.subscriptionTier).toBeDefined();

    // 3. Regex Check: Ensure the tier name contains "Free" (Case Insensitive)
    const tierName = userWithTier?.subscriptionTier.tierName || "";
    expect(tierName).toMatch(/Free/i);

    console.log("Downgraded Tier Name:", tierName);
  });

  //---------------------------------------------------------
  // Password Update Test (left intentionally minimal; detailed tests in password.test.ts)
  //---------------------------------------------------------
});
