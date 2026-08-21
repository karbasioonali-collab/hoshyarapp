"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction } from "@/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary" type="submit" disabled={pending} style={{ width: "100%" }}>
      {pending ? "در حال ورود..." : "ورود"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(loginAction, undefined);

  return (
    <div className="login-page">
      <form className="login-card" action={formAction}>
        <h1 style={{ fontSize: 20, marginBottom: 16 }}>ورود به پنل ادمین هوشیار</h1>
        {state?.error && <p className="error-text">{state.error}</p>}
        <input type="email" name="email" placeholder="ایمیل" required />
        <input type="password" name="password" placeholder="رمز عبور" required />
        <SubmitButton />
      </form>
    </div>
  );
}
