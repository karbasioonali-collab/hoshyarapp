// ساخت یا به‌روزرسانی یک کاربر ادمین از خط فرمان:
//   npx tsx scripts/create-admin.ts admin@example.com "رمز عبور" "نام ادمین"
import { prisma } from "@hoshyar/database";
import bcrypt from "bcryptjs";

async function main() {
  const [email, password, name] = process.argv.slice(2);
  if (!email || !password) {
    console.error("استفاده: npx tsx scripts/create-admin.ts <email> <password> [name]");
    process.exit(1);
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, name: name ?? email },
    create: { email, passwordHash, name: name ?? email, role: "SUPER_ADMIN" },
  });
  console.log(`ادمین ساخته/به‌روزرسانی شد: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
