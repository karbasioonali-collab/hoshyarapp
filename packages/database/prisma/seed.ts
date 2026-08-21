import { PrismaClient, CategoryBranch } from "../generated/client";

const prisma = new PrismaClient();

type CategorySeed = {
  name: string;
  children?: CategorySeed[];
};

// درخت دسته‌بندی‌های پیش‌فرض سیستم (userId=null یعنی مشترک بین همه‌ی کاربران).
// این‌ها فقط نقطه‌ی شروعن؛ هر کاربر می‌تونه از داخل اپ دسته‌ی دلخواه خودش رو هم اضافه کنه.
const DEFAULT_CATEGORIES: Record<"INCOME" | "EXPENSE", CategorySeed[]> = {
  INCOME: [
    { name: "حقوق" },
    { name: "سود کار و پیشه" },
    { name: "اجاره دریافتی" },
    { name: "سود سهام" },
    { name: "طلب" },
    { name: "قرض" },
    { name: "فروش" },
  ],
  EXPENSE: [
    { name: "اجاره پرداختی" },
    { name: "رستوران و کافه" },
    { name: "خرید" },
    {
      name: "مواد غذایی",
      children: [
        { name: "سوپر" },
        { name: "گوشت" },
        { name: "مرغ و ماهی" },
        { name: "نان و شیرینی" },
        { name: "میوه" },
        { name: "سایر" },
      ],
    },
    { name: "تاکسی" },
    { name: "تعمیرات" },
    { name: "سفر" },
    { name: "پزشکی" },
    { name: "تفریحات" },
    { name: "شارژ و قبض" },
  ],
};

async function upsertCategory(
  branch: CategoryBranch,
  name: string,
  parentId: string | null,
  sortOrder: number,
) {
  const existing = await prisma.category.findFirst({
    where: { branch, name, parentId, userId: null },
  });
  if (existing) return existing;
  return prisma.category.create({
    data: { branch, name, parentId, userId: null, sortOrder },
  });
}

async function seedTree(branch: CategoryBranch, items: CategorySeed[], parentId: string | null = null) {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const category = await upsertCategory(branch, item.name, parentId, i);
    if (item.children?.length) {
      await seedTree(branch, item.children, category.id);
    }
  }
}

async function main() {
  await seedTree("INCOME" as CategoryBranch, DEFAULT_CATEGORIES.INCOME);
  await seedTree("EXPENSE" as CategoryBranch, DEFAULT_CATEGORIES.EXPENSE);
  // eslint-disable-next-line no-console
  console.log("دسته‌بندی‌های پیش‌فرض با موفقیت seed شدن.");
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
