export type WellnessOverallDay =
  | "hard"
  | "okay"
  | "better"
  | "good"
  | "not_sure";

export type WellnessCheckinDepth = "quick" | "expanded";

export const WELLNESS_OVERALL_LABEL: Record<WellnessOverallDay, string> = {
  hard: "Struggling",
  okay: "Okay",
  better: "Better",
  good: "Good",
  not_sure: "Not sure yet",
};

export const WELLNESS_OVERALL_CHOICES: Array<{
  value: WellnessOverallDay;
  label: string;
}> = [
  { value: "hard", label: WELLNESS_OVERALL_LABEL.hard },
  { value: "okay", label: WELLNESS_OVERALL_LABEL.okay },
  { value: "better", label: WELLNESS_OVERALL_LABEL.better },
  { value: "good", label: WELLNESS_OVERALL_LABEL.good },
];

export function wellnessOverallLabel(value: string | null | undefined) {
  if (!value) return "Not selected";
  if (value in WELLNESS_OVERALL_LABEL) {
    return WELLNESS_OVERALL_LABEL[value as WellnessOverallDay];
  }
  return "Not selected";
}
