// tests/db/connection.test.ts
import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { prisma } from "@/lib/db";

afterAll(async () => {
  await prisma.$disconnect();
});

test("prisma client exists", () => {
  expect(prisma).toBeDefined();
});

test("db responds", async () => {
  const r = await prisma.$queryRawUnsafe("SELECT 1");
  expect(r).toBeTruthy();
});
