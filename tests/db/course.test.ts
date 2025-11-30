import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { prisma } from "@/lib/db";

// ---------------------------------------------------------
// TEST DATA
// ---------------------------------------------------------
const TEST_COLLEGE = {
  name: "TEST_UNIT_College_Engineering",
  abbr: "TEST_COE",
};

const TEST_COURSE = {
  name: "TEST_UNIT_Bachelor of Science in Civil Engineering",
  abbr: "TEST_BSCE",
};

// We store IDs here to reuse them across tests
let COLLEGE_ID: number;
let COURSE_ID: number | null = null;

describe("Course Model Integration Tests (camelCase Prisma client)", () => {
  // ---------------------------------------------------------
  // SETUP: CLEAN & PREPARE PARENT
  // ---------------------------------------------------------
  beforeAll(async () => {
    // 1. NUCLEAR CLEANUP (Reverse order of dependencies)
    // Delete Courses first, then Colleges to avoid FK errors
    await prisma.course.deleteMany({
      where: { courseAbbr: TEST_COURSE.abbr },
    });
    await prisma.college.deleteMany({
      where: { collegeAbbr: TEST_COLLEGE.abbr },
    });

    // 2. CREATE PARENT (College)
    const college = await prisma.college.create({
      data: {
        collegeName: TEST_COLLEGE.name,
        collegeAbbr: TEST_COLLEGE.abbr,
      },
    });

    COLLEGE_ID = college.id;
    console.log(`Setup: Created Parent College ID: ${COLLEGE_ID}`);
  });

  // ---------------------------------------------------------
  // TEARDOWN: CLEANUP
  // ---------------------------------------------------------
  afterAll(async () => {
    // Clean up the course if it still exists
    if (COURSE_ID) {
      await prisma.course.deleteMany({ where: { id: COURSE_ID } });
    }
    // Clean up the parent college
    await prisma.college.deleteMany({ where: { id: COLLEGE_ID } });

    await prisma.$disconnect();
  });

  // ---------------------------------------------------------
  // 1. CREATE TEST
  // ---------------------------------------------------------
  test("Should create a new Course linked to College", async () => {
    const course = await prisma.course.create({
      data: {
        courseName: TEST_COURSE.name,
        courseAbbr: TEST_COURSE.abbr,
        collegeId: COLLEGE_ID, // Link to the parent we created in beforeAll
      },
    });

    COURSE_ID = course.id;

    expect(course).toBeDefined();
    expect(course.courseAbbr).toBe(TEST_COURSE.abbr);
    expect(course.collegeId).toBe(COLLEGE_ID);
  });

  // ---------------------------------------------------------
  // 2. READ TEST (WITH RELATION)
  // ---------------------------------------------------------
  test("Should retrieve Course and include College details", async () => {
    const found = await prisma.course.findFirst({
      where: { courseAbbr: TEST_COURSE.abbr },
      include: { college: true }, // Test the relation
    });

    expect(found).not.toBeNull();
    expect(found?.college).toBeDefined();
    expect(found?.college.collegeAbbr).toBe(TEST_COLLEGE.abbr);
  });

  // ---------------------------------------------------------
  // 3. UPDATE TEST
  // ---------------------------------------------------------
  test("Should update Course Name", async () => {
    if (!COURSE_ID) throw new Error("No Course ID from create test");

    const newName = "TEST_UNIT_BSCE Updated";

    const updated = await prisma.course.update({
      where: { id: COURSE_ID },
      data: { courseName: newName },
    });

    expect(updated.courseName).toBe(newName);
  });

  // ---------------------------------------------------------
  // 4. DELETE TEST
  // ---------------------------------------------------------
  test("Should delete the Course", async () => {
    if (!COURSE_ID) throw new Error("No Course ID from create test");

    await prisma.course.delete({
      where: { id: COURSE_ID },
    });

    const found = await prisma.course.findUnique({
      where: { id: COURSE_ID },
    });

    expect(found).toBeNull();
    // Prevent afterAll from trying to delete it again
    COURSE_ID = null;
  });
});
