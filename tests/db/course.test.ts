import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { prisma } from "@/lib/db"; 



// ---------------------------------------------------------
// TEST DATA
// ---------------------------------------------------------
const TEST_COLLEGE = {
    name: "TEST_UNIT_College_Engineering",
    abbr: "TEST_COE"
};

const TEST_COURSE = {
    name: "TEST_UNIT_Bachelor of Science in Civil Engineering",
    abbr: "TEST_BSCE"
};

// We store IDs here to reuse them across tests
let COLLEGE_ID: number;
let COURSE_ID: number | null = null;

describe("Course Model Integration Tests", () => {

    // ---------------------------------------------------------
    // SETUP: CLEAN & PREPARE PARENT
    // ---------------------------------------------------------
    beforeAll(async () => {
        // 1. NUCLEAR CLEANUP (Reverse order of dependencies)
        // Delete Courses first, then Colleges to avoid FK errors
        await prisma.cOURSE.deleteMany({
            where: { Course_Abbr: TEST_COURSE.abbr }
        });
        await prisma.cOLLEGE.deleteMany({
            where: { College_Abbr: TEST_COLLEGE.abbr }
        });

        // 2. CREATE PARENT (College)
        const college = await prisma.cOLLEGE.create({
            data: {
                College_Name: TEST_COLLEGE.name,
                College_Abbr: TEST_COLLEGE.abbr
            }
        });
        
        COLLEGE_ID = college.College_ID;
        console.log(`Setup: Created Parent College ID: ${COLLEGE_ID}`);
    });

    // ---------------------------------------------------------
    // TEARDOWN: CLEANUP
    // ---------------------------------------------------------
    afterAll(async () => {
        // Clean up the course if it still exists
        if (COURSE_ID) {
            await prisma.cOURSE.deleteMany({ where: { Course_ID: COURSE_ID } });
        }
        // Clean up the parent college
        await prisma.cOLLEGE.deleteMany({ where: { College_ID: COLLEGE_ID } });
        
        await prisma.$disconnect();
    });

    // ---------------------------------------------------------
    // 1. CREATE TEST
    // ---------------------------------------------------------
    test("Should create a new Course linked to College", async () => {
        const course = await prisma.cOURSE.create({
            data: {
                Course_Name: TEST_COURSE.name,
                Course_Abbr: TEST_COURSE.abbr,
                College_ID: COLLEGE_ID // Link to the parent we created in beforeAll
            }
        });

        COURSE_ID = course.Course_ID;

        expect(course).toBeDefined();
        expect(course.Course_Abbr).toBe(TEST_COURSE.abbr);
        expect(course.College_ID).toBe(COLLEGE_ID);
    });

    // ---------------------------------------------------------
    // 2. READ TEST (WITH RELATION)
    // ---------------------------------------------------------
    test("Should retrieve Course and include College details", async () => {
        const found = await prisma.cOURSE.findFirst({
            where: { Course_Abbr: TEST_COURSE.abbr },
            include: { College: true } // Test the relation
        });

        expect(found).not.toBeNull();
        expect(found?.College).toBeDefined();
        expect(found?.College.College_Abbr).toBe(TEST_COLLEGE.abbr);
    });

    // ---------------------------------------------------------
    // 3. UPDATE TEST
    // ---------------------------------------------------------
    test("Should update Course Name", async () => {
        if (!COURSE_ID) throw new Error("No Course ID from create test");

        const newName = "TEST_UNIT_BSCE Updated";

        const updated = await prisma.cOURSE.update({
            where: { Course_ID: COURSE_ID },
            data: { Course_Name: newName }
        });

        expect(updated.Course_Name).toBe(newName);
    });

    // ---------------------------------------------------------
    // 4. DELETE TEST
    // ---------------------------------------------------------
    test("Should delete the Course", async () => {
        if (!COURSE_ID) throw new Error("No Course ID from create test");

        await prisma.cOURSE.delete({
            where: { Course_ID: COURSE_ID }
        });

        const found = await prisma.cOURSE.findUnique({
            where: { Course_ID: COURSE_ID }
        });

        expect(found).toBeNull();
        // Prevent afterAll from trying to delete it again
        COURSE_ID = null;
    });
});