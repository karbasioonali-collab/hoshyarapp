import { NextRequest, NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";
import { DomainError } from "@hoshyar/shared";
import { getUserIdFromRequest } from "./auth";

// همون خطایی که ledger-service (در packages/database) پرتاب می‌کنه - این‌جا فقط
// alias می‌کنیم تا بقیه‌ی روت‌ها بدون تغییر با همون نام ApiError کار کنن
export const ApiError = DomainError;

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireUserId(request: NextRequest): Promise<string> {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    throw new ApiError("لازمه وارد حساب کاربری‌تون بشید", 401);
  }
  return userId;
}

export async function parseBody<T>(request: NextRequest, schema: ZodSchema<T>): Promise<T> {
  const body = await request.json().catch(() => {
    throw new ApiError("بدنه‌ی درخواست معتبر نیست", 400);
  });
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ApiError(formatZodError(result.error), 422);
  }
  return result.data;
}

function formatZodError(error: ZodError): string {
  const first = error.issues[0];
  return first ? `${first.path.join(".")}: ${first.message}` : "ورودی نامعتبر است";
}

type RouteHandler = (request: NextRequest, context: { params: Record<string, string> }) => Promise<NextResponse>;

export function withErrorHandling(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof ApiError) {
        return jsonError(error.message, error.status);
      }
      // eslint-disable-next-line no-console
      console.error(error);
      return jsonError("خطای غیرمنتظره‌ای رخ داد", 500);
    }
  };
}
