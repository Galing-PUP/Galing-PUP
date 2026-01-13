// prisma/seed.ts

import { prisma } from "@/lib/db";
import { colleges, courses } from "@/data/collegeCourses";

import {
  DocStatus,
  TierName,
  ResourceTypes,
  RoleName,
  UserStatus,
} from "@/lib/generated/prisma/enums";
import { SubscriptionTier } from "@/lib/generated/prisma/client";
import { faker } from "@faker-js/faker";
import {
  DocumentCreateManyInput,
  UserCreateManyInput,
} from "@/lib/generated/prisma/models";

async function main() {
  console.log("🌱 Starting seed...");

  // SUBSCRIPTION TIERS
  console.log("Seeding Subscription Tiers...");
  const tiers: SubscriptionTier[] = [
    {
      id: 1,
      tierName: TierName.FREE,
      dailyDownloadLimit: 10,
      dailyCitationLimit: 10,
      maxBookmarks: 10,
      hasAds: true,
      hasAiInsights: false,
    },
    {
      id: 2,
      tierName: TierName.PAID,
      dailyDownloadLimit: null,
      dailyCitationLimit: null,
      maxBookmarks: null,
      hasAds: false,
      hasAiInsights: true,
    },
  ];

  await prisma.subscriptionTier.createMany({
    data: tiers,
    skipDuplicates: true,
  });

  // ACADEMIC DATA (Colleges, Courses)
  console.log("Seeding Academic Structures...");

  // Colleges
  await prisma.college.createMany({
    data: colleges,
    skipDuplicates: true,
  });

  // Courses
  await prisma.course.createMany({
    data: courses,
    skipDuplicates: true,
  });

  // Fetch all colleges and courses to get their IDs
  const allColleges = await prisma.college.findMany({
    select: { id: true },
  });

  const allCourses = await prisma.course.findMany({
    select: { id: true },
  });

  const allCourseIds = allCourses.map((c) => c.id);
  const allCollegeIds = allColleges.map((c) => c.id);

  // USERS
  console.log("Seeding Users...");
  const fakeUsers: UserCreateManyInput[] = [];

  // 10 REGISTERED users
  for (let i = 0; i < 10; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const fakeUser: UserCreateManyInput = {
      collegeId: null, // REGISTERED users don't have college affiliation
      supabaseAuthId: null,
      username: faker.internet.username({ firstName, lastName }),
      role: RoleName.REGISTERED,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      passwordHash: faker.internet.password(),
      registrationDate: faker.date.past({ years: 1 }),
      updatedDate: null,
      status: faker.helpers.arrayElement([
        UserStatus.PENDING,
        UserStatus.APPROVED,
      ]), // Exclude DELETED
      tierId: faker.helpers.arrayElement([1, 2]),
    };
    fakeUsers.push(fakeUser);
  }

  // 2 SUPERADMIN users
  for (let i = 0; i < 2; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const fullname = `${firstName} ${lastName}`;
    const fakeUser: UserCreateManyInput = {
      collegeId: null, // SUPERADMIN has access to all colleges
      supabaseAuthId: null,
      username: fullname, // username field is used as fullname for admins
      role: RoleName.SUPERADMIN,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      passwordHash: faker.internet.password(),
      registrationDate: faker.date.past({ years: 1 }),
      updatedDate: null,
      status: UserStatus.APPROVED,
      idNumber: faker.string.numeric(12),
      idImagePath: faker.system.commonFileName("png"),
      tierId: 2, // SUPERADMIN gets PAID tier
    };
    fakeUsers.push(fakeUser);
  }

  // 5 ADMIN users (college staff)
  for (let i = 0; i < 5; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const fullname = `${firstName} ${lastName}`;
    const fakeUser: UserCreateManyInput = {
      collegeId: faker.helpers.arrayElement(allCollegeIds), // ADMIN is assigned to a specific college
      supabaseAuthId: null,
      username: fullname, // username field is used as fullname for admins
      role: RoleName.ADMIN,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      passwordHash: faker.internet.password(),
      registrationDate: faker.date.past({ years: 1 }),
      updatedDate: null,
      status: UserStatus.APPROVED,
      idNumber: faker.string.numeric(12),
      idImagePath: faker.system.commonFileName("png"),
      tierId: 2, // ADMIN gets PAID tier
    };
    fakeUsers.push(fakeUser);
  }

  const createdUsers = await prisma.user.createManyAndReturn({
    data: fakeUsers,
    skipDuplicates: true,
    select: {
      id: true,
      role: true,
    },
  });

  const allUserIds = createdUsers.map((u) => u.id);

  // Filter for ADMIN and SUPERADMIN users only for document uploaders
  const adminUserIds = createdUsers
    .filter((u) => u.role === RoleName.ADMIN || u.role === RoleName.SUPERADMIN)
    .map((u) => u.id);

  // DOCUMENTS
  console.log("Seeding Documents...");
  const fakeDocs: DocumentCreateManyInput[] = [];
  for (let i = 0; i < 30; i++) {
    // Generate submission date first (older date)
    const datePublished = faker.date.past({ years: 10 });
    // Published date should be after submission (between submission and now)
    const submissionDate = faker.date.between({ from: datePublished, to: new Date() });
    
    const fakeDoc: DocumentCreateManyInput = {
      title: faker.lorem.sentence(),
      abstract: faker.lorem.paragraph({ min: 4, max: 7 }),
      filePath: faker.system.commonFileName("pdf"),
      originalFileName: faker.system.commonFileName("pdf"),
      fileSize: faker.number.int({ min: 1024, max: 10 * 1024 * 1024 }), // 1KB to 10MB
      mimeType: "application/pdf",
      datePublished,
      submissionDate,
      status: faker.helpers.arrayElement(Object.values(DocStatus)),
      resourceType: faker.helpers.arrayElement(Object.values(ResourceTypes)),
      downloadsCount: faker.number.int({ min: 0, max: 1000 }),
      citationCount: faker.number.int({ min: 0, max: 1000 }),
      aiSummary: faker.lorem.paragraph({ min: 4, max: 7 }),
      uploaderId: faker.helpers.arrayElement(adminUserIds),
      courseId: faker.helpers.arrayElement(allCourseIds),
    };
    fakeDocs.push(fakeDoc);
  }

  const createdDocs = await prisma.document.createManyAndReturn({
    data: fakeDocs,
    skipDuplicates: true,
    select: {
      id: true,
    },
  });

  const allDocIds = createdDocs.map((d) => d.id);

  // AUTHORS
  console.log("Seeding Authors...");
  const fakeAuthors = [];
  for (let i = 0; i < 30; i++) {
    const firstName = faker.person.firstName();
    const middleName = faker.person.middleName();
    const lastName = faker.person.lastName();
    const fullName = `${firstName} ${middleName} ${lastName}`;

    fakeAuthors.push({
      firstName,
      middleName: faker.datatype.boolean() ? middleName : null,
      lastName,
      fullName,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    });
  }

  const createdAuthors = await prisma.author.createManyAndReturn({
    data: fakeAuthors,
    skipDuplicates: true,
    select: {
      id: true,
    },
  });

  const allAuthorIds = createdAuthors.map((a) => a.id);

  // DOCUMENT AUTHORS (Junction Table)
  console.log("Linking Authors to Documents...");
  for (const docId of allDocIds) {
    const numAuthors = faker.number.int({ min: 1, max: 4 });
    const selectedAuthors = faker.helpers.arrayElements(
      allAuthorIds,
      numAuthors
    );

    for (let i = 0; i < selectedAuthors.length; i++) {
      await prisma.documentAuthor.create({
        data: {
          documentId: docId,
          authorId: selectedAuthors[i],
          authorOrder: i + 1,
        },
      });
    }
  }

  // KEYWORDS
  console.log("Seeding Keywords...");
  const academicKeywords = [
    "Machine Learning",
    "Artificial Intelligence",
    "Data Science",
    "Web Development",
    "Mobile Computing",
    "Cloud Computing",
    "Cybersecurity",
    "Database Management",
    "Software Engineering",
    "Network Security",
    "IoT",
    "Blockchain",
    "Computer Vision",
    "Natural Language Processing",
    "Big Data",
    "DevOps",
    "Agile Methodology",
    "User Experience",
    "Human-Computer Interaction",
    "Algorithms",
    "Data Structures",
    "Operating Systems",
    "Distributed Systems",
    "Microservices",
    "API Development",
    "Frontend Development",
    "Backend Development",
    "Full Stack",
    "React",
    "Node.js",
    "Python",
    "Java",
    "C++",
    "TypeScript",
    "Research Methodology",
    "Statistical Analysis",
    "Quantitative Research",
    "Qualitative Research",
  ];

  const fakeKeywords = academicKeywords.map((kw) => ({ keywordText: kw }));

  const createdKeywords = await prisma.keyword.createManyAndReturn({
    data: fakeKeywords,
    skipDuplicates: true,
    select: {
      id: true,
    },
  });

  const allKeywordIds = createdKeywords.map((k) => k.id);

  // DOCUMENT KEYWORDS (Junction Table)
  console.log("Linking Keywords to Documents...");
  for (const docId of allDocIds) {
    const numKeywords = faker.number.int({ min: 3, max: 8 });
    const selectedKeywords = faker.helpers.arrayElements(
      allKeywordIds,
      numKeywords
    );

    for (const keywordId of selectedKeywords) {
      await prisma.documentKeyword.create({
        data: {
          documentId: docId,
          keywordId: keywordId,
        },
      });
    }
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
