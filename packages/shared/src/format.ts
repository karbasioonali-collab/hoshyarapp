const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
}

const MAGNITUDES = [
  { value: 1_000_000_000, label: "میلیارد" },
  { value: 1_000_000, label: "میلیون" },
  { value: 1_000, label: "هزار" },
];

/** عدد رو به عبارت فارسی خوانا تبدیل می‌کنه، مثل «۲۰۰ هزار تومان» یا «۱ میلیون و ۵۰۰ هزار تومان» */
export function formatTomanPhrase(amount: number): string {
  const rounded = Math.round(Math.abs(amount));
  const sign = amount < 0 ? "منفی " : "";
  if (rounded < 1000) {
    return `${sign}${toPersianDigits(rounded)} تومان`;
  }
  let remainder = rounded;
  const parts: string[] = [];
  for (const { value, label } of MAGNITUDES) {
    const count = Math.floor(remainder / value);
    if (count > 0) {
      parts.push(`${toPersianDigits(count)} ${label}`);
      remainder -= count * value;
    }
  }
  return `${sign}${parts.join(" و ")} تومان`;
}

/** برای نمایش در جدول‌ها: ۲۰۰,۰۰۰ */
export function formatAmountWithSeparators(amount: number): string {
  return toPersianDigits(Math.round(amount).toLocaleString("en-US"));
}
