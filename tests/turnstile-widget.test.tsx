import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Turnstile } from "../src/app/components/Turnstile";
import { LanguageProvider } from "../src/app/i18n";

afterEach(() => {
  delete window.turnstile;
  vi.unstubAllEnvs();
});
it("clears expired tokens, supports retry and removes the widget on unmount", async () => {
  vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "public-test-key");
  const renderWidget = vi.fn(() => "widget-1");
  const remove = vi.fn();
  window.turnstile = { render: renderWidget, remove };
  const onToken = vi.fn();
  const onRetry = vi.fn();
  const view = render(
    <LanguageProvider>
      <Turnstile onToken={onToken} onRetry={onRetry} />
    </LanguageProvider>,
  );
  await waitFor(() => expect(renderWidget).toHaveBeenCalledOnce());
  const options = (
    renderWidget.mock.calls as unknown as [
      HTMLElement,
      { callback: (token: string) => void; "expired-callback": () => void },
    ][]
  )[0][1];
  act(() => options.callback("valid-token"));
  expect(onToken).toHaveBeenLastCalledWith("valid-token");
  act(() => options["expired-callback"]());
  expect(onToken).toHaveBeenLastCalledWith("");
  expect(screen.getByRole("alert")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button"));
  expect(onRetry).toHaveBeenCalledOnce();
  view.unmount();
  expect(remove).toHaveBeenCalledWith("widget-1");
});
it("shows unavailable when site key is absent", () => {
  vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "");
  render(
    <LanguageProvider>
      <Turnstile onToken={vi.fn()} onRetry={vi.fn()} />
    </LanguageProvider>,
  );
  expect(screen.getByRole("alert")).toBeInTheDocument();
});
