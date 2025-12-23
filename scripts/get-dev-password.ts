import { prisma } from '../lib/db/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  // Check which developers exist and if they have passwords
  const devs = await prisma.user.findMany({
    where: { role: 'DEVELOPER' },
    select: { id: true, email: true, password: true }
  });
  
  console.log('=== DEVELOPERS ===');
  for (const d of devs) {
    console.log(`${d.email}: Has password: ${!!d.password}`);
  }
  
  // Set a password for gold@gmail.com
  const hashedPassword = await bcrypt.hash('gold123', 10);
  await prisma.user.update({
    where: { email: 'gold@gmail.com' },
    data: { password: hashedPassword }
  });
  console.log('\nPassword set for gold@gmail.com: gold123');
}

main().finally(() => prisma.$disconnect());
