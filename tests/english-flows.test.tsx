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
    vi.fn().mockResolvedValue({
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
    screen.getByRole("heading", { name: "Санаанаас хэрэглээнд нэвтрүүлэх хүртэл" }),
  ).toBeInTheDocument();
  await userEvent.click(screen.getByText("Switch language"));
  expect(
    screen.getByRole("heading", { name: "From idea to production" }),
  ).toBeInTheDocument();
  expect(container.textContent).not.toMatch(/[а-яөүё]/i);
  await userEvent.click(screen.getByText("Switch language"));
  expect(
    screen.getByRole("heading", { name: "Санаанаас хэрэглээнд нэвтрүүлэх хүртэл" }),
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

it.each([
  ["Website", "Website", "1 person (freelancer)", 3520000, 40, 1],
  ["Mobile app", "Mobile app", "2-3 people (small team)", 7040000, 80, 2],
  ["Odoo ERP", "Odoo ERP", "4-6 people (medium team)", 10560000, 120, 3],
  ["Custom solution", "Other", "6+ people (large team)", 5280000, 60, 2],
])(
  "keeps %s baseline pricing consistent between calculator and chat",
  async (calculatorType, chatType, team, price, hours, weeks) => {
    const user = userEvent.setup();
    const calculator = mount(<Flow />);
    await user.click(screen.getByText("Switch language"));
    await user.click(
      screen.getByRole("radio", { name: new RegExp(`^${calculatorType}`) }),
    );
    await user.click(screen.getByRole("radio", { name: /^Simple/ }));
    const formattedPrice = `₮${price.toLocaleString("en-US")}`;
    expect(screen.getAllByText(formattedPrice).length).toBeGreaterThan(0);
    expect(screen.getByText(String(hours))).toBeInTheDocument();
    expect(screen.getByText(`~${weeks} weeks`)).toBeInTheDocument();
    const description = "A customer order management project";
    await user.type(screen.getByRole("textbox"), description);
    await user.click(screen.getByRole("button", { name: "Request a quote" }));
    const calculatorQuote = JSON.parse(screen.getByTestId("quote").textContent!);
    expect(calculatorQuote).toMatchObject({
      estimatedPrice: price,
      estimatedHours: hours,
    });
    calculator.unmount();

    // The persisted English preference also exercises a new provider mount.
    mount(<Flow chat />);
    await user.click(
      await screen.findByRole("button", { name: "Chat with the assistant" }),
    );
    await user.click(screen.getByRole("button", { name: chatType }));
    await screen.findByText(/understood. Which features do you need/);
    await user.type(screen.getByRole("textbox"), description);
    await user.click(screen.getByRole("button", { name: "Send" }));
    await user.click(await screen.findByRole("button", { name: team }));
    await screen.findByRole("button", { name: "Request a detailed quote" });
    const englishEstimate = screen.getByText(/This is a simple-project baseline/);
    expect(englishEstimate).toHaveTextContent(`• Price — ${formattedPrice}`);
    expect(englishEstimate).toHaveTextContent(`• Person-hours — ${hours}`);
    expect(englishEstimate).toHaveTextContent(`• Timeline — about ${weeks} weeks`);
    expect(englishEstimate).toHaveTextContent("extra features is not included");
    expect(englishEstimate).toHaveTextContent("40 person-hours per week");
    expect(englishEstimate).toHaveTextContent(
      "Your team preference does not change this estimate",
    );
    await user.click(screen.getByText("Switch language"));
    const mongolianEstimate = screen.getByText(/Энэ нь энгийн төслийн суурь тооцоо/);
    expect(mongolianEstimate).toHaveTextContent(`• Үнэ — ${formattedPrice}`);
    expect(mongolianEstimate).toHaveTextContent(`• Хүн-цаг — ${hours}`);
    expect(mongolianEstimate).toHaveTextContent(
      `• Хугацаа — ойролцоогоор ${weeks} долоо хоног`,
    );
    expect(mongolianEstimate).toHaveTextContent("нэмэлт функцуудын ажил ороогүй");
    expect(mongolianEstimate).toHaveTextContent("долоо хоногт 40 хүн-цагаар");
    expect(mongolianEstimate).toHaveTextContent("Багийн сонголт тооцоонд нөлөөлөхгүй");
    expect(screen.getByText(description)).toBeInTheDocument();
    await user.click(screen.getByText("Switch language"));
    await user.click(
      screen.getByRole("button", { name: "Request a detailed quote" }),
    );
    expect(JSON.parse(screen.getByTestId("quote").textContent!)).toMatchObject({
      projectType: calculatorQuote.projectType,
      complexity: calculatorQuote.complexity,
      features: calculatorQuote.features,
      estimatedPrice: calculatorQuote.estimatedPrice,
      estimatedHours: calculatorQuote.estimatedHours,
      estimatedWeeks: weeks,
      description,
    });
  },
  10000,
);

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
    () => expect(screen.getByText(/• Price — ₮3,520,000/)).toBeInTheDocument(),
    { timeout: 2000 },
  );
  await user.click(screen.getByText("Switch language"));
  expect(screen.getByText(/• Үнэ — ₮3,520,000/)).toBeInTheDocument();
  await user.click(
    screen.getByRole("button", { name: "Дэлгэрэнгүй үнийн санал авах" }),
  );
  expect(JSON.parse(screen.getByTestId("quote").textContent!)).toMatchObject({
    projectType: "website",
    teamSize: "1",
    description: "Custom features",
    complexity: "simple",
    features: [],
    estimatedHours: 40,
    estimatedWeeks: 1,
    estimatedPrice: 3520000,
  });
  expect(
    screen.getByRole("combobox", { name: /Төслийн төрөл/ }),
  ).toHaveTextContent("Вэб сайт хөгжүүлэлт");
});

vi.mock("../src/app/components/Turnstile", async () => {
  const { useEffect } = await import("react");
  return {
    Turnstile: function MockTurnstile({
      onToken,
    }: {
      onToken: (token: string) => void;
    }) {
      useEffect(() => {
        onToken("test-token");
      }, [onToken]);
      return <div>Verification widget</div>;
    },
  };
});
