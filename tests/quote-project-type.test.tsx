import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { LanguageProvider, useT } from "../src/app/i18n";
import { QuoteProvider, useQuote, type QuoteData } from "../src/app/quote-context";
import { PriceCalculator } from "../src/app/components/PriceCalculator";
import { Chatbot } from "../src/app/components/Chatbot";
import { QuoteRequest } from "../src/app/components/QuoteRequest";

const navigation = vi.hoisted(() => ({ push: vi.fn() }));
const originalFetch = globalThis.fetch;
vi.mock("next/navigation", () => ({ useRouter: () => navigation }));
vi.mock("../src/app/components/Turnstile", async () => {
  const { useEffect } = await import("react");
  return {
    Turnstile: function MockTurnstile({ onToken }: { onToken: (token: string) => void }) {
      useEffect(() => onToken("test-token"), [onToken]);
      return null;
    },
  };
});

function Flow({ source }: { source: "calculator" | "chatbot" }) {
  const [page, setPage] = useState("start");
  const { toggleLang } = useT();
  const { quote } = useQuote();
  navigation.push.mockImplementation(setPage);
  return (
    <>
      <button onClick={toggleLang}>Switch language</button>
      {page === "/quote" ? <QuoteRequest /> : source === "calculator" ? <PriceCalculator /> : <Chatbot />}
      <output data-testid="quote">{JSON.stringify(quote)}</output>
    </>
  );
}

beforeEach(() => {
  localStorage.clear();
  navigation.push.mockReset();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ id: "a13bd758-91c2-4db6-adc5-0e6de1575745" }),
  }));
});
afterEach(() => {
  globalThis.fetch = originalFetch;
});

const description = "A customer order management website";

async function arriveFrom(source: "calculator" | "chatbot") {
  render(<LanguageProvider><QuoteProvider><Flow source={source} /></QuoteProvider></LanguageProvider>);
  const user = userEvent.setup();
  await user.click(screen.getByText("Switch language"));
  if (source === "calculator") {
    await user.click(screen.getByRole("radio", { name: /^Website/ }));
    await user.click(screen.getByRole("radio", { name: /^Simple/ }));
    await user.click(screen.getByRole("checkbox", { name: /API integration/ }));
    await user.type(screen.getByRole("textbox"), description);
    await user.click(screen.getByRole("button", { name: "Request a quote" }));
  } else {
    await user.click(screen.getByRole("button", { name: "Chat with the assistant" }));
    await user.click(screen.getByRole("button", { name: "Website" }));
    await user.click(await screen.findByRole("button", { name: "Custom features" }));
    await user.click(await screen.findByRole("button", { name: "1 person (freelancer)" }));
    await user.click(await screen.findByRole("button", { name: "Request a detailed quote" }));
  }
  const quote: QuoteData = JSON.parse(screen.getByTestId("quote").textContent!);
  expect(quote.estimatedPrice).toBeGreaterThan(0);
  expect(screen.getByText(`₮${quote.estimatedPrice!.toLocaleString("en-US")}`)).toBeInTheDocument();
  for (const [label, value] of [
    [/Full name/, "Alex Smith"],
    [/Email address/, "alex@example.com"],
    [/Phone number/, "+976 99112233"],
    [/Company name/, "Example company"],
    [/Detailed project description/, description],
  ] as const) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
  return { user, quote };
}

async function selectProject(user: ReturnType<typeof userEvent.setup>, label: string) {
  screen.getByRole("combobox", { name: /Project type/ }).focus();
  await user.keyboard("[Space]");
  await user.click(await screen.findByRole("option", { name: label }));
}

async function submitQuote(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Send request" }));
  expect(await screen.findByRole("heading", { name: "Request received" })).toBeInTheDocument();
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(vi.mocked(fetch).mock.calls[0][0]).toBe("/api/requests");
  return JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
}

it.each(["calculator", "chatbot"] as const)(
  "%s → quote keeps a valid estimate when the same project type is selected",
  async (source) => {
    const { user, quote } = await arriveFrom(source);
    await selectProject(user, "Website development");
    expect(screen.getByText(`₮${quote.estimatedPrice!.toLocaleString("en-US")}`)).toBeInTheDocument();
    const payload = await submitQuote(user);
    expect(payload).toMatchObject({ projectType: "website", estimatedPrice: quote.estimatedPrice });
    for (const field of ["estimatedHours", "estimatedWeeks", "complexity", "features"] as const) {
      if (quote[field] !== undefined) expect(payload[field]).toEqual(quote[field]);
    }
  },
);

it.each([
  ["calculator", false], ["chatbot", false],
  ["calculator", true], ["chatbot", true],
] as const)(
  "%s → quote invalidates a changed project's estimate (switch back: %s)",
  async (source, switchBack) => {
    const { user, quote } = await arriveFrom(source);
    await selectProject(user, "Mobile app development");
    if (switchBack) await selectProject(user, "Website development");
    expect(screen.queryByText(`₮${quote.estimatedPrice!.toLocaleString("en-US")}`)).not.toBeInTheDocument();
    expect(screen.queryByText("Edit estimate")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Full name/)).toHaveValue("Alex Smith");
    expect(screen.getByLabelText(/Email address/)).toHaveValue("alex@example.com");
    expect(screen.getByLabelText(/Phone number/)).toHaveValue("+976 99112233");
    expect(screen.getByLabelText(/Company name/)).toHaveValue("Example company");
    expect(screen.getByLabelText(/Detailed project description/)).toHaveValue(description);
    const payload = await submitQuote(user);
    expect(payload).toMatchObject({
      kind: "quote", projectType: switchBack ? "website" : "mobile",
      name: "Alex Smith", email: "alex@example.com", phone: "+976 99112233",
      company: "Example company", description, complexity: "", features: [],
    });
    for (const field of ["estimatedPrice", "estimatedHours", "estimatedWeeks"]) {
      expect(payload).not.toHaveProperty(field);
    }
  },
);
