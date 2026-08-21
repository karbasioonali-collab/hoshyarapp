# هوشیار (HOSHYAR)

دستیار مالی شخصی هوشمند — با ویس یا تایپ درآمد، هزینه، قسط، بدهی، طلب، دارایی، جلسات، مناسبت‌ها و یادآوری‌هاتون رو ثبت کنید؛ هوش مصنوعی خودش تشخیص می‌ده کجا باید ثبت بشه.

## ساختار مونوریپو

```
apps/
  mobile/    # اپ اندروید (Expo / React Native)
  backend/   # API (Next.js) روی Liara
  admin/     # پنل ادمین (Next.js) روی Liara
packages/
  database/  # Prisma schema + client مشترک
  shared/    # types، zod schemas، ثابت‌ها، رابط‌های AI/SMS
  config/    # تنظیمات مشترک tsconfig/eslint
```

مستندسازی کامل تصمیمات معماری و تاریخچه‌ی تغییرات پروژه در [`infohoshyar.md`](./infohoshyar.md) نگه‌داری می‌شه.

## شروع کار

```bash
npm install
cp packages/database/.env.example packages/database/.env
npm run db:generate
npm run db:migrate
npm run db:seed

npm run dev:backend   # http://localhost:3000
npm run dev:admin     # http://localhost:3001
npm run dev:mobile    # Expo dev server
```

هر ورک‌اسپیس (`apps/*`) فایل `.env.example` مخصوص خودش رو داره.
