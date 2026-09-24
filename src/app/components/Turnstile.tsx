"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "../i18n";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      language: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

// Share one script across both forms; failed loads can be retried without
// reloading the page and losing the visitor's input.
let loading: Promise<TurnstileApi> | undefined;
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!loading)
    loading = new Promise<TurnstileApi>((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      const fail = () => {
        clearTimeout(timeout);
        script.onload = null;
        script.onerror = null;
        script.remove();
        loading = undefined;
        reject(new Error("Widget unavailable"));
      };
      const timeout = setTimeout(fail, 15000);
      script.onload = () => {
        clearTimeout(timeout);
        if (window.turnstile) resolve(window.turnstile);
        else fail();
      };
      script.onerror = fail;
      document.head.appendChild(script);
    });
  return loading;
}

export function Turnstile({
  onToken,
  onRetry,
}: {
  onToken: (token: string) => void;
  onRetry: () => void;
}) {
  const {
    lang,
    t: { intake },
  } = useT();
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  useEffect(() => {
    if (!sitekey) return;
    let cancelled = false;
    let widget: { api: TurnstileApi; id: string } | undefined;
    loadTurnstile()
      .then((api) => {
        if (cancelled || !container.current) return;
        const id = api.render(container.current, {
          sitekey,
          action: "form_request",
          language: lang === "en" ? "en" : "auto",
          callback: (token) => {
            if (!cancelled) {
              setFailed(false);
              onToken(token);
            }
          },
          "expired-callback": () => {
            if (!cancelled) {
              onToken("");
              setFailed(true);
            }
          },
          "error-callback": () => {
            if (!cancelled) {
              onToken("");
              setFailed(true);
            }
          },
        });
        widget = { api, id };
      })
      .catch(() => {
        if (!cancelled) {
          onToken("");
          setFailed(true);
        }
      });
    return () => {
      cancelled = true;
      if (widget) widget.api.remove(widget.id);
      onToken("");
    };
  }, [sitekey, lang, onToken]);
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{intake.verification}</p>
      {sitekey ? (
        <>
          <div ref={container} />
          {failed && (
            <p role="alert" className="text-sm text-destructive">
              {intake.captcha}
            </p>
          )}
          <button
            type="button"
            onClick={onRetry}
            className="text-sm underline underline-offset-4"
          >
            {intake.retryVerification}
          </button>
        </>
      ) : (
        <p role="alert" className="text-sm text-destructive">
          {intake.verificationUnavailable}
        </p>
      )}
    </div>
  );
}
