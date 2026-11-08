# مستندسازی پروژه‌ی هوشیار (HOSHYAR)

این فایل مرجع زنده‌ی پروژه‌ست: معماری، تصمیم‌های کلیدی، تجربه‌ها، مشکل‌ها و راه‌حل‌ها، و تاریخچه‌ی تغییرات مهم اینجا ثبت می‌شه. هر تغییر معماری/تصمیم مهم جدید باید به بخش «تاریخچه‌ی تغییرات» اضافه بشه.

**سه فایل مرتبط دیگه هم در ریپو هست:**
- [`CLAUDE.md`](./CLAUDE.md) و [`AGENTS.md`](./AGENTS.md) — راهنمای قوانین/باید-نبایدها برای هر هوش مصنوعی‌ای که به این ریپو وصل می‌شه (محتواشون تقریباً یکسانه، برای دو ابزار مختلف).
- [`docs/HANDOFF.md`](./docs/HANDOFF.md) — سند خلاصه‌ی ثابت پروژه که صاحب پروژه نوشته؛ تغییرش ندید مگر خودش بخواد.

اگه بین این فایل‌ها تناقض دیدید، همین فایل (`infohoshyar.md`) معتبرتره چون زنده و همیشه به‌روزه.

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
├── docs/
│   └── HANDOFF.md  # سند خلاصه‌ی ثابت پروژه (ثابت، تغییرش ندید)
├── CLAUDE.md       # قوانین/باید-نبایدها برای Claude Code
├── AGENTS.md       # همون قوانین، برای سایر عامل‌های هوش مصنوعی
└── infohoshyar.md  # همین فایل (مرجع زنده)
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

## تجربه‌ها، مشکل‌ها و راه‌حل‌ها

این بخش مخصوص چیزهاییه که در عمل جلومون رو گرفت و یاد گرفتیم — تا تکرار نشن.

### ۱) سندباکس اجرای ابری Claude Code نمی‌تونه `expo start` رو واقعاً اجرا کنه
**مشکل:** محیط اجرای ابری که فاز اول توش ساخته شد، به `exp.host` و `api.expo.dev` دسترسی شبکه نداره (خروجی `curl`/پراکسی صریحاً `403 connect_rejected` می‌داد). `npx expo start` همون اول کار، موقع چک نسخه‌ی پکیج‌ها با سرورهای Expo، کرش می‌کنه.
**راه‌حل/نتیجه:** صحت‌سنجی در آن محیط فقط با `tsc --noEmit` (صفر خطا) و `npx expo export --platform android` (باندل واقعی Metro/Hermes، بدون نیاز به سرورهای Expo) ممکن بود. دیدن QR کد و تست زنده با Expo Go **باید روی دستگاه خود کاربر** انجام بشه؛ هیچ ترفندی (تونل، و غیره) داخل آن سندباکس جواب نمی‌ده چون کلاً اون هاست‌ها مسدودن.

### ۲) تعارض نسخه‌ی react-native/metro/reanimated در گراف وابستگی‌های مونوریپو
**مشکل:** موقع `npm install` اولیه، چند پکیج (`nativewind`→`react-native-css-interop`→`react-native-reanimated`) بدون پین دقیق نصب شدن و npm به‌جای استفاده از نسخه‌ی هماهنگ با Expo SDK 51 (`react-native@0.74.5`)، یک نسخه‌ی خیلی جدیدتر (`0.87.0`) رو تو node_modules تو در تو (nested) نصب کرد. همین باعث شد هم خطای TypeScript بگیریم (`className` روی کامپوننت‌های RN شناخته نمی‌شد چون augmentation به نسخه‌ی اشتباه react-native می‌خورد) هم موقع `expo export` به یک مسیر داخلی metro که در نسخه‌ی جدیدتر وجود نداشت (`metro/src/lib/TerminalReporter`) ارور بدیم.
**راه‌حل:** در `package.json` ریشه یک بلاک `overrides` اضافه شد که نسخه‌ها رو برای کل مونوریپو قفل می‌کنه:
```json
"overrides": {
  "react-native": "0.74.5",
  "react": "18.2.0",
  "react-native-reanimated": "~3.10.1"
}
```
و `nativewind` هم به نسخه‌ی دقیق `4.0.36` (بدون `^`) پین شد تا نسخه‌های جدیدتری که خودشون `reanimated` v4 (ناسازگار با RN 0.74) می‌خوان نصب نشن. بعد از این تغییر، یک پاک‌سازی کامل (`rm -rf node_modules apps/*/node_modules packages/*/node_modules package-lock.json && npm install`) لازم بود — فقط عوض‌کردن override کافی نیست، باید lockfile/node_modules از صفر دوباره حل بشن.
**درس کلی:** در این مونوریپو، هر بار که یک پکیج Expo-محور جدید اضافه می‌شه یا نسخه‌اش بالا می‌ره، اول با `npm ls react-native metro react-native-reanimated` چک کنید که نسخه‌های nested دوباره از هم جدا نشده باشن.

