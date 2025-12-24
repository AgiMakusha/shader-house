// Script to promote a user to admin role
// Usage: npx tsx scripts/make-admin.ts <email>

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function makeAdmin() {
  const email = process.argv[2];
  
  if (!email) {
    console.error("Usage: npx tsx scripts/make-admin.ts <email>");
    console.error("Example: npx tsx scripts/make-admin.ts admin@example.com");
    process.exit(1);
  }

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      console.error(`User with email "${email}" not found.`);
      process.exit(1);
    }

    if (user.role === "ADMIN") {
      console.log(`User "${user.name}" (${user.email}) is already an admin.`);
      process.exit(0);
    }

    // Promote to admin
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
      select: { id: true, name: true, email: true, role: true },
    });

    console.log(`\n✅ Successfully promoted user to admin!\n`);
    console.log(`  Name:  ${updatedUser.name}`);
    console.log(`  Email: ${updatedUser.email}`);
    console.log(`  Role:  ${updatedUser.role}`);
    console.log(`\nThe user can now access /admin after logging in.\n`);
  } catch (error) {
    console.error("Error promoting user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();



