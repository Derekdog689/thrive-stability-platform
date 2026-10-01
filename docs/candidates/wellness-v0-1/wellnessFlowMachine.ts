import type {
  WellnessCheckinDepth,
  WellnessOverallDay,
} from "./wellnessVocabulary";

export type WellnessReflectionKey =
  | "stress"
  | "sleep"
  | "energy"
  | "confidence"
  | "routine"
  | "recovery_support"
  | "support_needed";

export type WellnessFlowState =
  | { phase: "signal" }
  | { phase: "depth_choice" }
  | {
      phase: "expanded";
      selectedSignals: WellnessReflectionKey[];
    }
  | {
      phase: "saving";
      depth: WellnessCheckinDepth;
    }
  | {
      phase: "return";
      checkinId: string;
    };

export type WellnessFlowEvent =
  | { type: "SELECT_OVERALL"; value: WellnessOverallDay }
  | { type: "DONE_FOR_NOW" }
  | { type: "LOOK_CLOSER" }
  | { type: "TOGGLE_SIGNAL"; key: WellnessReflectionKey }
  | { type: "FINISH_EXPANDED" }
  | { type: "SAVE_SUCCEEDED"; checkinId: string }
  | { type: "SAVE_FAILED"; previousDepth: WellnessCheckinDepth }
  | { type: "START_NEW_CHECKIN" };

export const INITIAL_WELLNESS_FLOW_STATE: WellnessFlowState = {
  phase: "signal",
};

export function wellnessFlowReducer(
  state: WellnessFlowState,
  event: WellnessFlowEvent,
): WellnessFlowState {
  switch (event.type) {
    case "SELECT_OVERALL":
      return { phase: "depth_choice" };

    case "DONE_FOR_NOW":
      if (state.phase !== "depth_choice") return state;
      return { phase: "saving", depth: "quick" };

    case "LOOK_CLOSER":
      if (state.phase !== "depth_choice") return state;
      return { phase: "expanded", selectedSignals: [] };

    case "TOGGLE_SIGNAL":
      if (state.phase !== "expanded") return state;
      return {
        ...state,
        selectedSignals: state.selectedSignals.includes(event.key)
          ? state.selectedSignals.filter((key) => key !== event.key)
          : [...state.selectedSignals, event.key],
      };

    case "FINISH_EXPANDED":
      if (state.phase !== "expanded") return state;
      return { phase: "saving", depth: "expanded" };

    case "SAVE_SUCCEEDED":
      if (state.phase !== "saving") return state;
      return {
        phase: "return",
        checkinId: event.checkinId,
      };

    case "SAVE_FAILED":
      return event.previousDepth === "quick"
        ? { phase: "depth_choice" }
        : { phase: "expanded", selectedSignals: [] };

    case "START_NEW_CHECKIN":
      return INITIAL_WELLNESS_FLOW_STATE;

    default:
      return state;
  }
}
