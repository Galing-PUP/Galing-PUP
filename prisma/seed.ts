// prisma/seed.ts

import { prisma } from "@/lib/db";
import { mockUsers } from "@/data/mockUsers";
import { mockPublications } from "@/data/mockPublications";
import { mockResults } from "@/data/mockResults";

async function main() {
  console.log("🌱 Starting seed...");

  // ---------------------------------------------------------
  // 1. SUBSCRIPTION TIERS
  // ---------------------------------------------------------
  console.log("Seeding Subscription Tiers...");
  const tiers = [
    {
      tierName: "Free",
      dailyDownloadLimit: 5,
      dailyCitationLimit: 5,
      maxBookmarks: 10,
      hasAds: true,
      hasAiInsights: false,
    },
    {
      tierName: "Paid",
      dailyDownloadLimit: 100,
      dailyCitationLimit: 100,
      maxBookmarks: 500,
      hasAds: false,
      hasAiInsights: true,
    },
  ];

  for (const [i, tier] of tiers.entries()) {
    await prisma.subscriptionTier.upsert({
      where: { id: i + 1 }, // Using primary key for upsert
      update: {},
      create: tier,
    });
  }

  // ---------------------------------------------------------
  // 2. ROLES
  // ---------------------------------------------------------
  console.log("Seeding Roles...");
  const roles = ["Viewer", "Registered", "Admin", "Superadmin"];

  for (const [i, roleName] of roles.entries()) {
    await prisma.role.upsert({
      where: { id: i + 1 },
      update: {},
      create: { roleName },
    });
  }

  // ---------------------------------------------------------
  // 3. USERS
  // ---------------------------------------------------------
  console.log("Seeding Users...");

  // Helper to map string role to ID
  const getRoleId = (roleStr: string) => {
    const map: Record<string, number> = {
      Viewer: 1,
      Registered: 2,
      Admin: 3,
      Superadmin: 4,
    };
    return map[roleStr] || 2; // Default to Registered
  };

  for (const user of mockUsers) {
    const username = user.email.split("@")[0];

    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        username,
        email: user.email,
        passwordHash: "hashed_placeholder_123", // hash properly using bcrypt for non-mock data
        registrationDate: new Date(),
        isVerified: user.status === "Accepted",
        currentRoleId: getRoleId(user.role),
        tierId: 1, // default to Free
      },
    });
  }

  // Fetch a valid uploader ID (e.g., first created user)
  const uploader = await prisma.user.findFirst();
  if (!uploader) throw new Error("No users created");

  // ---------------------------------------------------------
  // 4. ACADEMIC DATA (Colleges, Courses, Resource Types, Libraries)
  // ---------------------------------------------------------
  console.log("Seeding Academic Structures...");

  const collegeMap: Record<string, string> = {
    CAF: "College of Accountancy and Finance",
    CE: "College of Engineering",
    CADBE: "College of Architecture, Design and the Built Environment",
    CAL: "College of Arts and Letters",
    CBA: "College of Business Administration",
    COC: "College of Communication",
    CCIS: "College of Computer and Information Sciences",
    COED: "College of Education",
    CHK: "College of Human Kinetics",
    CL: "College of Law",
    CPSPA: "College of Political Science and Public Administration",
    CSSD: "College of Social Sciences and Development",
    CS: "College of Science",
    CTHTM: "College of Tourism, Hospitality and Transportation Management",
    ITECH: "Institute of Technology",
    GS: "Graduate School"
  };

  for (const [abbr, name] of Object.entries(collegeMap)) {
    await prisma.college.upsert({
      where: { collegeName: name },
      update: {},
      create: {
        collegeName: name,
        collegeAbbr: abbr.toUpperCase(),
      },
    });
  }

  // Ensure a default college exists
  // Fetch a fallback college (e.g. CS)
  const fallbackCollege = await prisma.college.findFirst({
    where: { collegeAbbr: "CS" },
  });
  if (!fallbackCollege) throw new Error("Fallback college (CS) not found after seeding");

  // Resource Types
  const resourceTypes = [
    "Thesis",
    "Capstone",
    "Dissertation",
    "Article",
    "Research Paper",
  ];
  for (const type of resourceTypes) {
    const existing = await prisma.resourceType.findFirst({
      where: { typeName: type },
    });
    if (!existing) {
      await prisma.resourceType.create({ data: { typeName: type } });
    }
  }

  // Libraries
  const libraries = [
    "Main Library",
    "Engineering Library",
    "Business Library",
    "Bataan Branch Library",
    "Lopez Branch Library",
  ];
  for (const lib of libraries) {
    const existingLib = await prisma.library.findFirst({
      where: { name: lib },
    });
    if (!existingLib) {
      await prisma.library.create({ data: { name: lib } });
    }
  }

  // ---------------------------------------------------------
  // 5. DOCUMENTS (Processing mockPublications & mockResults)
  // ---------------------------------------------------------
  console.log("Seeding Documents...");

  // Helper to handle Keywords
  const attachKeywords = async (docId: number, keywordString: string) => {
    const rawKeywords = keywordString.split(",").map((k) => k.trim());
    const uniqueKeywords = [...new Set(rawKeywords)].filter(
      (k) => k.length > 0,
    );

    for (const kText of uniqueKeywords) {
      const keyword = await prisma.keyword.upsert({
        where: { keywordText: kText },
        update: {},
        create: { keywordText: kText },
      });

      // link
      await prisma.documentKeyword.create({
        data: { documentId: docId, keywordId: keyword.id },
      });
    }
  };

  // Helper to handle Authors
  const attachAuthors = async (docId: number, authorsList: string[]) => {
    let order = 1;
    for (const authName of authorsList) {
      const author = await prisma.author.create({
        data: {
          fullName: authName.trim(),
          email: `author_${Math.random().toString(36).substring(2, 8)}@example.com`,
        },
      });

      await prisma.documentAuthor.create({
        data: {
          documentId: docId,
          authorId: author.id,
          authorOrder: order++,
        },
      });
    }
  };

  // --- Process mockPublications ---
  for (const pub of mockPublications) {
    // Find or create Course by abbreviation
    let course = await prisma.course.findFirst({
      where: { courseAbbr: pub.department.toUpperCase() },
    });
    if (!course) {
      const college = await prisma.college.findFirst({
        where: { collegeAbbr: pub.college.toUpperCase() },
      });
      course = await prisma.course.create({
        data: {
          courseName: `${pub.department.toUpperCase()} Course`,
          courseAbbr: pub.department.toUpperCase(),
          collegeId: college ? college.id : fallbackCollege.id,
        },
      });
    }

    const resType = await prisma.resourceType.findFirst({
      where: { typeName: { contains: pub.resourceType, mode: "insensitive" } },
    });
    const library = await prisma.library.findFirst({
      where: { name: pub.library },
    });

    const doc = await prisma.document.create({
      data: {
        title: pub.title,
        abstract: pub.abstract,
        filePath: `/uploads/${pub.id}.pdf`,
        datePublished: new Date(pub.datePublished),
        visibility: pub.visibility,
        downloadsCount: Math.floor(Math.random() * 100),
        citationCount: Math.floor(Math.random() * 20),
        uploaderId: uploader.id,
        courseId: course.id,
        resourceTypeId: resType ? resType.id : 1,
        libraryId: library ? library.id : 1,
      },
    });

    await attachKeywords(doc.id, pub.keywords);
    await attachAuthors(doc.id, pub.authors.split(","));
  }

  // --- Process mockResults (Treating as Articles) ---
  const articleType = await prisma.resourceType.findFirst({
    where: { typeName: "Article" },
  });
  const mainLib = await prisma.library.findFirst({
    where: { name: "Main Library" },
  });

  for (const res of mockResults) {
    let course = await prisma.course.findFirst({
      where: { courseName: res.field },
    });
    if (!course) {
      course = await prisma.course.create({
        data: {
          courseName: res.field,
          courseAbbr: res.field.substring(0, 3).toUpperCase(),
          collegeId: fallbackCollege.id,
        },
      });
    }

    const doc = await prisma.document.create({
      data: {
        title: res.title,
        abstract: res.abstract,
        filePath: `/uploads/res_${res.id}.pdf`,
        datePublished: new Date(res.date),
        visibility: "Public",
        downloadsCount: Math.floor(Math.random() * 500),
        citationCount: Math.floor(Math.random() * 50),
        uploaderId: uploader.id,
        courseId: course.id,
        resourceTypeId: articleType ? articleType.id : 1,
        libraryId: mainLib ? mainLib.id : 1,
      },
    });

    const fakeKeywords = res.title
      .split(" ")
      .filter((w) => w.length > 5)
      .join(", ");
    await attachKeywords(doc.id, fakeKeywords);
    await attachAuthors(doc.id, res.authors);
  }

  console.log("✅ Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
