"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type SpeechRecognitionAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  0: SpeechRecognitionAlternativeLike;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

const participantPaths = [
  "/",
  "/wellness",
  "/goals",
  "/goals-candidate",
  "/support",
  "/budget",
  "/financial-activity",
  "/my-program",
  "/resources",
];

function isParticipantPath(pathname: string) {
  return participantPaths.some((path) =>
    path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`),
  );
}

function getRecognitionConstructor() {
  const speechWindow = window as typeof window & {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };

  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

function setReactFieldValue(field: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const prototype =
    field instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

  if (setter) {
    setter.call(field, value);
  } else {
    field.value = value;
  }

  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
}

function isEligibleField(node: Element): node is HTMLInputElement | HTMLTextAreaElement {
  if (node instanceof HTMLTextAreaElement) {
    return !node.disabled && !node.readOnly;
  }

  if (!(node instanceof HTMLInputElement)) return false;

  const type = (node.type || "text").toLowerCase();
  return type === "text" && !node.disabled && !node.readOnly;
}

export default function ParticipantSpeechInput() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isParticipantPath(pathname)) return;

    const Recognition = getRecognitionConstructor();
    if (!Recognition) return;

    const buttons = new Set<HTMLButtonElement>();

    function attachButton(field: HTMLInputElement | HTMLTextAreaElement) {
      if (field.dataset.thriveSpeechInput === "true") return;
      if (field.closest("[data-thrive-speech-disabled='true']")) return;

      field.dataset.thriveSpeechInput = "true";

      const button = document.createElement("button");
      button.type = "button";
      button.className = "thrive-speech-input-button";
      button.setAttribute("aria-label", "Use speech to fill this field");
      button.innerHTML = '<span aria-hidden="true">🎙</span><span>Talk</span>';

      let recognition: SpeechRecognitionLike | null = null;

      button.addEventListener("click", () => {
        if (!field.isConnected || button.dataset.listening === "true") return;

        recognition = new Recognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        button.dataset.listening = "true";
        button.innerHTML = '<span aria-hidden="true">●</span><span>Listening…</span>';
        button.setAttribute("aria-label", "Listening for speech");

        recognition.onresult = (event) => {
          const transcript = event.results[0]?.[0]?.transcript?.trim() ?? "";
          if (!transcript) return;

          const separator = field.value.trim() ? " " : "";
          let nextValue = `${field.value}${separator}${transcript}`;

          if (field.maxLength > -1) {
            nextValue = nextValue.slice(0, field.maxLength);
          }

          setReactFieldValue(field, nextValue);
          field.focus();
          field.setSelectionRange(nextValue.length, nextValue.length);
        };

        recognition.onerror = () => {
          button.dataset.listening = "false";
          button.innerHTML = '<span aria-hidden="true">🎙</span><span>Try again</span>';
          button.setAttribute("aria-label", "Speech was not captured. Try again");
        };

        recognition.onend = () => {
          button.dataset.listening = "false";
          button.innerHTML = '<span aria-hidden="true">🎙</span><span>Talk</span>';
          button.setAttribute("aria-label", "Use speech to fill this field");
        };

        recognition.start();
      });

      field.insertAdjacentElement("afterend", button);
      buttons.add(button);
    }

    function scan(root: ParentNode = document) {
      root.querySelectorAll("textarea, input[type='text'], input:not([type])").forEach((node) => {
        if (isEligibleField(node)) attachButton(node);
      });
    }

    scan();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (isEligibleField(node)) attachButton(node);
          scan(node);
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      buttons.forEach((button) => button.remove());
      document.querySelectorAll("[data-thrive-speech-input='true']").forEach((field) => {
        delete (field as HTMLElement).dataset.thriveSpeechInput;
      });
    };
  }, [pathname]);

  return (
    <style>{`
      .thrive-speech-input-button {
        display: inline-flex;
        align-items: center;
        gap: .35rem;
        margin-top: .45rem;
        margin-right: .45rem;
        border: 1px solid rgba(5, 150, 105, .24);
        border-radius: 9999px;
        background: rgba(236, 253, 245, .92);
        padding: .42rem .72rem;
        color: #065f46;
        font-size: .72rem;
        font-weight: 800;
        line-height: 1;
        cursor: pointer;
      }

      .thrive-speech-input-button:hover {
        background: #d1fae5;
      }

      .thrive-speech-input-button[data-listening='true'] {
        background: #ecfdf5;
        color: #047857;
      }
    `}</style>
  );
}
