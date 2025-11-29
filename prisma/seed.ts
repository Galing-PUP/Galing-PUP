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
      Tier_Name: "Free",
      Daily_Download_Limit: 5,
      Daily_Citation_Limit: 5,
      Max_Bookmarks: 10,
      Has_Ads: true,
      Has_AI_Insights: false,
    },
    {
      Tier_Name: "Paid",
      Daily_Download_Limit: 100,
      Daily_Citation_Limit: 100,
      Max_Bookmarks: 500,
      Has_Ads: false,
      Has_AI_Insights: true,
    },
  ];

  for (const tier of tiers) {
    await prisma.sUBSCRIPTION_TIER.upsert({
      where: { Tier_ID: tiers.indexOf(tier) + 1 }, // Assuming ID 1 and 2
      update: {},
      create: tier,
    });
  }

  // ---------------------------------------------------------
  // 2. ROLES
  // ---------------------------------------------------------
  console.log("Seeding Roles...");
  const roles = ["Viewer", "Registered", "Admin", "Superadmin"];
  
  for (const roleName of roles) {
    await prisma.rOLE.upsert({
      where: { Role_ID: roles.indexOf(roleName) + 1 },
      update: {},
      create: { Role_Name: roleName },
    });
  }

  // ---------------------------------------------------------
  // 3. USERS
  // ---------------------------------------------------------
  console.log("Seeding Users...");
  
  // Helper to map string role to ID
  const getRoleId = (roleStr: string) => {
    const map: Record<string, number> = { "Viewer": 1, "Registered": 2, "Admin": 3, "Superadmin": 4 };
    return map[roleStr] || 2; // Default to Registered
  };

  for (const user of mockUsers) {
    // Generate a username from email if not present
    const username = user.email.split("@")[0];
    
    await prisma.uSER.upsert({
      where: { Email: user.email },
      update: {},
      create: {
        Username: username,
        Email: user.email,
        Password_Hash: "hashed_placeholder_123", // In real app, use bcrypt
        Registration_Date: new Date(),
        Is_Verified: user.status === "Active",
        Current_Role_ID: getRoleId(user.role),
        Tier_ID: 1, // Default to Free
      },
    });
  }

  // Fetch a valid uploader ID (e.g., the first admin) to use for documents
  const uploader = await prisma.uSER.findFirst();
  if (!uploader) throw new Error("No users created");

  // ---------------------------------------------------------
  // 4. ACADEMIC DATA (Colleges, Courses, Resource Types, Libraries)
  // ---------------------------------------------------------
  console.log("Seeding Academic Structures...");

  // Unique Colleges from mockPublications
  const collegeMap: Record<string, string> = {
    "ccis": "College of Computer and Information Sciences",
    "ce": "College of Engineering",
    "cba": "College of Business Administration",
    "coed": "College of Education",
    "cs" : "College of Science",
    "itech": "Institute of Technology",
    "cadbe": "College of Architecture, Design, and Built Environment",
    "caf" : "College of Accountancy and Finance",
    "cpspa" : "College of Political Science and Public Administration",
    "chk" : "College of Human Kinetics",
    "cthtm" : "College of Tourism and Hospitality Management",
  };

  for (const [abbr, name] of Object.entries(collegeMap)) {
    await prisma.cOLLEGE.create({
      data: {
        College_Name: name,
        College_Abbr: abbr.toUpperCase(),
      },
    });
  }
  
  // Create a default college for unknown fields from mockResults
  const defaultCollege = await prisma.cOLLEGE.create({
    data: { College_Name: "General Sciences", College_Abbr: "GEN" }
  });

  // Resource Types
  const resourceTypes = ["Thesis", "Capstone", "Dissertation", "Article", "Research Paper"];
  for (const type of resourceTypes) {
    await prisma.rESOURCE_TYPE.create({ data: { Type_Name: type } });
  }

  // Libraries
  const libraries = ["Main Library", "Engineering Library", "Business Library", "Bataan Branch Library", "Lopez Branch Library"];
  for (const lib of libraries) {
    await prisma.lIBRARY.create({ data: { Name: lib } });
  }

  // ---------------------------------------------------------
  // 5. DOCUMENTS (Processing mockPublications & mockResults)
  // ---------------------------------------------------------
  console.log("Seeding Documents...");

  // Helper to handle Keywords
  const attachKeywords = async (docId: number, keywordString: string) => {
    // Deduplicate keywords using Set to avoid P2002 error
    const rawKeywords = keywordString.split(",").map(k => k.trim());
    const uniqueKeywords = [...new Set(rawKeywords)].filter(k => k.length > 0);

    for (const kText of uniqueKeywords) {
      const keyword = await prisma.kEYWORD.upsert({
        where: { Keyword_Text: kText },
        update: {},
        create: { Keyword_Text: kText },
      });

      // Now safe to create the link
      await prisma.dOCUMENT_KEYWORD.create({
        data: { Document_ID: docId, Keyword_ID: keyword.Keyword_ID },
      });
    }
  };

  // Helper to handle Authors
  const attachAuthors = async (docId: number, authorsList: string[]) => {
    let order = 1;
    for (const authName of authorsList) {
      // Simple author creation (duplication possible if names vary slightly, but fine for seed)
      // In prod, you'd check email or unique ID
      const author = await prisma.aUTHOR.create({
        data: { Full_Name: authName.trim(), Email: `author_${Math.random().toString(36).substr(2, 5)}@example.com` }
      });
      
      await prisma.dOCUMENT_AUTHOR.create({
        data: {
          Document_ID: docId,
          Author_ID: author.Author_ID,
          Author_Order: order++,
        }
      });
    }
  };

  // --- Process mockPublications ---
  for (const pub of mockPublications) {
    // Find or create Course
    let course = await prisma.cOURSE.findFirst({ where: { Course_Abbr: pub.department.toUpperCase() } });
    if (!course) {
        // Find the college ID
        const college = await prisma.cOLLEGE.findFirst({ where: { College_Abbr: pub.college.toUpperCase() }});
        course = await prisma.cOURSE.create({
            data: {
                Course_Name: pub.department.toUpperCase() + " Course", // Placeholder name
                Course_Abbr: pub.department.toUpperCase(),
                College_ID: college ? college.College_ID : defaultCollege.College_ID
            }
        });
    }

    const resType = await prisma.rESOURCE_TYPE.findFirst({ where: { Type_Name: { contains: pub.resourceType, mode: 'insensitive' } } });
    const library = await prisma.lIBRARY.findFirst({ where: { Name: pub.library } });

    const doc = await prisma.dOCUMENT.create({
      data: {
        Title: pub.title,
        Abstract: pub.abstract,
        File_Path: `/uploads/${pub.id}.pdf`,
        Date_Published: new Date(pub.datePublished),
        Visibility: pub.visibility,
        Downloads_Count: Math.floor(Math.random() * 100),
        Citation_Count: Math.floor(Math.random() * 20),
        Uploader_ID: uploader.User_ID,
        Course_ID: course.Course_ID,
        ResourceType_ID: resType ? resType.ResourceType_ID : 1,
        Library_ID: library ? library.Library_ID : 1,
      },
    });

    await attachKeywords(doc.Document_ID, pub.keywords);
    await attachAuthors(doc.Document_ID, pub.authors.split(","));
  }

  // --- Process mockResults (Treating as Articles) ---
  const articleType = await prisma.rESOURCE_TYPE.findFirst({ where: { Type_Name: "Article" } });
  const mainLib = await prisma.lIBRARY.findFirst({ where: { Name: "Main Library" } });

  for (const res of mockResults) {
    // Map Field to Course
    // We try to find a course that matches the field, otherwise create a generic one
    let course = await prisma.cOURSE.findFirst({ where: { Course_Name: res.field }});
    if (!course) {
        course = await prisma.cOURSE.create({
            data: {
                Course_Name: res.field,
                Course_Abbr: res.field.substring(0, 3).toUpperCase(),
                College_ID: defaultCollege.College_ID
            }
        });
    }

    const doc = await prisma.dOCUMENT.create({
      data: {
        Title: res.title,
        Abstract: res.abstract,
        File_Path: `/uploads/res_${res.id}.pdf`,
        Date_Published: new Date(res.date), // "January 2025" is parsable by new Date()
        Visibility: "Public",
        Downloads_Count: Math.floor(Math.random() * 500),
        Citation_Count: Math.floor(Math.random() * 50),
        Uploader_ID: uploader.User_ID,
        Course_ID: course.Course_ID,
        ResourceType_ID: articleType ? articleType.ResourceType_ID : 1,
        Library_ID: mainLib ? mainLib.Library_ID : 1,
      }
    });

    // MockResults doesn't have keywords, so we extract some words from title for demo
    const fakeKeywords = res.title.split(" ").filter(w => w.length > 5).join(", ");
    await attachKeywords(doc.Document_ID, fakeKeywords);
    await attachAuthors(doc.Document_ID, res.authors);
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