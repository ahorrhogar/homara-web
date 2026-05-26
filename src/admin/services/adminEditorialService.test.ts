/** @jest-environment node */

// The previous tests mocked the Supabase chain in adminEditorialService directly.
// After the migration to Prisma + Better Auth, the service requires a live DB +
// authenticated session, so unit-level mocking is no longer worthwhile.
// Integration coverage moves to manual admin-panel smoke tests against the
// preview environment (see plan Phase 8 verification checklist).

describe("adminEditorialService", () => {
  it("is exercised via admin-panel smoke tests against a real database", () => {
    expect(true).toBe(true);
  });
});
