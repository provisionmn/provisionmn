"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuote } from "../quote-context";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  options?: string[];
}

interface ProjectData {
  projectType?: string;
  details?: string;
  teamSize?: string;
}

type ChatState = "greeting" | "details" | "teamSize" | "quote";

const PROJECT_TYPES = ["Вэб сайт", "Мобайл апп", "Odoo ERP", "Бусад"];
const QUOTE_CTA = "Дэлгэрэнгүй үнийн санал авах";
const RESTART = "Өөр төсөл тооцуулах";

const GREETING: Message = {
  id: 0,
  sender: "bot",
  text: "Сайн байна уу! Би Provision.mn-ийн туслах байна. Төслийнхөө талаар хэдэн зүйл асуугаад урьдчилсан тооцоо гаргаж өгье. Та ямар төрлийн төсөл хийх гэж байна?",
  options: PROJECT_TYPES,
};

const group = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const detailOptions = (projectType: string) => {
  switch (projectType) {
    case "Вэб сайт":
      return [
        "Энгийн танилцуулах сайт",
        "E-commerce дэлгүүр",
        "Блог, мэдээний сайт",
        "Захиалгат функц",
      ];
    case "Мобайл апп":
      return ["iOS апп", "Android апп", "Cross-platform", "Захиалгат функц"];
    case "Odoo ERP":
      return ["Борлуулалт", "Нярав", "Санхүү", "Хүний нөөц", "Бүгд"];
    default:
      return undefined;
  }
};

const TEAM_OPTIONS = [
  "1 хүн (фрийлансер)",
  "2-3 хүн (жижиг баг)",
  "4-6 хүн (дундаж баг)",
  "6+ хүн (том баг)",
];

function calculateEstimate(data: ProjectData) {
  let basePrice = 600000;
  let weeks = 4;

  switch (data.projectType) {
    case "Вэб сайт":
      basePrice = 800000;
      weeks = 3;
      break;
    case "Мобайл апп":
      basePrice = 1200000;
      weeks = 6;
      break;
    case "Odoo ERP":
      basePrice = 2000000;
      weeks = 12;
      break;
  }

  const team = data.teamSize ?? "";
  const multiplier = team.includes("1 хүн")
    ? 1
    : team.includes("2-3")
      ? 1.5
      : team.includes("4-6")
        ? 2
        : 2.5;

  return {
    price: Math.round(basePrice * multiplier),
    weeks: Math.round(weeks * multiplier * 0.8),
  };
}

