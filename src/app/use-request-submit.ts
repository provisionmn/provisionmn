"use client";
import { useRef, useState } from "react";

export function useRequestSubmit() {
  const busy = useRef(false);
  const retry = useRef<{ payload: string; key: string } | null>(null);
  const [failure, setFailure] = useState<"failed" | "limited" | null>(null);
  const [pending, setPending] = useState(false);
  async function submit(data: object): Promise<string | null> {
    if (busy.current) return null;
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
        body: payload,
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) {
        setFailure(response.status === 429 ? "limited" : "failed");
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
      busy.current = false;
      setPending(false);
    }
  }
  function reset() {
    retry.current = null;
    setFailure(null);
  }
  return { submit, reset, failure, pending };
}
