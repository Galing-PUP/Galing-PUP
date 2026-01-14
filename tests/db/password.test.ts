import { prisma } from '@/lib/db'
import { RoleName, UserStatus } from '@/lib/generated/prisma/enums'
import { compare, hash } from 'bcrypt'
import { afterAll, beforeAll, describe, expect, test } from 'bun:test'

// ---------------------------------------------------------
// CONSTANTS & STATE
// ---------------------------------------------------------
const ORIGINAL_PASS = 'supersecretpassword666'
const NEW_PASS_VIA_ID = 'changed_via_id_111'
const NEW_PASS_VIA_USERNAME = 'changed_via_username_222'
const NEW_PASS_VIA_ROLE_USER = 'changed_via_role_user_333'
const NEW_PASS_VIA_ROLE_ID = 'changed_via_role_id_444'

const TEST_USER = {
  username: 'charliekirk_security',
  email: 'security_test@gmail.com',
}

let testUserId: number
let testTierId: number

describe('User Password Management Tests (camelCase Prisma client)', () => {
  // ---------------------------------------------------------
  // SETUP
  // ---------------------------------------------------------
  beforeAll(async () => {
    // 1. Get Dependencies
    const tier = await prisma.subscriptionTier.findFirst()
    if (!tier) throw new Error('Seeding Error: Missing tier')

    testTierId = tier.id

    // 2. Clean Stale User
    const existing = await prisma.user.findFirst({
      where: { username: TEST_USER.username },
    })
    if (existing) {
      await prisma.user.delete({ where: { id: existing.id } })
    }

    // 3. Create Initial User
    const hashedOriginal = await hash(ORIGINAL_PASS, 10)
    const user = await prisma.user.create({
      data: {
        username: TEST_USER.username,
        email: TEST_USER.email,
        passwordHash: hashedOriginal,
        registrationDate: new Date(),
        status: UserStatus.APPROVED,
        role: RoleName.REGISTERED,
        tierId: testTierId,
      },
    })
    testUserId = user.id
  })

  afterAll(async () => {
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } })
    }
    await prisma.$disconnect()
  })

  // ---------------------------------------------------------
  // CASE 1: UPDATE VIA USER ID
  // ---------------------------------------------------------
  test('Case 1: Update password via id', async () => {
    const newHash = await hash(NEW_PASS_VIA_ID, 10)

    const updated = await prisma.user.update({
      where: { id: testUserId },
      data: { passwordHash: newHash },
    })

    // Verify update occurred
    expect(updated.passwordHash).not.toBeNull()
    const isMatch = await compare(NEW_PASS_VIA_ID, updated.passwordHash!)
    expect(isMatch).toBeTrue()
  })

  // ---------------------------------------------------------
  // CASE 2: UPDATE VIA USERNAME
  // ---------------------------------------------------------
  test('Case 2: Update password via username', async () => {
    const newHash = await hash(NEW_PASS_VIA_USERNAME, 10)

    const updated = await prisma.user.update({
      where: { username: TEST_USER.username },
      data: { passwordHash: newHash },
    })

    expect(updated.passwordHash).not.toBeNull()
    const isMatch = await compare(NEW_PASS_VIA_USERNAME, updated.passwordHash!)
    expect(isMatch).toBeTrue()
  })

  // ---------------------------------------------------------
  // CASE 3: UPDATE VIA REVERSE SEARCH (ROLE ID + USERNAME)
  // ---------------------------------------------------------
  test('Case 3: Update via reverse search on role and username', async () => {
    // 1. Find user using Role and Username
    const foundUser = await prisma.user.findFirst({
      where: {
        username: TEST_USER.username,
        role: RoleName.REGISTERED,
      },
    })

    if (!foundUser)
      throw new Error(
        'Reverse Search Failed: User not found with that role/username combination',
      )

    // 2. Update found user
    const newHash = await hash(NEW_PASS_VIA_ROLE_USER, 10)
    const updated = await prisma.user.update({
      where: { id: foundUser.id },
      data: { passwordHash: newHash },
    })

    expect(updated.passwordHash).not.toBeNull()
    const isMatch = await compare(NEW_PASS_VIA_ROLE_USER, updated.passwordHash!)
    expect(isMatch).toBeTrue()
  })

  // ---------------------------------------------------------
  // CASE 4: UPDATE VIA REVERSE SEARCH (ROLE ID + USER ID)
  // ---------------------------------------------------------
  test('Case 4: Update via reverse search on role and id', async () => {
    // 1. Find user using Role and ID
    const foundUser = await prisma.user.findFirst({
      where: {
        id: testUserId,
        role: RoleName.REGISTERED,
      },
    })

    if (!foundUser)
      throw new Error(
        'Reverse Search Failed: User not found with that role/id combination',
      )

    // 2. Update found user
    const newHash = await hash(NEW_PASS_VIA_ROLE_ID, 10)
    const updated = await prisma.user.update({
      where: { id: foundUser.id },
      data: { passwordHash: newHash },
    })

    expect(updated.passwordHash).not.toBeNull()
    const isMatch = await compare(NEW_PASS_VIA_ROLE_ID, updated.passwordHash!)
    expect(isMatch).toBeTrue()
  })

  // ---------------------------------------------------------
  // VERIFICATION & REVERT
  // ---------------------------------------------------------

  test("Assert failure if password doesn't match original", async () => {
    // Fetch current user from DB (Currently holds Case 4's password)
    const currentUser = await prisma.user.findUnique({
      where: { id: testUserId },
    })

    // Compare with the ORIGINAL password (created in setup)
    // We expect this to be FALSE because we have changed it multiple times.
    const isMatch = await compare(
      ORIGINAL_PASS,
      currentUser?.passwordHash || '',
    )

    // We expect "false", so we assert that it is false.
    expect(isMatch).toBeFalse()
  })

  test('Revert back to original password and Assert Match', async () => {
    // 1. Revert
    const originalHash = await hash(ORIGINAL_PASS, 10)
    await prisma.user.update({
      where: { id: testUserId },
      data: { passwordHash: originalHash },
    })

    // 2. Fetch fresh data
    const revertedUser = await prisma.user.findUnique({
      where: { id: testUserId },
    })

    // 3. Assert password matches original
    const isMatch = await compare(
      ORIGINAL_PASS,
      revertedUser?.passwordHash || '',
    )

    if (!isMatch) {
      console.error('Hash Mismatch! Expected original password to work.')
    }

    expect(isMatch).toBeTrue()
    console.log('Password successfully reverted and verified.')
  })
})
