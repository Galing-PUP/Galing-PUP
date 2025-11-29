import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { prisma } from "@/lib/db";
import { hash, compare } from "bcrypt";

// ---------------------------------------------------------
// CONSTANTS & STATE
// ---------------------------------------------------------
const ORIGINAL_PASS = "supersecretpassword666";
const NEW_PASS_VIA_ID = "changed_via_id_111";
const NEW_PASS_VIA_USERNAME = "changed_via_username_222";
const NEW_PASS_VIA_ROLE_USER = "changed_via_role_user_333";
const NEW_PASS_VIA_ROLE_ID = "changed_via_role_id_444";

const TEST_USER = {
  username: "charliekirk_security",
  email: "security_test@gmail.com",
};

let testUserId: number;
let testRoleId: number;
let testTierId: number;

describe("User Password Management Tests", () => {

  // ---------------------------------------------------------
  // SETUP
  // ---------------------------------------------------------
  beforeAll(async () => {
    // 1. Get Dependencies
    const role = await prisma.rOLE.findFirst();
    const tier = await prisma.sUBSCRIPTION_TIER.findFirst();
    if (!role || !tier) throw new Error("Seeding Error: Missing Role/Tier");

    testRoleId = role.Role_ID;
    testTierId = tier.Tier_ID;

    // 2. Clean Stale User
    const existing = await prisma.uSER.findFirst({
        where: { Username: TEST_USER.username }
    });
    if (existing) await prisma.uSER.delete({ where: { User_ID: existing.User_ID } });

    // 3. Create Initial User
    const hashedOriginal = await hash(ORIGINAL_PASS, 10);
    const user = await prisma.uSER.create({
      data: {
        Username: TEST_USER.username,
        Email: TEST_USER.email,
        Password_Hash: hashedOriginal,
        Registration_Date: new Date(),
        Is_Verified: true,
        Current_Role_ID: testRoleId,
        Tier_ID: testTierId,
      }
    });
    testUserId = user.User_ID;
  });

  afterAll(async () => {
    if (testUserId) {
      await prisma.uSER.delete({ where: { User_ID: testUserId } });
    }
    await prisma.$disconnect();
  });

  // ---------------------------------------------------------
  // CASE 1: UPDATE VIA USER ID
  // ---------------------------------------------------------
  test("Case 1: Update password via User_ID", async () => {
    const newHash = await hash(NEW_PASS_VIA_ID, 10);

    const updated = await prisma.uSER.update({
      where: { User_ID: testUserId },
      data: { Password_Hash: newHash }
    });

    // Verify update occurred
    const isMatch = await compare(NEW_PASS_VIA_ID, updated.Password_Hash);
    expect(isMatch).toBeTrue();
  });

  // ---------------------------------------------------------
  // CASE 2: UPDATE VIA USERNAME
  // ---------------------------------------------------------
  test("Case 2: Update password via Username", async () => {
    const newHash = await hash(NEW_PASS_VIA_USERNAME, 10);

    const updated = await prisma.uSER.update({
      where: { Username: TEST_USER.username },
      data: { Password_Hash: newHash }
    });

    const isMatch = await compare(NEW_PASS_VIA_USERNAME, updated.Password_Hash);
    expect(isMatch).toBeTrue();
  });

  // ---------------------------------------------------------
  // CASE 3: UPDATE VIA REVERSE SEARCH (ROLE ID + USERNAME)
  // ---------------------------------------------------------
  test("Case 3: Update via reverse search on RoleID and Username", async () => {
    // 1. Find user using Role and Username
    const foundUser = await prisma.uSER.findFirst({
      where: {
        Username: TEST_USER.username,
        Current_Role_ID: testRoleId
      }
    });

    if (!foundUser) throw new Error("Reverse Search Failed: User not found with that Role/Username combination");

    // 2. Update found user
    const newHash = await hash(NEW_PASS_VIA_ROLE_USER, 10);
    const updated = await prisma.uSER.update({
      where: { User_ID: foundUser.User_ID },
      data: { Password_Hash: newHash }
    });

    const isMatch = await compare(NEW_PASS_VIA_ROLE_USER, updated.Password_Hash);
    expect(isMatch).toBeTrue();
  });

  // ---------------------------------------------------------
  // CASE 4: UPDATE VIA REVERSE SEARCH (ROLE ID + USER ID)
  // ---------------------------------------------------------
  test("Case 4: Update via reverse search on RoleID and UserID", async () => {
    // 1. Find user using Role and ID
    const foundUser = await prisma.uSER.findFirst({
      where: {
        User_ID: testUserId,
        Current_Role_ID: testRoleId
      }
    });

    if (!foundUser) throw new Error("Reverse Search Failed: User not found with that Role/ID combination");

    // 2. Update found user
    const newHash = await hash(NEW_PASS_VIA_ROLE_ID, 10);
    const updated = await prisma.uSER.update({
      where: { User_ID: foundUser.User_ID },
      data: { Password_Hash: newHash }
    });

    const isMatch = await compare(NEW_PASS_VIA_ROLE_ID, updated.Password_Hash);
    expect(isMatch).toBeTrue();
  });

  // ---------------------------------------------------------
  // VERIFICATION & REVERT
  // ---------------------------------------------------------

  test("Assert failure if password doesn't match original", async () => {
    // Fetch current user from DB (Currently holds Case 4's password)
    const currentUser = await prisma.uSER.findUnique({ where: { User_ID: testUserId } });

    // Compare with the ORIGINAL password (created in setup)
    // We expect this to be FALSE because we have changed it 4 times.
    const isMatch = await compare(ORIGINAL_PASS, currentUser?.Password_Hash || "");
    
    // We expect "false", so we assert that it is false.
    expect(isMatch).toBeFalse();
  });

  test("Revert back to original password and Assert Match", async () => {
    // 1. Revert
    const originalHash = await hash(ORIGINAL_PASS, 10);
    await prisma.uSER.update({
      where: { User_ID: testUserId },
      data: { Password_Hash: originalHash }
    });

    // 2. Fetch fresh data
    const revertedUser = await prisma.uSER.findUnique({ where: { User_ID: testUserId } });

    // 3. Assert password matches original
    const isMatch = await compare(ORIGINAL_PASS, revertedUser?.Password_Hash || "");
    
    if (!isMatch) {
        console.error("Hash Mismatch! Expected original password to work.");
    }

    expect(isMatch).toBeTrue();
    console.log("Password successfully reverted and verified.");
  });

});