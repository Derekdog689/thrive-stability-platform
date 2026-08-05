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
    authUserId: "d48b7268-9aa6-4498-a923-2851fd5232c9",
    email: "dstein561+thrive-onboarding-person-d@gmail.com",
    workspaceId: "71000000-0000-4000-8000-000000000001",
    programId: "71000000-0000-4000-8000-000000000002",
    supportedPersonId: "71000000-0000-4000-8000-000000000009",
  },

  participantA: {
    label: "Participant A",
    authUserId: "9b283c6e-c2f8-4f87-9f90-fa081ee249bd",
    email: "dstein561+thrive-rls-person-a@gmail.com",
    workspaceId: "71000000-0000-4000-8000-000000000001",
    programId: "71000000-0000-4000-8000-000000000002",
    supportedPersonId: "71000000-0000-4000-8000-000000000003",
  },

  outsider: {
    label: "outsider",
    authUserId: "d89a6549-ac1a-431c-aff1-1ba7313175ab",
    email: "dstein561+thrive-rls-outsider@gmail.com",
  },

  activeSupportMember: {
    label: "active same-workspace support member",
    authUserId: "7f0a7540-7a6d-4a1a-a29f-7a26c9571db9",
    email: "dstein561+thrive-rls-support@gmail.com",
    workspaceId: "71000000-0000-4000-8000-000000000001",
    workspaceMemberId: "cca88550-bac5-49b2-92a6-d5d9e19dd8ea",
  },

  activeAdmin: {
    label: "active same-workspace admin",
    authUserId: "3c0300e6-c4e9-4a84-b668-4a7e39593162",
    email: "dstein561+thrive-rls-admin@gmail.com",
    workspaceId: "71000000-0000-4000-8000-000000000001",
    workspaceMemberId: "566f964c-9348-457f-88a6-d7e589250390",
  },

  inactiveSupportMember: {
    label: "inactive or removed support member",
    authUserId: "a3f99fb6-1642-413b-ae0e-595a9b91f8b2",
    email: "dstein561+thrive-rls-inactive-support@gmail.com",
    workspaceId: "71000000-0000-4000-8000-000000000001",
    workspaceMemberId: "bbe36c06-8856-485f-82ae-d48eb5eb9ded",
  },
};

export const supportLinkedRecords: SupportLinkedRecordConfig = {};
