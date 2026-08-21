// خطای دامنه‌ی مشترک بین بک‌اند و پنل ادمین (هردو از طریق ledger-service در
// packages/database با همین خطا مواجه می‌شن و هرکدوم به شکل خودشون نمایشش می‌دن)
export class DomainError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
    this.name = "DomainError";
  }
}
