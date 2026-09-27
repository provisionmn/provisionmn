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
    ["Вэб сайт", "Энгийн", 40, 3520000, 1],
    ["Мобайл апп", "Дундаж", 120, 10560000, 3],
    ["Odoo ERP", "Энтерпрайз", 480, 42240000, 12],
    ["Захиалгат шийдэл", "Төвөгтэй", 150, 13200000, 4],
  ])(
    "calculates %s / %s and prefills the quote",
    async (project, complexity, hours, price, weeks) => {
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
      expect(screen.getByText(`~${weeks} 7 хоног`)).toBeInTheDocument();
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
        estimatedWeeks: weeks,
      });
      expect(screen.getByLabelText(/Төслийн дэлгэрэнгүй тайлбар/)).toHaveValue(
        quote.description,
      );
      expect(
        screen.getByRole("combobox", { name: /Төслийн төрөл/ }),
      ).toHaveTextContent(project);
    },
  );

  it.each(["urgent", "long"])(
    "sends the displayed weeks to the API separately from the %s timeline",
    async (timeline) => {
      const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        json: async () => ({ id: "a13bd758-91c2-4db6-adc5-0e6de1575745" }),
      } as Response);
      mount();
      const user = userEvent.setup();
      await user.click(screen.getByRole("radio", { name: /^Захиалгат шийдэл/ }));
      await user.click(screen.getByRole("radio", { name: /^Төвөгтэй/ }));
      await user.click(screen.getByRole("radio", { name: /^Яаралтай/ }));
      await user.type(
        screen.getByRole("textbox"),
        "Захиалга удирдах шинэ систем хэрэгтэй",
      );

      const displayedWeeks = Number(
        screen.getByText(/^~\d+ 7 хоног$/).textContent!.match(/\d+/)![0],
      );
      expect(displayedWeeks).toBe(4);
      await user.click(submit());
      expect(JSON.parse(screen.getByTestId("quote").textContent!)).toMatchObject({
        estimatedWeeks: displayedWeeks,
        timeline: "urgent",
      });
      const timelineSelect = screen.getByRole("combobox", { name: /Хугацаа/ });
      expect(timelineSelect).toHaveTextContent("Яаралтай");
      if (timeline === "long") {
        timelineSelect.focus();
        await user.keyboard("{ArrowDown}");
        await user.click(
          await screen.findByRole("option", { name: /Урт хугацаа/ }),
        );
      }
      await user.type(screen.getByLabelText(/Овог нэр/), "Тест Хэрэглэгч");
      await user.type(screen.getByLabelText(/Имэйл хаяг/), "test@example.com");
      await user.type(screen.getByLabelText(/Утас/), "99112233");
      await user.click(screen.getByRole("button", { name: "Хүсэлт илгээх" }));

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/requests",
        expect.objectContaining({ method: "POST" }),
      );
      expect(JSON.parse(fetchMock.mock.calls[0][1]?.body as string)).toMatchObject({
        kind: "quote",
        estimatedWeeks: displayedWeeks,
        timeline,
      });
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
    expect(screen.getAllByRole("alert")).toHaveLength(5);
    expect(screen.queryByText("Илгээж байна…")).not.toBeInTheDocument();
  });
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
