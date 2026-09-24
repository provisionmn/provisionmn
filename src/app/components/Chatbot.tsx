"use client";

import { useT } from "../i18n";
import { formatCopy, type FlowCopy } from "../flow-copy";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuote } from "../quote-context";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";

interface Message {
  id: number;
  text: string | ((copy: FlowCopy) => string);
  sender: "user" | "bot";
  options?: string[];
}

interface ProjectData {
  projectType?: string;
  details?: string;
  teamSize?: string;
}

type ChatState = "greeting" | "details" | "teamSize" | "quote";

const group = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export function Chatbot() {
  const {
    t: { flow: copy },
  } = useT();
  const PROJECT_TYPES = ["website", "mobile", "erp", "custom"];
  const QUOTE_CTA = "quote";
  const RESTART = "restart";
  const optionKeys: Record<string, keyof FlowCopy> = {
    website: "website",
    mobile: "mobileApp",
    custom: "other",
    quote: "requestADetailedQuote",
    restart: "estimateAnotherProject",
    "1": "soloFreelancer",
    "2-3": "smallTeam",
    "4-6": "mediumTeam",
    "6+": "largeTeam",
  };
  const optionLabel = (value: string, words: FlowCopy) =>
    value === "erp"
      ? "Odoo ERP"
      : value === "cross-platform"
        ? "Cross-platform"
        : (words[optionKeys[value] ?? (value as keyof FlowCopy)] ?? value);
  const GREETING: Message = {
    id: 0,
    sender: "bot",
    text: (words) => words.helloIMTheProvisionMnAssistant,
    options: PROJECT_TYPES,
  };
  const detailOptions = (type: string) => {
    switch (type) {
      case "website":
        return [
          "simpleCompanyWebsite",
          "eCommerceStore",
          "blogOrNewsSite",
          "customFeatures",
        ];
      case "mobile":
        return ["iosApp", "androidApp", "cross-platform", "customFeatures"];
      case "erp":
        return ["sales", "inventory", "finance", "humanResources", "all"];
      default:
        return undefined;
    }
  };
  const TEAM_OPTIONS = ["1", "2-3", "4-6", "6+"];
  function calculateEstimate(data: ProjectData) {
    const [basePrice, weeks] =
      data.projectType === "website"
        ? [800000, 3]
        : data.projectType === "mobile"
          ? [1200000, 6]
          : data.projectType === "erp"
            ? [2000000, 12]
            : [600000, 4];
    const team = data.teamSize ?? "";
    const multiplier =
      team === "1" ? 1 : team === "2-3" ? 1.5 : team === "4-6" ? 2 : 2.5;
    return {
      price: Math.round(basePrice * multiplier),
      weeks: Math.round(weeks * multiplier * 0.8),
    };
  }

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
  const reply = (text: Message["text"], options?: string[]) => {
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
            (type) =>
              type === input ||
              optionLabel(type, copy).toLowerCase() ===
                input.trim().toLowerCase(),
          ) ?? "custom";
        setProjectData({ projectType: matched });
        setChatState("details");
        reply(
          (words) =>
            formatCopy(
              words.valueUnderstoodWhichFeaturesDoYouNeed,
              optionLabel(matched, words),
            ),
          detailOptions(matched),
        );
        break;
      }
      case "details":
        setProjectData((prev) => ({ ...prev, details: input }));
        setChatState("teamSize");
        reply((words) => words.thankYouWhatTeamSizeDoYou, TEAM_OPTIONS);
        break;
      case "teamSize": {
        const teamSize =
          TEAM_OPTIONS.find(
            (team) =>
              team === input ||
              optionLabel(team, copy).toLowerCase() === input.toLowerCase(),
          ) ?? input;
        const data = { ...projectData, teamSize };
        const estimate = calculateEstimate(data);
        setProjectData(data);
        setChatState("quote");
        reply(
          (words) =>
            [
              words.estimateHeading,
              formatCopy(
                words.typeValue,
                optionLabel(data.projectType ?? "custom", words),
              ),
              formatCopy(words.timelineAboutValueWeeks, estimate.weeks),
              formatCopy(words.teamValue, optionLabel(teamSize, words)),
              formatCopy(words.priceValue, group(estimate.price)),
              "",
              words.thisIsAnIndicativeEstimateWouldYou,
            ].join("\n"),
          [QUOTE_CTA, RESTART],
        );
        break;
      }
      case "quote":
        reply(
          (words) => words.chooseADetailedQuoteOrStartAnother,
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
    push({ text: (words) => optionLabel(option, words), sender: "user" });
    advance(chatState === "details" ? optionLabel(option, copy) : option);
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
        aria-label={copy.chatWithTheAssistant}
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
      aria-label={copy.provisionAssistant}
      className="fixed inset-x-4 bottom-4 z-50 flex max-h-[min(600px,calc(100dvh-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card elev-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[380px]"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-brand">
            <Sparkles strokeWidth={1.5} className="h-4 w-4" />
          </span>
          <div>
            <div className="text-sm font-medium text-foreground">
              {copy.provisionAssistant}{" "}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {copy.preliminaryEstimate}{" "}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={close}
          aria-label={copy.close}
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
                {typeof message.text === "function"
                  ? message.text(copy)
                  : message.text}
              </p>
            </div>
            {message.options &&
            message.id === messages.at(-1)?.id &&
            !isTyping ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {message.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleOption(option)}
                    className="rounded-full border border-border px-3 py-1.5 text-left text-xs text-foreground transition-[background-color,border-color,transform] duration-[160ms] ease-out-strong hover:border-primary/50 hover:bg-secondary active:scale-[0.97]"
                  >
                    {optionLabel(option, copy)}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}

        {isTyping ? (
          <div className="flex justify-start">
            <span className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-secondary px-3.5 py-3">
              <span className="sr-only">{copy.typing}</span>
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
          placeholder={copy.writeAMessage}
          aria-label={copy.message}
          autoComplete="off"
          className="flex-1"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!draft.trim() || isTyping}
          aria-label={copy.send}
        >
          <Send strokeWidth={1.5} className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
