import { ResourceTypes, RoleName, TierName, DocStatus, UserStatus } from "@/lib/generated/prisma/enums";

/**
 * Formats a ResourceTypes enum value into a human-readable string.
 * @param resourceType - The ResourceTypes enum value
 * @returns A formatted, human-readable string
 * @example
 * formatResourceType(ResourceTypes.RESEARCH_PAPER) // "Research Paper"
 * formatResourceType(ResourceTypes.THESIS) // "Thesis"
 */
export function formatResourceType(resourceType: ResourceTypes): string {
  const formatMap: Record<ResourceTypes, string> = {
    [ResourceTypes.THESIS]: "Thesis",
    [ResourceTypes.CAPSTONE]: "Capstone",
    [ResourceTypes.DISSERTATION]: "Dissertation",
    [ResourceTypes.ARTICLE]: "Article",
    [ResourceTypes.RESEARCH_PAPER]: "Research Paper",
  };

  return formatMap[resourceType];
}

/**
 * Formats a RoleName enum value into a human-readable string.
 * @param role - The RoleName enum value
 * @returns A formatted, human-readable string
 * @example
 * formatRole(RoleName.SUPERADMIN) // "Super Admin"
 * formatRole(RoleName.REGISTERED) // "Registered User"
 */
export function formatRole(role: RoleName): string {
  const formatMap: Record<RoleName, string> = {
    [RoleName.REGISTERED]: "Registered User",
    [RoleName.ADMIN]: "Admin",
    [RoleName.SUPERADMIN]: "Super Admin",
  };

  return formatMap[role];
}

/**
 * Formats a TierName enum value into a human-readable string.
 * @param tier - The TierName enum value
 * @returns A formatted, human-readable string
 * @example
 * formatTier(TierName.FREE) // "Free"
 * formatTier(TierName.PAID) // "Premium"
 */
export function formatTier(tier: TierName): string {
  const formatMap: Record<TierName, string> = {
    [TierName.FREE]: "Free",
    [TierName.PAID]: "Premium",
  };

  return formatMap[tier];
}

/**
 * Formats a DocStatus enum value into a human-readable string.
 * @param status - The DocStatus enum value
 * @returns A formatted, human-readable string
 * @example
 * formatDocStatus(DocStatus.PENDING) // "Pending Review"
 * formatDocStatus(DocStatus.APPROVED) // "Approved"
 */
export function formatDocStatus(status: DocStatus): string {
  const formatMap: Record<DocStatus, string> = {
    [DocStatus.PENDING]: "Pending Review",
    [DocStatus.APPROVED]: "Approved",
    [DocStatus.REJECTED]: "Rejected",
    [DocStatus.DELETED]: "Deleted",
  };

  return formatMap[status];
}

/**
 * Formats a UserStatus enum value into a human-readable string.
 * @param status - The UserStatus enum value
 * @returns A formatted, human-readable string
 * @example
 * formatUserStatus(UserStatus.PENDING) // "Pending Verification"
 * formatUserStatus(UserStatus.APPROVED) // "Approved"
 */
export function formatUserStatus(status: UserStatus): string {
  const formatMap: Record<UserStatus, string> = {
    [UserStatus.PENDING]: "Pending Verification",
    [UserStatus.APPROVED]: "Approved",
    [UserStatus.DELETED]: "Deleted",
  };

  return formatMap[status];
}
