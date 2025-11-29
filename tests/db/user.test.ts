
import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { prisma } from "@/lib/db"; 
import { hash, compare } from "bcrypt";

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

describe("User Model Advanced Tests", () => {
  
  // ---------------------------------------------------------
  // SETUP: FETCH DEPENDENCIES & CLEANUP
  // ---------------------------------------------------------
  beforeAll(async () => {
    // 1. Fetch Default Role (e.g. User/Student)
    const role = await prisma.rOLE.findFirst();
    if (!role) throw new Error("Database Error: No ROLES seeded.");
    defaultRoleId = role.Role_ID;

    // 2. Fetch Default Tier (Free)
    const freeTier = await prisma.sUBSCRIPTION_TIER.findFirst({
        where: { Tier_Name: { contains: "Free", mode: "insensitive" } }
    }) || await prisma.sUBSCRIPTION_TIER.findFirst();
    
    if (!freeTier) throw new Error("Database Error: No TIERS seeded.");
    defaultTierId = freeTier.Tier_ID;

    // 3. Fetch an "Upgrade" Tier (Any tier that isn't the default one)
    const paidTier = await prisma.sUBSCRIPTION_TIER.findFirst({
        where: { Tier_ID: { not: defaultTierId } }
    });
    // If no paid tier exists, fallback to default (test will pass but strictly won't "change" tier)
    upgradeTierId = paidTier ? paidTier.Tier_ID : defaultTierId; 

    // 4. Cleanup Stale Data
    const existing = await prisma.uSER.findFirst({
        where: {
            OR: [
                { Username: TEST_USER.username },
                { Email: TEST_USER.email }
            ]
        }
    });

    if (existing) {
        console.log("Cleaning up stale test user...");
        await prisma.uSER.delete({ where: { User_ID: existing.User_ID } });
    }
  });

  // ---------------------------------------------------------
  // TEARDOWN: FINAL CLEANUP
  // ---------------------------------------------------------
  afterAll(async () => {
    if (TEST_USER_ID) {
      await prisma.uSER.delete({ where: { User_ID: TEST_USER_ID } });
    }
    await prisma.$disconnect();
  });

  // ---------------------------------------------------------
  // CREATE USER
  // ---------------------------------------------------------
  test("Create user 'Charlie Kirk' with bcrypt password", async () => {
    const hashedPassword = await hash(TEST_USER.password, 10);

    const user = await prisma.uSER.create({
      data: {
        Username: TEST_USER.username,
        Email: TEST_USER.email,
        Password_Hash: hashedPassword,
        Registration_Date: TEST_REGISTRATION_DATE,
        Is_Verified: true,
        Current_Role_ID: defaultRoleId,
        Tier_ID: defaultTierId,
      },
    });

    TEST_USER_ID = user.User_ID;
    expect(user).toBeDefined();
    expect(user.Username).toBe(TEST_USER.username);
    
    // Verify password hash logic
    const isMatch = await compare(TEST_USER.password, user.Password_Hash);
    expect(isMatch).toBeTrue();
  });

  // ---------------------------------------------------------
  // RETRIEVAL CASES
  // ---------------------------------------------------------
  
  test("Case 1: Find by Email", async () => {
    const user = await prisma.uSER.findUnique({
      where: { Email: TEST_USER.email },
    });
    expect(user).not.toBeNull();
    expect(user?.User_ID).toBe(TEST_USER_ID!);
  });

  test("Case 2: Find by User ID", async () => {
    const user = await prisma.uSER.findUnique({
      where: { User_ID: TEST_USER_ID! },
    });
    expect(user).not.toBeNull();
    expect(user?.Email).toBe(TEST_USER.email);
  });

  test("Case 3: Find by both Email and UserID", async () => {
    const user = await prisma.uSER.findFirst({
      where: {
        User_ID: TEST_USER_ID!,
        Email: TEST_USER.email,
      },
    });
    expect(user).not.toBeNull();
  });

  test("Case 4: Check by Username", async () => {
    const user = await prisma.uSER.findUnique({
      where: { Username: TEST_USER.username },
    });
    expect(user).not.toBeNull();
    expect(user?.Username).toBe(TEST_USER.username);
  });

  test("Case 5: Find using registration date and regex match", async () => {
    const users = await prisma.uSER.findMany({
        where: { Registration_Date: TEST_REGISTRATION_DATE }
    });
    // Filter results using Regex in memory
    const charlie = users.find(u => /charliekirk/.test(u.Username));
    expect(charlie).toBeDefined();
    expect(charlie?.Username).toMatch(/charliekirk11/);
  });

  // ---------------------------------------------------------
  // CONSTRAINTS & ERRORS
  // ---------------------------------------------------------

  test("Should fail to create same Username but different Email", async () => {
    const attempt = prisma.uSER.create({
      data: {
        Username: TEST_USER.username, // DUPLICATE
        Email: "different_email@gmail.com",
        Password_Hash: "123",
        Registration_Date: new Date(),
        Is_Verified: true,
        Current_Role_ID: defaultRoleId,
        Tier_ID: defaultTierId,
      }
    });
    expect(Promise.resolve(attempt)).rejects.toThrow();
  });

  test("Should fail to create same Email but different Username", async () => {
    const attempt = prisma.uSER.create({
      data: {
        Username: "different_user",
        Email: TEST_USER.email, // DUPLICATE
        Password_Hash: "123",
        Registration_Date: new Date(),
        Is_Verified: true,
        Current_Role_ID: defaultRoleId,
        Tier_ID: defaultTierId,
      }
    });
    expect(Promise.resolve(attempt)).rejects.toThrow();
  });

  // ---------------------------------------------------------
  // UPDATES & RELATIONS
  // ---------------------------------------------------------

  test("Update ID on Subscription Tier", async () => {
    const updated = await prisma.uSER.update({
        where: { User_ID: TEST_USER_ID! },
        data: { Tier_ID: defaultTierId }
    });
    expect(updated.Tier_ID).toBe(defaultTierId);
  });

  test("Should fail when updating to an invalid Role ID", async () => {
    const invalidRoleID = 999999; 
    const attempt = prisma.uSER.update({
        where: { User_ID: TEST_USER_ID! },
        data: { Current_Role_ID: invalidRoleID }
    });
    expect(Promise.resolve(attempt)).rejects.toThrow();
  });

  test("Update ID on Admin Role and Verify", async () => {
    // 1. Update Role
    const updated = await prisma.uSER.update({
        where: { User_ID: TEST_USER_ID! },
        data: { Current_Role_ID: defaultRoleId }
    });
    expect(updated.Current_Role_ID).toBe(defaultRoleId);

    // 2. Query Role relation to verify existence
    const userWithRole = await prisma.uSER.findUnique({
        where: { User_ID: TEST_USER_ID! },
        include: { Role: true }
    });

    expect(userWithRole?.Role).toBeDefined();
    expect(userWithRole?.Role.Role_ID).toBe(defaultRoleId);
  });

  test("Verify Role relation works correctly", async () => {
    const userWithRole = await prisma.uSER.findUnique({
        where: { User_ID: TEST_USER_ID! },
        include: { Role: true }
    });

    expect(userWithRole).not.toBeNull();
    expect(userWithRole?.Role).toBeDefined();
    expect(userWithRole?.Role.Role_ID).toBe(defaultRoleId);
    
    console.log("Verified User Role:", userWithRole?.Role?.Role_Name);
  });

  // ---------------------------------------------------------
  // TIER UPGRADE & DOWNGRADE LOGIC
  // ---------------------------------------------------------

  // Case 6: Verify using the tier relation if user was upgraded to paid
  test("Case 6: Upgrade user to Paid Tier and verify via Relation", async () => {
    // 1. Perform Upgrade
    await prisma.uSER.update({
        where: { User_ID: TEST_USER_ID! },
        data: { Tier_ID: upgradeTierId }
    });

    // 2. Fetch with Relation
    const userWithTier = await prisma.uSER.findUnique({
        where: { User_ID: TEST_USER_ID! },
        include: { SubscriptionTier: true }
    });

    expect(userWithTier?.SubscriptionTier).toBeDefined();
    expect(userWithTier?.SubscriptionTier.Tier_ID).toBe(upgradeTierId);
    
    console.log("Upgraded Tier Name:", userWithTier?.SubscriptionTier.Tier_Name);
  });

  // Case 7: Revert to free and verify using Regex
  test("Case 7: Downgrade to Free and verify using Regex", async () => {
    // 1. Perform Downgrade (Revert to default)
    await prisma.uSER.update({
        where: { User_ID: TEST_USER_ID! },
        data: { Tier_ID: defaultTierId }
    });

    // 2. Fetch with Relation
    const userWithTier = await prisma.uSER.findUnique({
        where: { User_ID: TEST_USER_ID! },
        include: { SubscriptionTier: true }
    });

    expect(userWithTier?.SubscriptionTier).toBeDefined();

    // 3. Regex Check: Ensure the tier name contains "Free" (Case Insensitive)
    // Note: This assumes your default tier is named "Free". 
    // If your seed data is different, this regex might need adjustment.
    const tierName = userWithTier?.SubscriptionTier.Tier_Name || "";
    expect(tierName).toMatch(/Free/i);

    console.log("Downgraded Tier Name:", tierName);
  });

  //---------------------------------------------------------
  // Password Update Test
  //---------------------------------------------------------


});
