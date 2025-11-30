import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { prisma } from "@/lib/db";

// ---------------------------------------------------------
// TEST DATA
// ---------------------------------------------------------
const TEST_COLLEGE_ENTRY = {
  collegeAbbr: "CICS", // Using Uppercase for consistency
  collegeName: "College of Computer and Information Sciences",
};

let TEST_COLLEGE_ID: number | null = null;

describe("College Model Tests (camelCase Prisma client)", () => {
  // ---------------------------------------------------------
  // SETUP: CLEANUP EXISTING DATA
  // ---------------------------------------------------------
  beforeAll(async () => {
    // Clean up any existing test data to ensure a fresh start
    const existing = await prisma.college.findFirst({
      where: {
        OR: [
          { collegeAbbr: TEST_COLLEGE_ENTRY.collegeAbbr },
          { collegeName: TEST_COLLEGE_ENTRY.collegeName },
        ],
      },
    });

    if (existing) {
      // We must delete dependent courses if they exist (optional safety check)
      await prisma.course.deleteMany({ where: { collegeId: existing.id } });

      await prisma.college.delete({ where: { id: existing.id } });
      console.log(`Cleanup: Deleted existing college ${existing.collegeAbbr}`);
    }
  });

  // ---------------------------------------------------------
  // TEARDOWN: FINAL CLEANUP
  // ---------------------------------------------------------
  afterAll(async () => {
    if (TEST_COLLEGE_ID) {
      await prisma.college.delete({ where: { id: TEST_COLLEGE_ID } });
    }
    await prisma.$disconnect();
  });

  // ---------------------------------------------------------
  // 1. CREATE TEST
  // ---------------------------------------------------------
  test("Should create a new College (CICS)", async () => {
    const college = await prisma.college.create({
      data: {
        collegeAbbr: TEST_COLLEGE_ENTRY.collegeAbbr,
        collegeName: TEST_COLLEGE_ENTRY.collegeName,
      },
    });

    TEST_COLLEGE_ID = college.id;

    expect(college).toBeDefined();
    expect(college.collegeAbbr).toBe(TEST_COLLEGE_ENTRY.collegeAbbr);
    console.log("Created College ID:", college.id);
  });

  // ---------------------------------------------------------
  // 2. READ TEST
  // ---------------------------------------------------------
  test("Should retrieve College by Abbreviation", async () => {
    const found = await prisma.college.findFirst({
      where: { collegeAbbr: TEST_COLLEGE_ENTRY.collegeAbbr },
    });

    expect(found).not.toBeNull();
    expect(found?.collegeName).toBe(TEST_COLLEGE_ENTRY.collegeName);
  });

  // ---------------------------------------------------------
  // 3. DUPLICATE / CONSTRAINT TEST (The "Assert Fail" Case)
  // ---------------------------------------------------------
  test("Should FAIL to create duplicate College (Unique Constraint)", async () => {
    // Attempt to create the exact same college again
    const attempt = prisma.college.create({
      data: {
        collegeAbbr: TEST_COLLEGE_ENTRY.collegeAbbr,
        collegeName: TEST_COLLEGE_ENTRY.collegeName,
      },
    });

    // We expect this to fail because of @unique constraints
    expect(Promise.resolve(attempt)).rejects.toThrow();
  });

  test("Should FAIL to create college with existing Name but new Abbr (If strict unique applied)", async () => {
    // Only run this if you applied @unique on collegeName individually
    const attempt = prisma.college.create({
      data: {
        collegeAbbr: "NEW_ABBR",
        collegeName: TEST_COLLEGE_ENTRY.collegeName, // Duplicate Name
      },
    });

    expect(Promise.resolve(attempt)).rejects.toThrow();
  });

  // ---------------------------------------------------------
  // 4. UPDATE TEST
  // ---------------------------------------------------------
  test("Should update College Name", async () => {
    const newName = "College of Computing (Updated)";

    const updated = await prisma.college.update({
      where: { id: TEST_COLLEGE_ID! },
      data: { collegeName: newName },
    });

    expect(updated.collegeName).toBe(newName);
  });

  // ---------------------------------------------------------
  // 5. DELETE TEST
  // ---------------------------------------------------------
  test("Should delete the College", async () => {
    await prisma.college.delete({
      where: { id: TEST_COLLEGE_ID! },
    });

    // Verify it is gone
    const found = await prisma.college.findUnique({
      where: { id: TEST_COLLEGE_ID! },
    });

    expect(found).toBeNull();

    // Reset ID so AfterAll doesn't try to delete it again
    TEST_COLLEGE_ID = null;
  });
});
