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
  | { phase: "current" }
  | { phase: "signal" }
  | { phase: "depth_choice" }
  | {
      phase: "depth_select";
      selectedSignals: WellnessReflectionKey[];
    }
  | {
      phase: "depth_reflect";
      selectedSignals: WellnessReflectionKey[];
      currentSignalIndex: number;
    }
  | {
      phase: "depth_return";
      selectedSignals: WellnessReflectionKey[];
    }
  | {
      phase: "depth_note";
      selectedSignals: WellnessReflectionKey[];
    }
  | {
      phase: "saving";
      depth: WellnessCheckinDepth;
      selectedSignals: WellnessReflectionKey[];
    }
  | { phase: "return"; checkinId: string };

export type WellnessFlowEvent =
  | { type: "START_NEW_CHECKIN" }
  | { type: "VIEW_CURRENT" }
  | { type: "SELECT_OVERALL"; value: WellnessOverallDay }
  | { type: "DONE_FOR_NOW" }
  | { type: "LOOK_CLOSER" }
  | { type: "TOGGLE_SIGNAL"; key: WellnessReflectionKey }
  | { type: "CONTINUE_DEPTH" }
  | { type: "NEXT_SIGNAL" }
  | { type: "PREVIOUS_SIGNAL" }
  | { type: "BACK_TO_SELECTION" }
  | { type: "GO_TO_NOTE" }
  | { type: "FINISH_EXPANDED" }
  | { type: "SAVE_SUCCEEDED"; checkinId: string }
  | {
      type: "SAVE_FAILED";
      depth: WellnessCheckinDepth;
      selectedSignals?: WellnessReflectionKey[];
    }
  | { type: "BACK_TO_QUICK" };

export const INITIAL_WELLNESS_FLOW_STATE: WellnessFlowState = {
  phase: "current",
};

export function wellnessFlowReducer(
  state: WellnessFlowState,
  event: WellnessFlowEvent,
): WellnessFlowState {
  switch (event.type) {
    case "START_NEW_CHECKIN":
      return { phase: "signal" };

    case "VIEW_CURRENT":
      return { phase: "current" };

    case "SELECT_OVERALL":
      return { phase: "depth_choice" };

    case "DONE_FOR_NOW":
      if (state.phase !== "depth_choice") return state;
      return { phase: "saving", depth: "quick", selectedSignals: [] };

    case "LOOK_CLOSER":
      if (state.phase !== "depth_choice") return state;
      return { phase: "depth_select", selectedSignals: [] };

    case "TOGGLE_SIGNAL":
      if (state.phase !== "depth_select") return state;
      return {
        ...state,
        selectedSignals: state.selectedSignals.includes(event.key)
          ? state.selectedSignals.filter((key) => key !== event.key)
          : [...state.selectedSignals, event.key],
      };

    case "CONTINUE_DEPTH":
      if (state.phase !== "depth_select" || state.selectedSignals.length === 0) {
        return state;
      }
      return {
        phase: "depth_reflect",
        selectedSignals: state.selectedSignals,
        currentSignalIndex: 0,
      };

    case "NEXT_SIGNAL":
      if (state.phase !== "depth_reflect") return state;
      if (state.currentSignalIndex >= state.selectedSignals.length - 1) {
        return {
          phase: "depth_return",
          selectedSignals: state.selectedSignals,
        };
      }
      return {
        ...state,
        currentSignalIndex: state.currentSignalIndex + 1,
      };

    case "PREVIOUS_SIGNAL":
      if (state.phase === "depth_return") {
        return {
          phase: "depth_reflect",
          selectedSignals: state.selectedSignals,
          currentSignalIndex: Math.max(0, state.selectedSignals.length - 1),
        };
      }
      if (state.phase === "depth_note") {
        return {
          phase: "depth_return",
          selectedSignals: state.selectedSignals,
        };
      }
      if (state.phase !== "depth_reflect") return state;
      if (state.currentSignalIndex <= 0) {
        return {
          phase: "depth_select",
          selectedSignals: state.selectedSignals,
        };
      }
      return {
        ...state,
        currentSignalIndex: state.currentSignalIndex - 1,
      };

    case "BACK_TO_SELECTION":
      if (
        state.phase !== "depth_reflect" &&
        state.phase !== "depth_return" &&
        state.phase !== "depth_note"
      ) {
        return state;
      }
      return {
        phase: "depth_select",
        selectedSignals: state.selectedSignals,
      };

    case "GO_TO_NOTE":
      if (state.phase !== "depth_return") return state;
      return {
        phase: "depth_note",
        selectedSignals: state.selectedSignals,
      };

    case "FINISH_EXPANDED":
      if (state.phase !== "depth_note") return state;
      return {
        phase: "saving",
        depth: "expanded",
        selectedSignals: state.selectedSignals,
      };

    case "SAVE_SUCCEEDED":
      if (state.phase !== "saving") return state;
      return { phase: "return", checkinId: event.checkinId };

    case "SAVE_FAILED":
      return event.depth === "quick"
        ? { phase: "depth_choice" }
        : {
            phase: "depth_note",
            selectedSignals: event.selectedSignals ?? [],
          };

    case "BACK_TO_QUICK":
      if (
        state.phase !== "depth_select" &&
        state.phase !== "depth_reflect" &&
        state.phase !== "depth_return" &&
        state.phase !== "depth_note"
      ) {
        return state;
      }
      return { phase: "depth_choice" };

    default:
      return state;
  }
}