export function Chatbot() {
  const router = useRouter();
  const { setQuote } = useQuote();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatState, setChatState] = useState<ChatState>("greeting");
  const [projectData, setProjectData] = useState<ProjectData>({});

  const nextId = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Keep the transcript pinned to the newest message, including while the
  // typing indicator is up — otherwise the reply lands out of view.
  useEffect(() => {
    if (!isOpen) return;
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Send focus back to the thing that opened the panel rather than
    // dropping it at the top of the document.
    launcherRef.current?.focus();
  }, []);

  // Escape closes the panel, which is what every other dialog on the web does.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  const push = (message: Omit<Message, "id">) =>
    setMessages((prev) => [...prev, { ...message, id: nextId.current++ }]);

  /** Bot replies land after a short beat, with a visible typing indicator —
   *  a silent one-second pause reads as a broken button. */
  const reply = (text: string, options?: string[]) => {
    setIsTyping(true);
    const timer = setTimeout(() => {
      setIsTyping(false);
      push({ text, sender: "bot", options });
    }, 700);
    timers.current.push(timer);
  };

  const advance = (input: string) => {
    switch (chatState) {
      case "greeting": {
        // Free text is accepted here too. The old flow only advanced on an
        // exact match against the four buttons, so anything typed vanished
        // with no reply at all.
        const matched =
          PROJECT_TYPES.find(
            (type) => type.toLowerCase() === input.trim().toLowerCase(),
          ) ?? "Бусад";
        setProjectData({ projectType: matched });
        setChatState("details");
        reply(
          `${matched} — ойлголоо. Ямар функцууд хэрэгтэй вэ? Товчоор бичээд ч болно.`,
          detailOptions(matched),
        );
        break;
      }
      case "details":
        setProjectData((prev) => ({ ...prev, details: input }));
        setChatState("teamSize");
        reply(
          "Баярлалаа. Хэр хэмжээний баг хэрэгтэй гэж бодож байна?",
          TEAM_OPTIONS,
        );
        break;
      case "teamSize": {
        const data = { ...projectData, teamSize: input };
        const estimate = calculateEstimate(data);
        setProjectData(data);
        setChatState("quote");
        reply(
          [
            "Урьдчилсан тооцоо:",
            `• Төрөл — ${data.projectType}`,
            `• Хугацаа — ойролцоогоор ${estimate.weeks} долоо хоног`,
            `• Баг — ${input}`,
            `• Үнэ — ₮${group(estimate.price)}`,
            "",
            "Энэ бол чиг баримжаа авах тооцоо. Албан ёсны санал авах уу?",
          ].join("\n"),
          [QUOTE_CTA, RESTART],
        );
        break;
      }
      case "quote":
        reply(
          "Дэлгэрэнгүй санал авах эсвэл дахин тооцоолохыг сонгоно уу.",
          [QUOTE_CTA, RESTART],
        );
        break;
    }
  };

  const restart = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setIsTyping(false);
    setMessages([GREETING]);
    setChatState("greeting");
    setProjectData({});
    inputRef.current?.focus();
  };

  const handleOption = (option: string) => {
    if (option === QUOTE_CTA) {
      const estimate = calculateEstimate(projectData);
      setQuote({
        projectType: projectData.projectType,
        description: projectData.details,
        teamSize: projectData.teamSize,
        estimatedPrice: estimate.price,
        estimatedWeeks: estimate.weeks,
      });
      setIsOpen(false);
      router.push("/quote");
      return;
    }
    if (option === RESTART) {
      restart();
      return;
    }
    push({ text: option, sender: "user" });
    advance(option);
  };

  const send = () => {
    const text = draft.trim();
    if (!text || isTyping) return;
    push({ text, sender: "user" });
    setDraft("");
    advance(text);
  };

  if (!isOpen) {
    return (
      <Button
        ref={launcherRef}
        onClick={() => setIsOpen(true)}
        aria-label="Туслахтай ярих"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full elev-3"
      >
        <MessageCircle strokeWidth={1.5} className="h-6 w-6" />
      </Button>
    );
  }

  return (
    // Sized off the viewport, not a fixed 384×600 box: at `w-96` the panel
    // was wider than a 360px phone, and 600px tall overflowed a short one.
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Provision туслах"
      className="fixed inset-x-4 bottom-4 z-50 flex max-h-[min(600px,calc(100dvh-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card elev-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[380px]"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-brand">
            <Sparkles strokeWidth={1.5} className="h-4 w-4" />
          </span>
          <div>
            <div className="text-sm font-medium text-foreground">
              Provision туслах
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Урьдчилсан тооцоо
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={close}
          aria-label="Хаах"
          className="rounded-full"
        >
          <X strokeWidth={1.5} className="h-4 w-4" />
        </Button>
      </div>

      <div
        className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-4"
        aria-live="polite"
      >
        {messages.map((message) => (
          <div key={message.id}>
            <div
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <p
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  message.sender === "user"
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-secondary text-foreground"
                }`}
              >
                {message.text}
              </p>
            </div>
            {message.options ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {message.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleOption(option)}
                    className="rounded-full border border-border px-3 py-1.5 text-left text-xs text-foreground transition-[background-color,border-color,transform] duration-[160ms] ease-out-strong hover:border-primary/50 hover:bg-secondary active:scale-[0.97]"
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}

        {isTyping ? (
          <div className="flex justify-start">
            <span className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-secondary px-3.5 py-3">
              <span className="sr-only">Бичиж байна…</span>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  aria-hidden
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground"
                  style={{ animationDelay: `${i * 140}ms` }}
                />
              ))}
            </span>
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <Input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Мессеж бичих…"
          aria-label="Мессеж"
          autoComplete="off"
          className="flex-1"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!draft.trim() || isTyping}
          aria-label="Илгээх"
        >
          <Send strokeWidth={1.5} className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
