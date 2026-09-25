const originalFetch = globalThis.fetch;
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { Contact } from "../src/app/components/Contact";
import { LanguageProvider } from "../src/app/i18n";

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "a13bd758-91c2-4db6-adc5-0e6de1575745" }),
    }),
  );
});
afterEach(() => {
  localStorage.clear();
  globalThis.fetch = originalFetch;
});

describe("contact validation", () => {
  it.each(["mn", "en"])(
    "shows translated errors and focuses the first field (%s)",
    (lang) => {
      localStorage.setItem("lang", lang);
      const { container } = render(
        <LanguageProvider>
          <Contact />
        </LanguageProvider>,
      );
      fireEvent.submit(container.querySelector("form")!);
      expect(screen.getAllByRole("alert")).toHaveLength(3);
      expect(
        screen.getByLabelText(lang === "en" ? "Name" : "Нэр"),
      ).toHaveFocus();
      expect(
        screen.getByText(
          lang === "en"
            ? "Write at least 20 characters"
            : "Дор хаяж 20 тэмдэгт бичнэ үү",
        ),
      ).toBeInTheDocument();
    },
  );

  it("rejects malformed email and whitespace-padded short brief, then accepts corrected input", async () => {
    const { container } = render(
      <LanguageProvider>
        <Contact />
      </LanguageProvider>,
    );
    fireEvent.change(screen.getByLabelText("Нэр"), {
      target: { value: "Test" },
    });
    fireEvent.change(screen.getByLabelText("И-мэйл"), {
      target: { value: "not-an-email" },
    });
    fireEvent.change(screen.getByLabelText("Төслийн товч тайлбар"), {
      target: { value: `  ${"a".repeat(19)}  ` },
    });
    fireEvent.submit(container.querySelector("form")!);
    expect(screen.getAllByRole("alert")).toHaveLength(2);
    fireEvent.change(screen.getByLabelText("И-мэйл"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Төслийн товч тайлбар"), {
      target: { value: "a".repeat(20) },
    });
    // Component test mocks the API response; API persistence is tested separately.
    fireEvent.submit(container.querySelector("form")!);
    expect(screen.queryAllByRole("alert")).toHaveLength(0);
    expect(
      screen.getByRole("button", { name: "Илгээж байна…" }),
    ).toBeDisabled();
    expect(
      await screen.findByText("Хүсэлт хүлээн авлаа", {}, { timeout: 2500 }),
    ).toBeInTheDocument();
  });
});

it("keeps entered data on failure and retries with the same idempotency key", async () => {
  localStorage.setItem("lang", "en");
  const fetchMock = vi.mocked(fetch);
  fetchMock.mockRejectedValueOnce(new Error("Connection lost"));
  const { container } = render(
    <LanguageProvider>
      <Contact />
    </LanguageProvider>,
  );
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "Retry Test" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "retry@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Brief"), {
    target: { value: "A customer management portal" },
  });
  fireEvent.submit(container.querySelector("form")!);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "We could not confirm",
  );
  expect(screen.getByLabelText("Name")).toHaveValue("Retry Test");
  expect(screen.queryByText("Brief received")).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "Complete verification" }),
  );
  fireEvent.submit(container.querySelector("form")!);
  expect(await screen.findByText("Brief received")).toBeInTheDocument();
  expect(fetchMock.mock.calls[0][1]?.headers).toEqual(
    fetchMock.mock.calls[1][1]?.headers,
  );
  expect(
    JSON.parse(fetchMock.mock.calls[1][1]?.body as string).captchaToken,
  ).toBe("renewed-token");
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
      return (
        <button type="button" onClick={() => onToken("renewed-token")}>
          Complete verification
        </button>
      );
    },
  };
});
