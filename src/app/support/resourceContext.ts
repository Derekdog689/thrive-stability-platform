import { supabase } from "@/lib/supabaseClient";
import {
  loadParticipantResourceDetail,
  ParticipantResource,
  ResourceAccessPath,
} from "../resources/resourceData";
import type { ParticipantSupportRequest } from "./useParticipantSupport";

export type SupportResourceContext = {
  resourceId: string;
  resourceSlug: string;
  resourceName: string;
  organizationName: string | null;
  accessPathId: string | null;
  accessPathLabel: string | null;
};

export type SupportResourceContextValidation =
  | { ok: true; context: SupportResourceContext }
  | { ok: false; message: string };

export type SupportResourceAttachResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

function toContext(
  resource: ParticipantResource,
  accessPath: ResourceAccessPath | null,
): SupportResourceContext {
  return {
    resourceId: resource.id,
    resourceSlug: resource.resource_slug,
    resourceName: resource.resource_name,
    organizationName: resource.primaryOrganization?.organization_name ?? null,
    accessPathId: accessPath?.id ?? null,
    accessPathLabel: accessPath?.label ?? null,
  };
}

export async function validateSupportResourceContext(
  resourceSlug: string,
  accessPathId: string | null,
): Promise<SupportResourceContextValidation> {
  const detail = await loadParticipantResourceDetail(resourceSlug);

  if (!detail) {
    return {
      ok: false,
      message:
        "That Resource is not available to attach right now. You can still ask Support in your own words.",
    };
  }

  if (!accessPathId) {
    const primaryPath =
      detail.accessPaths.find((path) => path.is_primary) ??
      detail.accessPaths[0] ??
      null;

    return {
      ok: true,
      context: toContext(detail.resource, primaryPath),
    };
  }

  const matchingPath =
    detail.accessPaths.find((path) => path.id === accessPathId) ?? null;

  if (!matchingPath) {
    return {
      ok: false,
      message:
        "That Resource starting point is not available to attach right now. You can still ask Support in your own words.",
    };
  }

  return {
    ok: true,
    context: toContext(detail.resource, matchingPath),
  };
}

export async function attachResourceContextToSupportRequest(
  request: ParticipantSupportRequest,
  context: SupportResourceContext,
): Promise<SupportResourceAttachResult> {
  const sessionResult = await supabase.auth.getSession();
  const user = sessionResult.data.session?.user ?? null;

  if (sessionResult.error || !user) {
    return {
      ok: false,
      message:
        "Your Support request was sent, but the Resource context could not be attached. Support will still receive the words you submitted.",
    };
  }

  const payload = {
    workspace_id: request.workspace_id,
    program_id: request.program_id,
    supported_person_id: request.supported_person_id,
    support_request_id: request.id,
    resource_id: context.resourceId,
    resource_access_path_id: context.accessPathId,
    created_by: user.id,
  };

  const result = await supabase
    .from("support_request_links")
    .insert(payload)
    .select("id")
    .single();

  if (result.error) {
    return {
      ok: false,
      message:
        "Your Support request was sent, but the Resource context could not be attached. Support will still receive the words you submitted.",
    };
  }

  return {
    ok: true,
    message:
      "Your Support request was received, and the Resource you selected was attached for context.",
  };
}
