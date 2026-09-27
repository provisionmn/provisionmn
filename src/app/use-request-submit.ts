"use client";
import { useRef, useState } from "react";
import { submissionSchema, isSubmissionField, type SubmissionField } from "../shared/submission";

export function useRequestSubmit() {
  const busy = useRef(false);
  const retry = useRef<{ payload: string; key: string } | null>(null);
  const [failure, setFailure] = useState<
    "failed" | "limited" | "captcha" | "invalid" | "tooLarge" | null
  >(null);
  const [invalidFields, setInvalidFields] = useState<SubmissionField[]>([]);
  const [captchaToken, setCaptchaToken] = useState("");
  const [challengeKey, setChallengeKey] = useState(0);
  function resetCaptcha() {
    setCaptchaToken("");
    setChallengeKey((value) => value + 1);
  }
  const [pending, setPending] = useState(false);
  async function submit(data: object): Promise<string | null> {
    if (busy.current) return null;
    const parsed = submissionSchema.safeParse(data);
    if (!parsed.success) {
      setInvalidFields([...new Set(parsed.error.issues.map((issue) => issue.path[0]).filter(isSubmissionField))]);
      setFailure("invalid");
      return null;
    }
    setInvalidFields([]);
    if (!captchaToken) {
      setFailure("captcha");
      return null;
    }
    busy.current = true;
    setPending(true);
    setFailure(null);
    try {
      const payload = JSON.stringify(parsed.data);
      if (retry.current?.payload !== payload)
        retry.current = { payload, key: crypto.randomUUID() };
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": retry.current!.key,
        },
        body: JSON.stringify({ ...parsed.data, captchaToken }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) {
        if (response.status === 400) {
          const error = await response.json();
          setInvalidFields(Array.isArray(error.fields) ? error.fields.filter(isSubmissionField) : []);
        }
        setFailure(
          response.status === 429
            ? "limited"
            : response.status === 403
              ? "captcha"
              : response.status === 400
                ? "invalid"
                : response.status === 413
                  ? "tooLarge"
                  : "failed",
        );
        return null;
      }
      const body = await response.json();
      if (typeof body.id !== "string" || !/^[0-9a-f-]{36}$/i.test(body.id))
        throw new Error("Invalid response");
      return body.id;
    } catch {
      setFailure("failed");
      return null;
    } finally {
      resetCaptcha();
      busy.current = false;
      setPending(false);
    }
  }
  function reset() {
    retry.current = null;
    setFailure(null);
    setInvalidFields([]);
  }
  return {
    submit,
    reset,
    failure,
    invalidFields,
    pending,
    challengeKey,
    setCaptchaToken,
    resetCaptcha,
  };
}
