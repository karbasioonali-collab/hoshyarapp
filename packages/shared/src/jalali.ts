// تبدیل تاریخ میلادی <-> شمسی (الگوریتم استاندارد و متن‌باز جلالی/borkowski)،
// بدون هیچ وابستگی بیرونی تا هم در بک‌اند (Node) و هم در اپ موبایل (Metro/RN) کار کنه.

const BREAKS = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394,
  2456, 3178,
];

function div(a: number, b: number) {
  return Math.trunc(a / b);
}

function mod(a: number, b: number) {
  return a - Math.trunc(a / b) * b;
}

function jalCal(jy: number) {
  const breaksLength = BREAKS.length;
  const gy = jy + 621;
  let leapJ = -14;
  let jp = BREAKS[0];
  if (jy < jp || jy >= BREAKS[breaksLength - 1]) {
    throw new Error(`سال شمسی نامعتبر: ${jy}`);
  }
  let jump = 0;
  let i = 1;
  for (; i < breaksLength; i += 1) {
    const jm = BREAKS[i];
    jump = jm - jp;
    if (jy < jm) break;
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }
  let n = jy - jp;
  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) {
    leapJ += 1;
  }
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;
  if (jump - n < 6) {
    n = n - jump + div(jump, 33) * 33;
  }
  let leap = mod(mod(n + 1, 33) - 1, 4);
  if (leap === -1) leap = 4;
  return { leap, gy, march };
}

function g2d(gy: number, gm: number, gd: number) {
  let d =
    div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
    div(153 * mod(gm + 9, 12) + 2, 5) +
    gd -
    34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

function d2g(jdn: number) {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
}

function j2d(jy: number, jm: number, jd: number) {
  const r = jalCal(jy);
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

function d2j(jdn: number) {
  const gy = d2g(jdn).gy;
  let jy = gy - 621;
  const r = jalCal(jy);
  const jdn1f = g2d(gy, 3, r.march);
  let k = jdn - jdn1f;
  let jm: number;
  let jd: number;
  if (k >= 0) {
    if (k <= 185) {
      jm = 1 + div(k, 31);
      jd = mod(k, 31) + 1;
      return { jy, jm, jd };
    }
    k -= 186;
  } else {
    jy -= 1;
    k += 179;
    if (r.leap === 1) k += 1;
  }
  jm = 7 + div(k, 30);
  jd = mod(k, 30) + 1;
  return { jy, jm, jd };
}

export type JalaliDate = { jy: number; jm: number; jd: number };

/** تاریخ میلادی (JS Date، بر اساس مقادیر محلی) رو به شمسی تبدیل می‌کنه */
export function toJalali(date: Date): JalaliDate {
  const jdn = g2d(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return d2j(jdn);
}

/** تاریخ شمسی رو به یک JS Date (نیمه‌شب محلی) تبدیل می‌کنه */
export function toGregorian(jy: number, jm: number, jd: number): Date {
  const jdn = j2d(jy, jm, jd);
  const { gy, gm, gd } = d2g(jdn);
  return new Date(gy, gm - 1, gd);
}

export function isLeapJalaaliYear(jy: number): boolean {
  return jalCal(jy).leap === 0;
}

export function jalaaliMonthLength(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isLeapJalaaliYear(jy) ? 30 : 29;
}

export const JALALI_MONTH_NAMES = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;

export function formatJalali(jy: number, jm: number, jd: number): string {
  return `${jd} ${JALALI_MONTH_NAMES[jm - 1]} ${jy}`;
}

/** "1405-05-30" -> {jy,jm,jd} */
export function parseJalaliDateString(value: string): JalaliDate {
  const [jy, jm, jd] = value.split("-").map((part) => parseInt(part, 10));
  if (!jy || !jm || !jd) {
    throw new Error(`تاریخ شمسی نامعتبر: ${value}`);
  }
  return { jy, jm, jd };
}

export function todayJalali(): JalaliDate {
  return toJalali(new Date());
}

/** ماه‌ها رو به یک تاریخ شمسی اضافه می‌کنه (برای زمان‌بندی اقساط)، با wrap سال و clamp روز */
export function addJalaliMonths(jy: number, jm: number, jd: number, monthsToAdd: number): JalaliDate {
  const totalMonths = jy * 12 + (jm - 1) + monthsToAdd;
  const newJy = Math.floor(totalMonths / 12);
  const newJm = (totalMonths % 12) + 1;
  const maxDay = jalaaliMonthLength(newJy, newJm);
  return { jy: newJy, jm: newJm, jd: Math.min(jd, maxDay) };
}
