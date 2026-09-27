// Indicative estimates only; these values are not an authoritative quote.
export const HOURLY_RATE = 88000;

export const PROJECT_BASE_HOURS = {
  website: 40,
  mobile: 80,
  erp: 120,
  custom: 60,
} as const;
export type ProjectType = keyof typeof PROJECT_BASE_HOURS;

export const COMPLEXITY_MULTIPLIERS = {
  simple: 1,
  medium: 1.5,
  complex: 2.5,
  enterprise: 4,
} as const;

export const FEATURE_HOURS = {
  responsive: 10,
  cms: 20,
  ecommerce: 30,
  api: 15,
  auth: 20,
  admin: 25,
  multilang: 15,
  analytics: 10,
} as const;

export function calculateEstimate({
  projectType,
  complexity,
  features = [],
}: {
  projectType: ProjectType;
  complexity: keyof typeof COMPLEXITY_MULTIPLIERS;
  features?: readonly (keyof typeof FEATURE_HOURS)[];
}) {
  const baseHours =
    PROJECT_BASE_HOURS[projectType] * COMPLEXITY_MULTIPLIERS[complexity];
  const featureHours = [...new Set(features)].reduce(
    (sum, feature) => sum + FEATURE_HOURS[feature],
    0,
  );
  const hours = Math.round(baseHours + featureHours);
  // Team size and requested delivery dates are preferences, not price factors.
  // Duration assumes 40 person-hours per week, matching the calculator baseline.
  return {
    baseHours,
    hours,
    price: hours * HOURLY_RATE,
    weeks: Math.ceil(hours / 40),
  };
}
