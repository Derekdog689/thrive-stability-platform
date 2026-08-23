export type GoalAreaId =
  | "daily_stability"
  | "money_budgeting"
  | "health_wellness"
  | "relationships_support"
  | "work_education"
  | "personal_growth"
  | "other";

export type GoalPreset = {
  id: string;
  title: string;
  nextSteps: string[];
};

export type GoalAreaDefinition = {
  id: GoalAreaId;
  label: string;
  description: string;
  presets: GoalPreset[];
};

const otherStep = "Write my own next step";

export const goalAreas: GoalAreaDefinition[] = [
  {
    id: "daily_stability",
    label: "Daily stability",
    description: "Routines, organization, appointments, and day-to-day structure.",
    presets: [
      {
        id: "steadier_morning_routine",
        title: "Build a steadier morning routine",
        nextSteps: [
          "Choose one regular wake-up time",
          "Prepare tomorrow's items the night before",
          "Write a simple three-step morning checklist",
          "Complete one morning task before checking my phone",
          otherStep,
        ],
      },
      {
        id: "organized_living_space",
        title: "Keep my living space more organized",
        nextSteps: [
          "Choose one small area to organize",
          "Put away five items",
          "Create one place for important papers",
          "Set a ten-minute cleanup timer",
          otherStep,
        ],
      },
      {
        id: "weekly_planning",
        title: "Improve my weekly planning",
        nextSteps: [
          "Review the week ahead",
          "Write down three important tasks",
          "Add one appointment to my calendar",
          "Choose one day for errands",
          otherStep,
        ],
      },
      {
        id: "appointments_and_tasks",
        title: "Complete important appointments and tasks",
        nextSteps: [
          "Make one appointment",
          "Confirm an upcoming appointment",
          "Gather the documents I need",
          "Write down the next deadline",
          otherStep,
        ],
      },
      {
        id: "healthier_sleep_routine",
        title: "Create a healthier sleep routine",
        nextSteps: [
          "Choose a regular bedtime",
          "Reduce screen use before bed",
          "Prepare for tomorrow before bedtime",
          "Create a short wind-down routine",
          otherStep,
        ],
      },
    ],
  },
  {
    id: "money_budgeting",
    label: "Money and budgeting",
    description: "Understanding spending, planning, saving, and preparing for bills.",
    presets: [
      {
        id: "understand_spending",
        title: "Understand where my money is going",
        nextSteps: [
          "Review one week of spending",
          "List my essential expenses",
          "Identify one spending pattern",
          "Compare planned and actual spending",
          otherStep,
        ],
      },
      {
        id: "weekly_spending_plan",
        title: "Build a weekly spending plan",
        nextSteps: [
          "List this week's available money",
          "Write down essential expenses",
          "Set an amount for food and transportation",
          "Leave room for one flexible expense",
          otherStep,
        ],
      },
      {
        id: "save_for_something",
        title: "Save toward something important",
        nextSteps: [
          "Name what I am saving for",
          "Choose a first savings amount",
          "Set aside a small amount this week",
          "Decide where the savings will be kept",
          otherStep,
        ],
      },
      {
        id: "catch_up_expense",
        title: "Catch up on an important expense",
        nextSteps: [
          "Confirm the current amount due",
          "Review the payment options",
          "Choose a realistic first payment",
          "Write down the next due date",
          otherStep,
        ],
      },
      {
        id: "reduce_spending",
        title: "Reduce unnecessary spending",
        nextSteps: [
          "Identify one expense to reduce",
          "Pause one nonessential purchase",
          "Compare prices before buying",
          "Set a weekly discretionary limit",
          otherStep,
        ],
      },
      {
        id: "prepare_for_bill",
        title: "Prepare for an upcoming bill",
        nextSteps: [
          "Confirm the due date",
          "Confirm the expected amount",
          "Decide how much to set aside this week",
          "Add the bill to my plan",
          otherStep,
        ],
      },
    ],
  },
  {
    id: "health_wellness",
    label: "Health and wellness",
    description: "Sleep, movement, appointments, eating routines, and emotional wellness.",
    presets: [
      {
        id: "improve_sleep",
        title: "Improve my sleep",
        nextSteps: [
          "Choose a regular bedtime",
          "Reduce screen use before bed",
          "Prepare my sleeping space",
          "Discuss sleep concerns with an appropriate provider",
          otherStep,
        ],
      },
      {
        id: "physical_activity",
        title: "Become more physically active",
        nextSteps: [
          "Take a short walk",
          "Choose one activity I enjoy",
          "Schedule one active period this week",
          "Track one day of movement",
          otherStep,
        ],
      },
      {
        id: "medical_appointments",
        title: "Keep up with medical appointments",
        nextSteps: [
          "Confirm my next appointment",
          "Add the appointment to my calendar",
          "Gather questions for my doctor or medical provider",
          "Arrange transportation",
          otherStep,
        ],
      },
      {
        id: "eating_routine",
        title: "Improve my eating routine",
        nextSteps: [
          "Plan one balanced meal",
          "Make a short grocery list",
          "Choose one regular meal time",
          "Prepare one food item in advance",
          otherStep,
        ],
      },
      {
        id: "emotional_wellness",
        title: "Make time for emotional wellness",
        nextSteps: [
          "Choose one calming activity",
          "Take ten quiet minutes",
          "Write down what has been weighing on me",
          "Reach out to a supportive person",
          otherStep,
        ],
      },
      {
        id: "healthy_coping_skill",
        title: "Practice a healthy coping skill",
        nextSteps: [
          "Choose one coping skill to practice",
          "Use the skill once today",
          "Write down when the skill might help",
          "Ask someone supportive for ideas",
          otherStep,
        ],
      },
    ],
  },
  {
    id: "relationships_support",
    label: "Relationships and support",
    description: "Communication, connection, support networks, and healthy boundaries.",
    presets: [
      {
        id: "supportive_relationship",
        title: "Strengthen a supportive relationship",
        nextSteps: [
          "Reach out to the person",
          "Plan a short conversation",
          "Share one honest update",
          "Ask how we can stay connected",
          otherStep,
        ],
      },
      {
        id: "ask_for_help",
        title: "Ask for help when I need it",
        nextSteps: [
          "Name the help I need",
          "Choose one person to ask",
          "Write or practice what I want to say",
          "Make one request",
          otherStep,
        ],
      },
      {
        id: "improve_communication",
        title: "Improve communication with someone important",
        nextSteps: [
          "Choose one topic to discuss",
          "Write down what I want the person to understand",
          "Pick a calm time to talk",
          "Practice using clear and respectful language",
          otherStep,
        ],
      },
      {
        id: "support_network",
        title: "Build a stronger support network",
        nextSteps: [
          "Identify one positive person",
          "Attend one supportive activity",
          "Save one contact number",
          "Introduce myself to one new support",
          otherStep,
        ],
      },
      {
        id: "healthy_boundary",
        title: "Set a healthy boundary",
        nextSteps: [
          "Name the boundary I need",
          "Write one clear sentence",
          "Choose when to communicate it",
          "Ask a supportive person to help me practice",
          otherStep,
        ],
      },
      {
        id: "reconnect_positive_person",
        title: "Reconnect with a positive person",
        nextSteps: [
          "Send a short message",
          "Make one phone call",
          "Suggest a simple time to connect",
          "Share one positive update",
          otherStep,
        ],
      },
    ],
  },
  {
    id: "work_education",
    label: "Work and education",
    description: "Employment, resumes, interviews, applications, training, and routines.",
    presets: [
      {
        id: "find_employment",
        title: "Find employment",
        nextSteps: [
          "Update my resume",
          "Identify three places to apply",
          "Complete one application",
          "Ask someone to review my resume",
          "Prepare answers for common interview questions",
          otherStep,
        ],
      },
      {
        id: "improve_resume",
        title: "Improve my resume",
        nextSteps: [
          "Add my most recent experience",
          "Review my contact information",
          "Improve one job description",
          "Ask someone to proofread it",
          otherStep,
        ],
      },
      {
        id: "prepare_interview",
        title: "Prepare for an interview",
        nextSteps: [
          "Review common interview questions",
          "Choose appropriate clothing",
          "Practice one answer",
          "Confirm the interview time and location",
          otherStep,
        ],
      },
      {
        id: "job_application",
        title: "Complete a job application",
        nextSteps: [
          "Gather my work history",
          "Choose one job opening",
          "Complete the first section",
          "Submit one application",
          otherStep,
        ],
      },
      {
        id: "training_education",
        title: "Explore training or education",
        nextSteps: [
          "Identify one program",
          "Review the admission requirements",
          "Find the cost or funding options",
          "Contact the program for information",
          otherStep,
        ],
      },
      {
        id: "work_routine",
        title: "Build a dependable work routine",
        nextSteps: [
          "Choose a regular wake-up time",
          "Plan transportation",
          "Prepare work items the night before",
          "Write down my weekly schedule",
          otherStep,
        ],
      },
    ],
  },
  {
    id: "personal_growth",
    label: "Personal growth",
    description: "Confidence, consistency, decisions, skills, and independence.",
    presets: [
      {
        id: "build_confidence",
        title: "Build more confidence",
        nextSteps: [
          "Name one thing I handled well",
          "Complete one task I have been avoiding",
          "Practice one encouraging statement",
          "Ask someone I trust for feedback",
          otherStep,
        ],
      },
      {
        id: "become_consistent",
        title: "Become more consistent",
        nextSteps: [
          "Choose one small daily action",
          "Pick a regular time",
          "Track the action for three days",
          "Remove one obstacle",
          otherStep,
        ],
      },
      {
        id: "stop_avoiding",
        title: "Work on something I have been avoiding",
        nextSteps: [
          "Name the first small part",
          "Spend ten minutes on it",
          "Gather what I need",
          "Ask for help with one part",
          otherStep,
        ],
      },
      {
        id: "healthier_decisions",
        title: "Practice making healthier decisions",
        nextSteps: [
          "Pause before one decision",
          "Write down two options",
          "Ask how each option may affect tomorrow",
          "Talk through one choice with a supportive person",
          otherStep,
        ],
      },
      {
        id: "new_skill",
        title: "Develop a new skill",
        nextSteps: [
          "Choose the skill",
          "Find one beginner resource",
          "Practice for ten minutes",
          "Ask someone experienced for guidance",
          otherStep,
        ],
      },
      {
        id: "greater_independence",
        title: "Make progress toward greater independence",
        nextSteps: [
          "Choose one responsibility to practice",
          "Complete one task on my own",
          "Make one important phone call",
          "Learn one step in a process I rely on",
          otherStep,
        ],
      },
    ],
  },
  {
    id: "other",
    label: "Other",
    description: "Write a Goal in your own words.",
    presets: [],
  },
];

export function getGoalArea(areaId: string) {
  return goalAreas.find((area) => area.id === areaId) ?? null;
}

export function getGoalPreset(areaId: string, presetId: string) {
  return getGoalArea(areaId)?.presets.find((preset) => preset.id === presetId) ?? null;
}
