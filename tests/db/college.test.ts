import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { prisma } from "@/lib/db";

// ---------------------------------------------------------
// TEST DATA
// ---------------------------------------------------------
const TEST_COLLEGE_ENTRY = {
    college_abbr : "CICS", // Using Uppercase for consistency
    college_name : "College of Computer and Information Sciences",
}

let TEST_COLLEGE_ID: number | null = null;

describe("College Model Tests", () => {

    // ---------------------------------------------------------
    // SETUP: CLEANUP EXISTING DATA
    // ---------------------------------------------------------
    beforeAll(async () => {
        // Clean up any existing test data to ensure a fresh start
        const existing = await prisma.cOLLEGE.findFirst({
            where: { 
                OR: [
                    { College_Abbr: TEST_COLLEGE_ENTRY.college_abbr },
                    { College_Name: TEST_COLLEGE_ENTRY.college_name }
                ]
            }
        });

        if (existing) {
            // We must delete dependent courses if they exist (optional safety check)
            await prisma.cOURSE.deleteMany({ where: { College_ID: existing.College_ID } });
            
            await prisma.cOLLEGE.delete({ where: { College_ID: existing.College_ID } });
            console.log(`Cleanup: Deleted existing college ${existing.College_Abbr}`);
        }
    });

    // ---------------------------------------------------------
    // TEARDOWN: FINAL CLEANUP
    // ---------------------------------------------------------
    afterAll(async () => {
        if (TEST_COLLEGE_ID) {
            await prisma.cOLLEGE.delete({ where: { College_ID: TEST_COLLEGE_ID } });
        }
        await prisma.$disconnect();
    });

    // ---------------------------------------------------------
    // 1. CREATE TEST
    // ---------------------------------------------------------
    test("Should create a new College (CICS)", async () => {
        const college = await prisma.cOLLEGE.create({
            data: {
                College_Abbr: TEST_COLLEGE_ENTRY.college_abbr,
                College_Name: TEST_COLLEGE_ENTRY.college_name
            }
        });

        TEST_COLLEGE_ID = college.College_ID;

        expect(college).toBeDefined();
        expect(college.College_Abbr).toBe(TEST_COLLEGE_ENTRY.college_abbr);
        console.log("Created College ID:", college.College_ID);
    });

    // ---------------------------------------------------------
    // 2. READ TEST
    // ---------------------------------------------------------
    test("Should retrieve College by Abbreviation", async () => {
        const found = await prisma.cOLLEGE.findFirst({
            where: { College_Abbr: TEST_COLLEGE_ENTRY.college_abbr }
        });

        expect(found).not.toBeNull();
        expect(found?.College_Name).toBe(TEST_COLLEGE_ENTRY.college_name);
    });

    // TODO : modify the prisma schema to add unique constraints before running these tests
    // ---------------------------------------------------------
    // 3. DUPLICATE / CONSTRAINT TEST (The "Assert Fail" Case)
    // ---------------------------------------------------------
    test("Should FAIL to create duplicate College (Unique Constraint)", async () => {
        // Attempt to create the exact same college again
        const attempt = prisma.cOLLEGE.create({
            data: {
                College_Abbr: TEST_COLLEGE_ENTRY.college_abbr, 
                College_Name: TEST_COLLEGE_ENTRY.college_name
            }
        });

        // We expect this to fail because of @unique or @@unique constraints
        expect(Promise.resolve(attempt)).rejects.toThrow();
    });

    test("Should FAIL to create college with existing Name but new Abbr (If strict unique applied)", async () => {
        // Only run this if you applied @unique on College_Name individually
        const attempt = prisma.cOLLEGE.create({
            data: {
                College_Abbr: "NEW_ABBR", 
                College_Name: TEST_COLLEGE_ENTRY.college_name // Duplicate Name
            }
        });

        expect(Promise.resolve(attempt)).rejects.toThrow();
    });

    // ---------------------------------------------------------
    // 4. UPDATE TEST
    // ---------------------------------------------------------
    test("Should update College Name", async () => {
        const newName = "College of Computing (Updated)";

        const updated = await prisma.cOLLEGE.update({
            where: { College_ID: TEST_COLLEGE_ID! },
            data: { College_Name: newName }
        });

        expect(updated.College_Name).toBe(newName);
    });

    // ---------------------------------------------------------
    // 5. DELETE TEST
    // ---------------------------------------------------------
    test("Should delete the College", async () => {
        await prisma.cOLLEGE.delete({
            where: { College_ID: TEST_COLLEGE_ID! }
        });

        // Verify it is gone
        const found = await prisma.cOLLEGE.findUnique({
            where: { College_ID: TEST_COLLEGE_ID! }
        });

        expect(found).toBeNull();
        
        // Reset ID so AfterAll doesn't try to delete it again
        TEST_COLLEGE_ID = null; 
    });

});