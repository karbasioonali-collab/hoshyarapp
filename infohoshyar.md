# مستندسازی پروژه‌ی هوشیار (HOSHYAR)

این فایل مرجع زنده‌ی پروژه‌ست: معماری، تصمیم‌های کلیدی، و تاریخچه‌ی تغییرات مهم اینجا ثبت می‌شه. هر تغییر معماری/تصمیم مهم جدید باید به بخش «تاریخچه‌ی تغییرات» اضافه بشه.

## معرفی

هوشیار یک دستیار مالی شخصی فارسیه که با **ویس یا تایپ** کار می‌کنه. کاربر درآمد، هزینه، قسط، بدهی، طلب، دارایی، جلسات، مناسبت‌ها و یادآوری‌هاش رو ثبت می‌کنه و هوش مصنوعی خودش تشخیص می‌ده کجا باید ثبت بشه و همه‌جای مرتبط رو خودکار به‌روز می‌کنه. هدف بلندمدت: تبدیل‌شدن به سوپراپ (فراتر از مدیریت مالی) — پس معماری از ابتدا ماژولار طراحی شده.

## استک فنی

| بخش | فناوری |
|---|---|
| اپ موبایل | React Native + Expo (اندروید؛ iOS فاز بعد) |
| بک‌اند | Next.js (App Router) روی Liara |
| پنل ادمین | Next.js جدا روی Liara |
| دیتابیس | PostgreSQL روی Liara + Prisma ORM |
| احراز هویت | OTP موبایل **و** ایمیل/رمز (هر دو، هم‌زمان) |
| هوش مصنوعی | لایه‌ی abstract (`AiProvider`) — پیاده‌سازی پیش‌فرض آوالای/متیس پشت env var، قابل‌تعویض بدون تغییر بقیه‌ی کد |
| پیامک OTP | لایه‌ی abstract (`SmsProvider`) — پیش‌فرض stub لاگ‌محور تا provider واقعی (کاوه‌نگار/ملی‌پیامک) وصل بشه |
| مونوریپو | npm workspaces (بدون turborepo، برای سادگیِ MVP) |

## ساختار پوشه‌ها

```
hoshyarapp/
├── apps/
│   ├── mobile/     # Expo app - اندروید
│   ├── backend/    # Next.js API
│   └── admin/      # Next.js پنل ادمین
├── packages/
│   ├── database/   # Prisma schema + client + seed
│   ├── shared/     # types/enums/zod schemas مشترک FE+BE
│   └── config/     # tsconfig/eslint مشترک
└── infohoshyar.md  # همین فایل
```

## اصول معماری بنیادین

1. **دسته‌بندی‌ها رکورد دیتابیسن، نه هاردکد.** جدول `Category` با `parentId` خودارجاع (self-relation) برای زیرشاخه‌های تودرتو (مثلاً «مواد غذایی» → «سوپر»). دسته‌بندی با `userId = null` یعنی پیش‌فرض سیستم (مشترک بین همه)؛ `userId` غیرنال یعنی دسته‌ی دلخواهی که همون کاربر اضافه کرده. افزودن دسته‌ی جدید = یک insert ساده، بدون نیاز به تغییر کد یا migration.
2. **سرویس مرکزی حسابداری (`ledger-service`).** تنها نقطه‌ی ورودی برای هر تغییر مالی (دستی، ویس، یا خودکار مثل پرداخت قسط). هر عملیات در `prisma.$transaction` اتمیک اجرا می‌شه و هم‌زمان موجودی بانک، جمع دسته، و جاهای مرتبط رو اصلاح می‌کنه؛ و یک لیست `LedgerEvent` با جمله‌ی فارسی‌ی ساده (مثل «۲۰۰ هزار تومان از حساب ملی کم شد») برمی‌گردونه که مستقیم به کاربر نشون داده می‌شه.
3. **نام‌گذاری ستون‌های جدول قابل‌تغییره.** جدول `ColumnLabelOverride` (`tableKey` + `columnKey` + `customLabel` به‌ازای هر کاربر) این امکان رو بدون نیاز به تغییر اسکیمای دیتابیس در آینده فراهم می‌کنه.
4. **لایه‌های AI/SMS به‌صورت adapter انتزاعی.** تعویض سرویس واسط (آوالای ⇄ متیس، یا هر SMS gateway) فقط با تغییر پیاده‌سازی پشت اینترفیس مشترک، بدون دست‌زدن به بقیه‌ی کد.

