/** Small, optional, nonclinical follow-through. Only explicitly reported check-in signals. */
export type SupportedActionSignals = {
  energy: string | null;
  sleep: string | null;
  routine: string | null;
  confidence: string | null;
};
export function supportedActionSuggestion(signals: SupportedActionSignals): { title: string; detail: string } {
  if (signals.energy === "low" || signals.sleep === "poor") {
    return {
      title: "Make the next ten minutes easier",
      detail: "Pick one small preparation you can manage, like putting tomorrow's essentials in one place. Rest is also an option.",
    };
  }
  if (signals.routine === "off_track" || signals.routine === "mixed") {
    return {
      title: "Choose one small part of your routine",
      detail: "Choose a step you could do in a few minutes, such as setting out what you need for your next planned activity.",
    };
  }
  if (signals.confidence === "low") {
    return {
      title: "Start with something familiar",
      detail: "Pick one ordinary thing you already know how to do. Small is enough, and it's fine to skip it.",
    };
  }
  return {
    title: "Keep one useful thing simple",
    detail: "If you want, choose one small preparation for later. You can also leave your check-in as it is.",
  };
}
