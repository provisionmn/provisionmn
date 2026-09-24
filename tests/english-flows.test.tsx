const originalFetch = globalThis.fetch;
import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { LanguageProvider, useT } from "../src/app/i18n";
import { QuoteProvider, useQuote } from "../src/app/quote-context";
import { ServicesDetail } from "../src/app/components/ServicesDetail";
import { PriceCalculator } from "../src/app/components/PriceCalculator";
import { QuoteRequest } from "../src/app/components/QuoteRequest";
import { Chatbot } from "../src/app/components/Chatbot";

const navigation = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => navigation }));

function SwitchLanguage() {
  const { toggleLang } = useT();
  return <button onClick={toggleLang}>Switch language</button>;
}
function Snapshot() {
  const { quote } = useQuote();
  return <output data-testid="quote">{JSON.stringify(quote)}</output>;
}
function Flow({ chat = false }: { chat?: boolean }) {
  const [page, setPage] = useState("start");
  navigation.push.mockImplementation(setPage);
  return page === "/quote" ? (
    <QuoteRequest />
  ) : chat ? (
    <Chatbot />
  ) : (
    <PriceCalculator />
  );
}
function mount(children: React.ReactNode) {
  return render(
    <LanguageProvider>
      <QuoteProvider>
        <SwitchLanguage />
        {children}
        <Snapshot />
      </QuoteProvider>
    </LanguageProvider>,
  );
}
beforeEach(() => {
  localStorage.clear();
  navigation.push.mockReset();
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ id: "a13bd758-91c2-4db6-adc5-0e6de1575745" }),
      }),
  );
});
afterEach(() => {
  globalThis.fetch = originalFetch;
});

it("translates the full service page and switches back to Mongolian", async () => {
  const { container } = mount(<ServicesDetail />);
  expect(
    screen.getByRole("heading", { name: "Санаанаас production хүртэл" }),
  ).toBeInTheDocument();
  await userEvent.click(screen.getByText("Switch language"));
  expect(
    screen.getByRole("heading", { name: "From idea to production" }),
  ).toBeInTheDocument();
  expect(container.textContent).not.toMatch(/[а-яөүё]/i);
  await userEvent.click(screen.getByText("Switch language"));
  expect(
    screen.getByRole("heading", { name: "Санаанаас production хүртэл" }),
  ).toBeInTheDocument();
});

it("preserves calculator selections and quote prefill across language changes", async () => {
  mount(<Flow />);
  const user = userEvent.setup();
  await user.click(screen.getByRole("radio", { name: /^Вэб сайт/ }));
  await user.click(screen.getByRole("radio", { name: /^Энгийн/ }));
  await user.click(screen.getByText("Switch language"));
  expect(screen.getByRole("radio", { name: /^Website/ })).toBeChecked();
  expect(screen.getByRole("radio", { name: /^Simple/ })).toBeChecked();
  await user.click(screen.getByRole("checkbox", { name: /API integration/ }));
  await user.type(
    screen.getByRole("textbox"),
    "A customer order management website",
  );
  await user.click(screen.getByRole("button", { name: "Request a quote" }));
  expect(
    screen.getByRole("combobox", { name: /Project type/ }),
  ).toHaveTextContent("Website development");
  expect(JSON.parse(screen.getByTestId("quote").textContent!)).toMatchObject({
    projectType: "website",
    complexity: "simple",
    features: ["api"],
    estimatedPrice: 4840000,
  });
  await user.click(screen.getByText("Switch language"));
  expect(
    screen.getByRole("combobox", { name: /Төслийн төрөл/ }),
  ).toHaveTextContent("Вэб сайт хөгжүүлэлт");
  expect(screen.getByLabelText(/Төслийн дэлгэрэнгүй тайлбар/)).toHaveValue(
    "A customer order management website",
  );
});

it("relocalizes existing validation and completes the quote UI in English", async () => {
  mount(<Flow />);
  const user = userEvent.setup();
  await user.click(screen.getByRole("radio", { name: /^Вэб сайт/ }));
  await user.click(screen.getByRole("radio", { name: /^Энгийн/ }));
  await user.type(
    screen.getByRole("textbox"),
    "A customer order management website",
  );
  await user.click(screen.getByRole("button", { name: "Үнийн санал авах" }));
  await user.click(screen.getByRole("button", { name: "Хүсэлт илгээх" }));
  expect(screen.getByText("Нэрээ бичнэ үү.")).toBeInTheDocument();
  await user.click(screen.getByText("Switch language"));
  expect(screen.getByText("Please enter your name.")).toBeInTheDocument();
  expect(screen.queryByText("Нэрээ бичнэ үү.")).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText(/Full name/), {
    target: { value: "Alex Smith" },
  });
  fireEvent.change(screen.getByLabelText(/Email address/), {
    target: { value: "test@example.com" },
  });
  fireEvent.change(screen.getByLabelText(/Phone number/), {
    target: { value: "+976 99112233" },
  });
  const numbers = screen
    .getByText(/^\d+ \+ \d+ = \?$/)
    .textContent!.match(/\d+/g)!
    .map(Number);
  fireEvent.change(screen.getByLabelText(/Human verification/), {
    target: { value: String(numbers[0] + numbers[1]) },
  });
  vi.mocked(fetch).mockResolvedValueOnce({
    ok: false,
    status: 503,
  } as Response);
  await user.click(screen.getByRole("button", { name: "Send request" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "We could not confirm",
  );
  expect(screen.getByLabelText(/Full name/)).toHaveValue("Alex Smith");
  await user.click(screen.getByRole("button", { name: "Send request" }));
  expect(vi.mocked(fetch).mock.calls[0][1]?.headers).toEqual(
    vi.mocked(fetch).mock.calls[1][1]?.headers,
  );
  expect(
    await screen.findByRole(
      "heading",
      { name: "Request received" },
      { timeout: 2500 },
    ),
  ).toBeInTheDocument();
});

it("switches chatbot language mid-conversation without changing the estimate or user text", async () => {
  mount(<Flow chat />);
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Туслахтай ярих" }));
  await user.click(screen.getByRole("button", { name: "Вэб сайт" }));
  await user.click(screen.getByText("Switch language"));
  await user.click(
    await screen.findByRole("button", { name: "Custom features" }),
  );
  await user.click(
    await screen.findByRole("button", { name: "1 person (freelancer)" }),
  );
  await waitFor(
    () => expect(screen.getByText(/• Price — ₮800,000/)).toBeInTheDocument(),
    { timeout: 2000 },
  );
  await user.click(screen.getByText("Switch language"));
  expect(screen.getByText(/• Үнэ — ₮800,000/)).toBeInTheDocument();
  await user.click(
    screen.getByRole("button", { name: "Дэлгэрэнгүй үнийн санал авах" }),
  );
  expect(JSON.parse(screen.getByTestId("quote").textContent!)).toMatchObject({
    projectType: "website",
    teamSize: "1",
    description: "Custom features",
    estimatedPrice: 800000,
  });
  expect(
    screen.getByRole("combobox", { name: /Төслийн төрөл/ }),
  ).toHaveTextContent("Вэб сайт хөгжүүлэлт");
});