## مدل داده (خلاصه)

`User`, `OtpCode`, `AdminUser`, `BankAccount`, `Category` (۶ سرشاخه‌ی ثابت: INCOME/INSTALLMENT/EXPENSE/DEBT/RECEIVABLE/ASSET با رنگ ثابت)، `Transaction` (لجر مرکزی)، `InstallmentPlan` + `InstallmentPayment`، `PersonLedgerEntry` (بدهی/طلب یکپارچه با فیلد `direction`)، `Asset`، `Event` (مناسبت‌ها)، `Appointment` (جلسات)، `Reminder`، `OnboardingAnswer`، `ColumnLabelOverride`، `LedgerEvent`، `VoiceInteraction`.

جزئیات کامل فیلدها در `packages/database/prisma/schema.prisma`.

## قوانین UI/UX سراسری

- پالت: سورمه‌ای `#0a1a3f` + فیروزه‌ای `#2dd9e8` / `#14b8a6` روی پس‌زمینه‌ی روشن؛ گوشه‌های گرد.
- «توضیحات» همه‌جا «شرح» نوشته می‌شه؛ «اصلاح» همه‌جا «ویرایش».
- جدول‌ها: ستون اول (ردیف) ثابت، بقیه قابل‌تغییرنامه؛ آیکون افزودن سمت راست، میکروفون سمت چپ؛ دکمه‌ی حذف همیشه قرمز؛ فیلدهای روز/ماه/ساعت کشویی؛ تاریخ شمسی، ساعت ۲۴ساعته.
- باکس‌های دسته‌بندی: آخرین باکس همیشه خالی برای افزودن دسته‌ی دلخواه جدید.
- هر صفحه: انتخاب‌گر بازه‌ی زمانی + نمودار ستونی مرتبط + ورودی ویس/تایپ + دکمه‌ی «بازگشت به خانه».
- رنگ ۶ سرشاخه در نمودار خلاصه‌ی «حساب و کتاب»: درآمد=سبز، اقساط=نارنجی، هزینه‌های جاری=قرمز، طلب‌ها=آبی، بدهی‌ها=بنفش، دارایی‌ها=زرد.

## وضعیت فعلی

نسخه‌ی اول اسکلت کامل شد و هر سه اپ (`backend`, `admin`, `mobile`) build/typecheck تمیز رد می‌شن. جزئیات کامل هر بخش:

### بک‌اند (`apps/backend`)
همه‌ی API های زیر پیاده‌سازی و build شدن (`npm run dev:backend`، پیش‌فرض پورت ۳۰۰۰):
- **auth**: `POST /api/auth/otp/request`, `POST /api/auth/otp/verify`, `POST /api/auth/register`, `POST /api/auth/login`, `GET|PATCH /api/auth/me`
- **حساب و کتاب پایه**: `GET|POST /api/bank-accounts`, `PATCH|DELETE /api/bank-accounts/[id]`, `GET|POST /api/categories`, `PATCH|DELETE /api/categories/[id]`, `GET|POST /api/transactions`, `PATCH|DELETE /api/transactions/[id]`
- **اقساط**: `GET|POST /api/installments`, `GET|DELETE /api/installments/[id]`, `POST /api/installments/payments/[id]/pay`
- **بدهی/طلب**: `GET|POST /api/person-ledger`, `PATCH|DELETE /api/person-ledger/[id]`, `POST /api/person-ledger/[id]/settle`
- **دارایی/مناسبت/جلسه/یادآوری**: `GET|POST` + `PATCH|DELETE /[id]` برای `assets`, `events`, `appointments`, `reminders`
- **نمودار**: `GET /api/charts/summary` (۶ سرشاخه، ماه جاری)، `GET /api/charts/branch?branch=&parentId=&months=` (مقایسه‌ی زیرشاخه‌های هر عمقی)، `GET /api/charts/category?categoryId=&months=` (روند ماهانه)
- **AI**: `POST /api/ai/transcribe`, `POST /api/ai/speak`, `POST /api/ai/intent` (orchestrator کامل)، `POST /api/ai/consult`
- **متفرقه**: `GET|POST /api/onboarding`, `GET|POST /api/column-labels`, `DELETE /api/column-labels/[id]`, `GET /api/health`

