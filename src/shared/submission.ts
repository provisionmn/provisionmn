import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().default("");
const amount = z.number().finite().min(0).max(1e12).optional();
export const submissionSchema = z
  .object({
    kind: z.enum(["contact", "quote"]),
    name: z.string().trim().min(1).max(120),
    email: z
      .string()
      .trim()
      .email()
      .max(254)
      .transform((value) => value.toLowerCase()),
    phone: optionalText(40),
    company: optionalText(200),
    projectType: optionalText(120),
    description: z.string().trim().min(20).max(5000),
    budget: optionalText(80),
    timeline: optionalText(80),
    teamSize: optionalText(80),
    complexity: optionalText(80),
    features: z.array(z.string().max(80)).max(20).optional().default([]),
    // Client estimates are context only, never an authoritative price.
    estimatedPrice: amount,
    estimatedHours: amount,
    estimatedWeeks: amount,
  })
  .superRefine((data, ctx) => {
    if (data.kind === "quote") {
      if (!["website", "mobile", "erp", "custom"].includes(data.projectType))
        ctx.addIssue({
          code: "custom",
          path: ["projectType"],
          message: "Invalid project type",
        });
      if (!/^\+?[\d\s-]{6,}$/.test(data.phone))
        ctx.addIssue({
          code: "custom",
          path: ["phone"],
          message: "Invalid phone",
        });
    }
  });
export type Submission = z.infer<typeof submissionSchema>;

export type SubmissionField = keyof Submission;
export const submissionFields = ["kind", "name", "email", "phone", "company", "projectType", "description", "budget", "timeline", "teamSize", "complexity", "features", "estimatedPrice", "estimatedHours", "estimatedWeeks"] as const;
export function isSubmissionField(value: unknown): value is SubmissionField {
  return typeof value === "string" && (submissionFields as readonly string[]).includes(value);
}
