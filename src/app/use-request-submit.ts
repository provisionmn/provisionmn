"use client";
import { useRef, useState } from "react";

export function useRequestSubmit() {
  const busy = useRef(false);
  const retry = useRef<{ payload: string; key: string } | null>(null);
  const [failure, setFailure] = useState<
    "failed" | "limited" | "captcha" | null
  >(null);
  const [captchaToken, setCaptchaToken] = useState("");
  const [challengeKey, setChallengeKey] = useState(0);
  function resetCaptcha() {
    setCaptchaToken("");
    setChallengeKey((value) => value + 1);
  }
  const [pending, setPending] = useState(false);
  async function submit(data: object): Promise<string | null> {
    if (busy.current) return null;
    if (!captchaToken) {
      setFailure("captcha");
      return null;
    }
    busy.current = true;
    setPending(true);
    setFailure(null);
    try {
      const payload = JSON.stringify(data);
      if (retry.current?.payload !== payload)
        retry.current = { payload, key: crypto.randomUUID() };
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": retry.current!.key,
        },
        body: JSON.stringify({ ...data, captchaToken }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) {
        setFailure(
          response.status === 429
            ? "limited"
            : response.status === 403
              ? "captcha"
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
  }
  return {
    submit,
    reset,
    failure,
    pending,
    challengeKey,
    setCaptchaToken,
    resetCaptcha,
  };
}
