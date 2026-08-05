export const SUPPORT_TEST_EXECUTION_ENABLED = false as const;

export type ParticipantActorConfig = {
  label: "Participant D" | "Participant A";
  authUserId: string;
  email: string;
  workspaceId: string;
  programId: string;
  supportedPersonId: string;
};

export type ReviewerActorConfig = {
  label:
    | "active same-workspace support member"
    | "active same-workspace admin"
    | "inactive or removed support member";
  authUserId: string;
  email: string;
  workspaceId: string;
  workspaceMemberId: string;
};

export type OutsiderActorConfig = {
  label: "outsider";
  authUserId: string;
  email: string;
};

export type SupportTestActorConfig = {
  participantD: ParticipantActorConfig;
  participantA: ParticipantActorConfig;
  outsider: OutsiderActorConfig;
  activeSupportMember: ReviewerActorConfig;
  activeAdmin: ReviewerActorConfig;
  inactiveSupportMember: ReviewerActorConfig;
};

export type SupportLinkedRecordConfig = {
  goalId?: string;
  wellnessCheckinId?: string;
  budgetCategoryId?: string;
  budgetPeriodId?: string;
  stagedTransactionId?: string;
  completedPriorSupportRequestId?: string;
};

/**
 * Review-only empty template.
 *
 * Do not store passwords, service-role keys, access tokens, or real Johnny data
 * in this file. Fill only with separately approved synthetic actor IDs.
 */
export const supportTestActors: SupportTestActorConfig = {
  participantD: {
    label: "Participant D",
    authUserId: "",
    email: "",
    workspaceId: "",
    programId: "",
    supportedPersonId: "",
  },
  participantA: {
    label: "Participant A",
    authUserId: "",
    email: "",
    workspaceId: "",
    programId: "",
    supportedPersonId: "",
  },
  outsider: {
    label: "outsider",
    authUserId: "",
    email: "",
  },
  activeSupportMember: {
    label: "active same-workspace support member",
    authUserId: "",
    email: "",
    workspaceId: "",
    workspaceMemberId: "",
  },
  activeAdmin: {
    label: "active same-workspace admin",
    authUserId: "",
    email: "",
    workspaceId: "",
    workspaceMemberId: "",
  },
  inactiveSupportMember: {
    label: "inactive or removed support member",
    authUserId: "",
    email: "",
    workspaceId: "",
    workspaceMemberId: "",
  },
};

export const supportLinkedRecords: SupportLinkedRecordConfig = {};
