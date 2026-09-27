"use client";
import { useT } from "../i18n";
import type { useRequestSubmit } from "../use-request-submit";

export function RequestFailure({ request }: { request: Pick<ReturnType<typeof useRequestSubmit>, "failure" | "invalidFields"> }) {
  const { t } = useT();
  if (!request.failure) return null;
  return (
    <div role="alert" className="text-sm text-destructive">
      <p>{t.intake[request.failure]}</p>
      {request.failure === "invalid" && request.invalidFields.length > 0 && (
        <ul className="mt-2 list-disc pl-5">
          {request.invalidFields.map((field) => <li key={field}>{t.intake.validation[field]}</li>)}
        </ul>
      )}
    </div>
  );
}
