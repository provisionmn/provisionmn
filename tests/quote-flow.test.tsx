import { LanguageProvider } from "../src/app/i18n";
import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PriceCalculator } from "../src/app/components/PriceCalculator";
import { QuoteRequest } from "../src/app/components/QuoteRequest";
import { QuoteProvider, useQuote } from "../src/app/quote-context";

const navigation = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => navigation }));

function Flow() {
  const [page, setPage] = useState("calculator");
  navigation.push.mockImplementation((url: string) => setPage(url));
  return page === "/quote" ? <QuoteRequest /> : <PriceCalculator />;
}
function QuoteSnapshot() {
  const { quote } = useQuote();
  return <output data-testid="quote">{JSON.stringify(quote)}</output>;
}
function mount() {
  return render(
    <LanguageProvider>
      <QuoteProvider>
        <Flow />
        <QuoteSnapshot />
      </QuoteProvider>
    </LanguageProvider>,
  );
}
const submit = () =>
  screen.getAllByRole("button", { name: "Үнийн санал авах" })[0];

beforeEach(() => {
  navigation.push.mockReset();
  localStorage.clear();
});

describe("calculator → quote", () => {
  it.each([
    ["Вэб сайт", "Энгийн", 40, 3520000],
    ["Мобайл апп", "Дундаж", 120, 10560000],
    ["Odoo ERP", "Энтерпрайз", 480, 42240000],
    ["Захиалгат шийдэл", "Төвөгтэй", 150, 13200000],
  ])(
    "calculates %s / %s and prefills the quote",
    async (project, complexity, hours, price) => {
      mount();
      const user = userEvent.setup();
      await user.click(
        screen.getByRole("radio", { name: new RegExp(`^${project}`) }),
      );
      await user.click(
        screen.getByRole("radio", { name: new RegExp(`^${complexity}`) }),
      );
      await user.type(
        screen.getByRole("textbox"),
        "Харилцагчийн захиалга удирдах шинэ систем",
      );
      await user.click(submit());
      expect(navigation.push).toHaveBeenCalledWith("/quote");
      const quote = JSON.parse(screen.getByTestId("quote").textContent!);
      expect(quote).toMatchObject({
        projectType: (
          {
            "Вэб сайт": "website",
            "Мобайл апп": "mobile",
            "Odoo ERP": "erp",
            "Захиалгат шийдэл": "custom",
          } as Record<string, string>
        )[project],
        complexity: (
          {
            Энгийн: "simple",
            Дундаж: "medium",
            Төвөгтэй: "complex",
            Энтерпрайз: "enterprise",
          } as Record<string, string>
        )[complexity],
        estimatedHours: hours,
        estimatedPrice: price,
      });
      expect(screen.getByLabelText(/Төслийн дэлгэрэнгүй тайлбар/)).toHaveValue(
        quote.description,
      );
      expect(
        screen.getByRole("combobox", { name: /Төслийн төрөл/ }),
      ).toHaveTextContent(project);
    },
  );

  it("adds feature hours after complexity and removes deselected features", async () => {
    mount();
    const user = userEvent.setup();
    await user.click(screen.getByRole("radio", { name: /^Вэб сайт/ }));
    await user.click(screen.getByRole("radio", { name: /^Дундаж/ }));
    await user.click(screen.getByRole("checkbox", { name: /API интеграци/ }));
    await user.click(
      screen.getByRole("checkbox", { name: /Контент удирдлага/ }),
    );
    await user.click(screen.getByRole("checkbox", { name: /API интеграци/ }));
    await user.click(screen.getByRole("radio", { name: /^Яаралтай/ }));
    await user.click(screen.getByRole("radio", { name: "2–3 хүн" }));
    await user.type(screen.getByRole("textbox"), "a".repeat(20));
    await user.click(submit());
    expect(JSON.parse(screen.getByTestId("quote").textContent!)).toMatchObject({
      features: ["cms"],
      estimatedHours: 80,
      estimatedPrice: 7040000,
      timeline: "urgent",
      teamSize: "2-3",
    });
    expect(screen.getByRole("combobox", { name: /Хугацаа/ })).toHaveTextContent(
      "Яаралтай",
    );
  });

  it("blocks missing selections and trimmed descriptions shorter than 20 characters", async () => {
    mount();
    const user = userEvent.setup();
    await user.click(submit());
    expect(navigation.push).not.toHaveBeenCalled();
    expect(screen.getByRole("radio", { name: /^Вэб сайт/ })).toHaveFocus();
    await user.click(screen.getByRole("radio", { name: /^Вэб сайт/ }));
    await user.click(screen.getByRole("radio", { name: /^Энгийн/ }));
    await user.type(screen.getByRole("textbox"), `  ${"a".repeat(19)}  `);
    await user.click(submit());
    expect(navigation.push).not.toHaveBeenCalled();
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "a".repeat(20) },
    });
    await user.click(submit());
    expect(navigation.push).toHaveBeenCalledWith("/quote");
  });

  it("drops in-memory prefill on a fresh provider mount", async () => {
    const view = mount();
    const user = userEvent.setup();
    await user.click(screen.getByRole("radio", { name: /^Вэб сайт/ }));
    await user.click(screen.getByRole("radio", { name: /^Энгийн/ }));
    await user.type(screen.getByRole("textbox"), "a".repeat(20));
    await user.click(submit());
    expect(screen.getByLabelText(/Төслийн дэлгэрэнгүй тайлбар/)).toHaveValue(
      "a".repeat(20),
    );
    view.unmount();
    render(
      <LanguageProvider>
        <QuoteProvider>
          <QuoteRequest />
        </QuoteProvider>
      </LanguageProvider>,
    );
    expect(screen.getByLabelText(/Төслийн дэлгэрэнгүй тайлбар/)).toHaveValue(
      "",
    );
    expect(
      screen.getByRole("combobox", { name: /Төслийн төрөл/ }),
    ).toHaveTextContent("Төслийн төрлийг сонгоно уу");
  });

  it("rejects an empty quote and focuses the first invalid field", async () => {
    render(
      <LanguageProvider>
        <QuoteProvider>
          <QuoteRequest />
        </QuoteProvider>
      </LanguageProvider>,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Хүсэлт илгээх" }),
    );
    expect(screen.getByLabelText(/Овог нэр/)).toHaveFocus();
    expect(screen.getAllByRole("alert")).toHaveLength(6);
    expect(screen.getByText("Хариу таарахгүй байна.")).toBeInTheDocument();
    expect(screen.queryByText("Илгээж байна…")).not.toBeInTheDocument();
  });
});
