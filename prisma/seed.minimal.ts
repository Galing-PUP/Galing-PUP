// prisma/seed.minimal.ts

import { colleges, courses } from '@/data/collegeCourses'
import { prisma } from '@/lib/db'

import { SubscriptionTier } from '@/lib/generated/prisma/client'
import { RoleName, TierName, UserStatus } from '@/lib/generated/prisma/enums'
import { supabaseAdmin } from '@/lib/supabase/admin'
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
   * Syncs with both Supabase Auth and local database.
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

    // Check if user already exists in local DB
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      console.log(`⏭️  ${role} account already exists: ${email}`)
      return
    }

    console.log(`Processing ${role} account for: ${email}`)

    const hashedPassword = await hash(password, 10)

    // 1. Sync with Supabase Auth
    let supabaseAuthId: string | null = null
    const {
      data: { users },
      error: listError,
    } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
      console.error(`Error listing Supabase users for ${role}:`, listError)
    }

    const existingAuthUser = users?.find((u) => u.email === email)

    if (existingAuthUser) {
      console.log(`Supabase Auth user found for ${role}. Updating...`)
      const { error: updateError } =
        await supabaseAdmin.auth.admin.updateUserById(existingAuthUser.id, {
          password: password,
          email_confirm: true,
          user_metadata: {
            full_name: username,
            role: role,
          },
        })
      if (updateError) {
        console.error(
          `Failed to update Supabase Auth password for ${role}:`,
          updateError,
        )
      } else {
        supabaseAuthId = existingAuthUser.id
      }
    } else {
      console.log(`Supabase Auth user not found for ${role}. Creating...`)
      const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email: email,
          password: password,
          email_confirm: true,
          user_metadata: {
            full_name: username,
            role: role,
          },
        })
      if (createError) {
        console.error(
          `Failed to create Supabase Auth user for ${role}:`,
          createError,
        )
      } else if (newUser.user) {
        supabaseAuthId = newUser.user.id
      }
    }

    // 2. Create in Local DB
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
        ...(supabaseAuthId ? { supabaseAuthId: supabaseAuthId } : {}),
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
