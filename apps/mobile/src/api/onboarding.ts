import { api } from "./client";

export interface OnboardingAnswer {
  monthlyIncome: string | null;
  housingCost: string | null;
  carCost: string | null;
  otherFixedCosts: { description: string; amount: number }[];
}

export function fetchOnboarding() {
  return api.get<{ answer: OnboardingAnswer | null }>("/api/onboarding");
}

export function submitOnboarding(input: {
  monthlyIncome?: number;
  housingCost?: number;
  carCost?: number;
  otherFixedCosts?: { description: string; amount: number }[];
}) {
  return api.post<{ answer: OnboardingAnswer }>("/api/onboarding", input);
}
