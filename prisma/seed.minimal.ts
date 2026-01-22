// prisma/seed.minimal.ts

import { colleges, courses } from '@/data/collegeCourses'
import { prisma } from '@/lib/db'

import { SubscriptionTier } from '@/lib/generated/prisma/client'
import { TierName } from '@/lib/generated/prisma/enums'

/**
 * Minimal seeder for essential database tables.
 * Seeds only:
 * - Subscription Tiers
 * - Colleges
 * - Courses
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