### پنل ادمین (`apps/admin`)
لاگین ایمیل/رمز (`npm run --workspace=apps/admin create-admin -- email pass "نام"` برای ساخت اولین ادمین)، داشبورد آماری، لیست/جزئیات کاربران (حساب بانکی + تراکنش با حذف)، لیست کلی تراکنش‌ها. حذف تراکنش از همون `deleteTransaction` مرکزی در `packages/database` رد می‌شه.

### موبایل (`apps/mobile`)
Expo + expo-router + NativeWind. auth کامل (OTP و ایمیل)، onboarding، صفحه‌ی خانه، و **تمام مسیرهای نمودار شاخه‌ای پرامپت** به‌صورت کاملاً کارکن (نه placeholder): حساب‌وکتاب (خلاصه/بانک/درآمد/هزینه‌های جاری/اقساط/بدهی/طلب/دارایی)، مناسبت‌ها، جلسات، یادآوری‌ها، مشاوره، تنظیمات/پروفایل/پشتیبانی/منو.

صفحه‌ی درآمد و هزینه‌های جاری از دو کامپوننت مشترک بازگشتی استفاده می‌کنن (`CategoryBranchIndex` + `CategoryDetail` در `src/screens/`) که هر عمقی از تودرتویی دسته‌بندی (مثل «مواد غذایی» → «سوپر») رو با همون یک کد پشتیبانی می‌کنن — بدون تغییر کد برای دسته‌ی جدید.

**محدودیت شناخته‌شده:** `POST /api/ai/intent` فعلاً فقط اکشن‌های `add_transaction`, `pay_installment`, `create_installment` رو واقعاً روی دیتابیس اجرا می‌کنه (چون این‌ها Phase 8 بودن). روی صفحه‌های بانک/بدهی/طلب/دارایی/مناسبت/جلسه/یادآوری، آیکون میکروفون هنوز نمایش داده می‌شه (طبق قانون سراسری) و STT/ارسال به AI کار می‌کنه، ولی چون اکشن اختصاصی اون دامنه هنوز به `voiceActionSchema` اضافه نشده، مدل با `ask_clarification` جواب می‌ده به‌جای اینکه مستقیم ثبت کنه؛ ثبت روی اون صفحات فعلاً باید با فرم دستی انجام بشه. فاز بعد: افزودن اکشن‌های `create_bank_account`, `create_person_entry`, `settle_person_entry`, `create_asset`, `create_event`, `create_appointment`, `create_reminder` به schema و orchestrator.

**محدودیت دیگه:** فونت فارسی اختصاصی (Vazirmatn) هنوز اضافه نشده - فعلاً فونت پیش‌فرض سیستم استفاده می‌شه. برای افزودن: فایل `.ttf` رو در `apps/mobile/assets/fonts/` بذارید و با `expo-font` در `app/_layout.tsx` لود کنید.

**RTL:** به‌جای `I18nManager.forceRTL` (که نیاز به reload اپ داره و در این محیط sandbox قابل تست روی دستگاه واقعی نبود)، RTL به‌صورت دستی با کلاس‌های `flex-row-reverse`/`text-right`/`writingDirection:'rtl'` پیاده شده. ارزیابی `forceRTL` واقعی رو باید در فاز QA روی دستگاه انجام داد.