### ۳) روی Termux (گوشی اندروید)، `lightningcss` اجرا نمی‌شه
**مشکل:** صاحب پروژه روی گوشی خودش با Termux امتحان کرد: `npm install` کامل و بدون خطا تموم شد، ولی `npx expo start` با خطای مربوط به پکیج `lightningcss` (که NativeWind برای پردازش Tailwind/CSS در زمان build لازم داره) fail شد. `lightningcss` یک پکیج Rust-based با باینری native pre-compiled‌ـه که برای معماری/libc محیط Termux (که با گلیبک استاندارد لینوکس فرق می‌کنه) باینری منتشرشده نداره. نصب toolchain راست (rust) و تلاش برای rebuild از سورس هم جواب نداد.
**نتیجه‌گیری:** این مشکل محیطه، نه باگ کد پروژه. Termux برای اجرای این اپ (به‌خاطر وابستگی NativeWind به lightningcss) محیط رسمی پشتیبانی‌شده‌ای نیست.
**راه‌حل فعلی (دور زدن مشکل):** پروژه رو روی یک کامپیوتر واقعی (ویندوز ۱۰/۱۱، مک، یا لینوکس) اجرا کنید؛ آنجا `lightningcss` باینری سازگار داره و مشکلی نیست. مراحل: `git clone` → `git checkout claude/hoshyar-project-setup-ht4vrx` → `npm install` → `cd apps/mobile` → کپی `.env.example` به `.env` → `npx expo start` → اسکن QR با اپ Expo Go روی گوشی.
**راه‌حل‌های احتمالی آینده (هنوز پیاده نشدن، اگه کسی وقت گذاشت):**
- جایگزینی NativeWind با یک روش استایل‌دهی که به lightningcss نیاز نداره (مثلاً برگشت به `StyleSheet` خام RN + یک سیستم theme دستی)، که دیگه این مشکل رو کلاً حذف می‌کنه ولی کار پیاده‌سازی مجدد همه‌ی صفحات رو می‌طلبه.
- چک کردن اینکه آیا نسخه‌ی جدیدتر `lightningcss` یا یک فلگ build (`--target`) باینری سازگار با Termux/Android-on-device منتشر کرده.
- اجرای بک‌اند/دیتابیس هم داخل Termux (با `pkg install postgresql`) در کنار این — ولی چون مشکل اصلی لایه‌ی build خود موبایله، این به‌تنهایی مشکل را حل نمی‌کند.

### ۴) برای تست کامل، فقط اجرای `apps/mobile` کافی نیست
یادآوری مهم: حتی وقتی `expo start` روی کامپیوتر واقعی بالا بیاد، صفحات داده‌محور (ورود، تراکنش‌ها، نمودارها، ...) به `apps/backend` در حال اجرا و یک PostgreSQL واقعی نیاز دارن (`EXPO_PUBLIC_API_URL` در `.env` موبایل باید به آدرس بک‌اند اشاره کنه). بدون این دو، فقط UI/ناوبری/RTL قابل‌مشاهده‌ست، نه عملکرد واقعی.

### ۵) وضعیت دسترسی ریپو
طبق گزارش صاحب پروژه، ریپوی `hoshyarapp` یه مدت موقتاً Public بوده (باید دوباره به Private برگرده). این یعنی تا وقتی برنمی‌گرده، هرگز هیچ `.env` واقعی، کلید API، یا رمز رو کامیت نکنید — فقط `.env.example` با مقدار جای‌گزین. اگه در جایی از کد یا تاریخچه‌ی کامیت‌ها یک secret واقعی پیدا کردید، فوراً به کاربر خبر بدید تا rotate/حذفش کنه.

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

### ۱۴۰۵/۰۸/۱۷ (۲۰۲۶-۱۱-۰۸) — مستندسازی برای انتقال دانش بین نشست‌ها
- کاربر پروژه رو روی گوشی خودش (Termux) امتحان کرد و مشکل جدیدی پیدا شد: `lightningcss` (وابستگی build-time NativeWind) روی Termux باینری سازگار نداره، پس `npx expo start` اونجا fail می‌شه (جزئیات کامل در بخش «تجربه‌ها، مشکل‌ها و راه‌حل‌ها» بالا). این مشکل محیطه، نه کد؛ راه‌حل فعلی اجرا روی کامپیوتر واقعیه.
- این نشست **فقط مستندسازی** بود، هیچ تغییری در کد پروژه داده نشد:
  - `CLAUDE.md` و `AGENTS.md` ساخته شدن: قوانین/اصول/باید-نبایدهای پروژه برای هر عامل هوش مصنوعی‌ای که بعداً به این ریپو وصل می‌شه.
  - `infohoshyar.md` (همین فایل) با بخش جدید «تجربه‌ها، مشکل‌ها و راه‌حل‌ها» تکمیل شد.
  - `docs/HANDOFF.md` ساخته شد: نسخه‌ی ثابت سند خلاصه‌ی پروژه که خود کاربر نوشته بود، دقیقاً بدون تغییر ذخیره شد.
- یادآوری برای نشست بعد: طبق `docs/HANDOFF.md`، قدم بعدی پیشنهادی کاربر این بود که اول اپ رو روی کامپیوتر واقعی ببینه و ایرادها رو یکجا جمع کنه، بعد برگردیم و فیچرها (پنجره‌ی چت مشاوره، فیدبک ویس، دکمه‌ی پخش صدا، گسترش ویس به بقیه‌ی صفحات، فونت، اتصال AI/SMS واقعی) رو تکمیل کنیم.

