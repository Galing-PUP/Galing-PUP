// prisma/seed.minimal.ts

import { colleges, courses } from '@/data/collegeCourses'
import { prisma } from '@/lib/db'

import { SubscriptionTier } from '@/lib/generated/prisma/client'
import { RoleName, TierName, UserStatus } from '@/lib/generated/prisma/enums'
import { hash } from 'bcryptjs'

/**
 * Minimal seeder for essential database tables.
 * Seeds only:
 * - Subscription Tiers
 * - Colleges
 * - Courses
 * - Owner, Superadmin, and Admin users (from environment variables)
 */
async function main() {
  console.log('🌱 Starting minimal seed...')

  // SUBSCRIPTION TIERS
  console.log('Seeding Subscription Tiers...')
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
  ]

  await prisma.subscriptionTier.createMany({
    data: tiers,
    skipDuplicates: true,
  })
  console.log('✅ Subscription Tiers seeded')

  // ACADEMIC DATA (Colleges, Courses)
  console.log('Seeding Academic Structures...')

  // Colleges
  await prisma.college.createMany({
    data: colleges,
    skipDuplicates: true,
  })
  console.log('✅ Colleges seeded')

  // Courses
  await prisma.course.createMany({
    data: courses,
    skipDuplicates: true,
  })
  console.log('✅ Courses seeded')

  // ADMIN ACCOUNTS
  console.log('Seeding Admin Accounts...')

  /**
   * Seeds an admin account if it doesn't already exist.
   * @param email - User email from environment variable
   * @param password - User password from environment variable
   * @param role - User role (OWNER, SUPERADMIN, ADMIN)
   * @param username - Display name for the user
   * @param idNumber - ID number for the user
   */
  const seedAdminAccount = async (
    email: string | undefined,
    password: string | undefined,
    role: RoleName,
    username: string,
    idNumber: string,
  ) => {
    if (!email || !password) {
      console.log(`⚠️  Skipping ${role}: Missing environment variables`)
      return
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      console.log(`⏭️  ${role} account already exists: ${email}`)
      return
    }

    const hashedPassword = await hash(password, 10)

    await prisma.user.create({
      data: {
        email,
        username,
        passwordHash: hashedPassword,
        role,
        status: UserStatus.APPROVED,
        tierId: 2, // Premium tier
        registrationDate: new Date(),
        idNumber,
      },
    })

    console.log(`✅ ${role} account created: ${email}`)
  }

  // Seed Owner
  await seedAdminAccount(
    process.env.OWNER_EMAIL,
    process.env.OWNER_PASSWORD,
    RoleName.OWNER,
    'System Owner',
    '000000000000',
  )

  // Seed Superadmin
  await seedAdminAccount(
    process.env.SUPERADMIN_EMAIL,
    process.env.SUPERADMIN_PASSWORD,
    RoleName.SUPERADMIN,
    'System Superadmin',
    '000000000001',
  )

  // Seed Admin
  await seedAdminAccount(
    process.env.ADMIN_EMAIL,
    process.env.ADMIN_PASSWORD,
    RoleName.ADMIN,
    'System Admin',
    '000000000002',
  )

  console.log('✅ Minimal seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