### صحت‌سنجی انجام‌شده
- `packages/database`, `packages/shared`: `tsc --noEmit` تمیز
- `apps/backend`, `apps/admin`: `next build` کامل (تمام روت‌ها compile شدن)
- `apps/mobile`: `tsc --noEmit` تمیز (۰ خطا) + `npx expo export --platform android` با موفقیت یک باندل واقعی Metro/Hermes ساخت (۱۳۸۰ ماژول) — چون این محیط شبیه‌ساز اندروید نداره، این نزدیک‌ترین سطح صحت‌سنجی به «اجرای واقعی اپ» بود. تست دستی روی دستگاه/شبیه‌ساز واقعی هنوز انجام نشده.

### راه‌اندازی محلی
```bash
npm install
cp packages/database/.env.example packages/database/.env   # DATABASE_URL واقعی رو بذارید
npm run db:generate && npm run db:migrate && npm run db:seed
cp apps/backend/.env.example apps/backend/.env && npm run dev:backend
cp apps/admin/.env.example apps/admin/.env && npm run --workspace=apps/admin create-admin -- admin@example.com "پسورد" "ادمین" && npm run dev:admin
cp apps/mobile/.env.example apps/mobile/.env   # EXPO_PUBLIC_API_URL رو به IP بک‌اند تنظیم کنید
npm run dev:mobile
```

### فازهای باقی‌مانده (برای نشست‌های بعدی)
1. اتصال واقعی provider AI (آوالای/متیس) پشت `AI_PROVIDER` env var در `apps/backend/src/lib/ai/`
2. اتصال SMS gateway واقعی (کاوه‌نگار/ملی‌پیامک) در `apps/backend/src/lib/sms/`
3. گسترش `voiceActionSchema`/`intent-orchestrator.ts` برای پوشش کامل بانک/بدهی/طلب/دارایی/مناسبت/جلسه/یادآوری از طریق ویس
4. فونت Vazirmatn، تست QA روی دستگاه واقعی اندروید، ارزیابی `I18nManager.forceRTL`
5. تنظیمات Liara (Dockerfile / `liara.json`) برای دیپلوی `apps/backend` و `apps/admin`
6. EAS build برای خروجی APK (دانلود مستقیم + کافه‌بازار/مایکت)
7. نسخه‌ی iOS (فاز بعد طبق پرامپت اصلی)

## تاریخچه‌ی تغییرات

### ۱۴۰۵/۰۵/۳۰ (۲۰۲۶-۰۸-۲۱) — راه‌اندازی اولیه و نسخه‌ی اول اسکلت کامل
- اسکلت مونوریپو ساخته شد (`apps/mobile`, `apps/backend`, `apps/admin`, `packages/database`, `packages/shared`, `packages/config`).
- تصمیم‌های کلیدی گرفته‌شده با کاربر: احراز هویت هم با OTP موبایل هم ایمیل/رمز؛ لایه‌ی AI به‌صورت adapter انتزاعی (بدون قفل‌شدن به یک provider خاص)؛ بدون دسترسی به ریپوی مرجع «بادرو» — طراحی صرفاً بر اساس مشخصات همین پرامپت.
- `packages/database`: اسکیمای کامل Prisma + seed دسته‌بندی‌های پیش‌فرض درآمد/هزینه.
- `packages/shared`: enum ها، تبدیل تاریخ جلالی خودکفا (بدون وابستگی بیرونی، تست شده در برابر تاریخ‌های شناخته‌شده)، `formatTomanPhrase`، zod schemas.
- `apps/backend`: تمام APIهای بالا + `ledger-service` (بعداً به `packages/database` منتقل شد تا پنل ادمین هم همون منطق رو استفاده کنه).
- `apps/admin`: پنل مدیریت کاربران/تراکنش‌ها.
- `apps/mobile`: اپ کامل با تمام صفحات نمودار شاخه‌ای پرامپت.
- در حین ساخت موبایل، یک تعارض نسخه‌ی جدی بین `react-native`/`metro`/`react-native-reanimated` در گراف وابستگی‌های مونوریپو کشف و با `overrides` در `package.json` ریشه رفع شد (نسخه‌های نامنطبق nested که با `expo export` واقعی کشف شدن، نه فقط با حدس).
