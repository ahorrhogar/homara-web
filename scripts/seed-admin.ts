/**
 * Idempotent admin seed.
 *   ADMIN_INITIAL_EMAIL + ADMIN_INITIAL_PASSWORD must be set in .env.local
 *
 * Usage: npm run db:seed-admin
 */
import { auth } from "../src/lib/auth";
import { db } from "../src/lib/db";

async function main() {
  const email = process.env.ADMIN_INITIAL_EMAIL;
  const password = process.env.ADMIN_INITIAL_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_INITIAL_EMAIL and ADMIN_INITIAL_PASSWORD must be set");
  }

  const existing = await db.user.findUnique({ where: { email } });

  if (existing) {
    if (existing.role !== "admin") {
      await db.user.update({
        where: { id: existing.id },
        data: { role: "admin" },
      });
      console.info(`✓ Promoted existing user ${email} to admin`);
    } else {
      console.info(`✓ User ${email} already exists with admin role — no-op`);
    }
    return;
  }

  const result = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name: email.split("@")[0],
    },
  });

  if (!result?.user?.id) {
    throw new Error(`signUpEmail returned no user — got ${JSON.stringify(result)}`);
  }

  await db.user.update({
    where: { id: result.user.id },
    data: { role: "admin", emailVerified: true },
  });

  console.info(`✓ Created admin user ${email}`);
}

main()
  .catch((err) => {
    console.error("seed-admin failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
