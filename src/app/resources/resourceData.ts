import { supabase } from "@/lib/supabaseClient";

export const resourceCategories = [
  { id: "food_basic_needs", label: "Food & basic needs" },
  { id: "identification_documents", label: "Identification & documents" },
  { id: "recovery_community_support", label: "Recovery & community support" },
  { id: "employment_education", label: "Employment & education" },
  { id: "transportation", label: "Transportation" },
  { id: "housing_information", label: "Housing information" },
  { id: "health_wellness_navigation", label: "Health & wellness navigation" },
  { id: "financial_education", label: "Financial education" },
  { id: "government_programs_benefits", label: "Government programs & benefits" },
  { id: "other_not_sure", label: "Other / not sure" },
] as const;

export type ResourceCategory = (typeof resourceCategories)[number]["id"];

export type ParticipantResource = {
  id: string;
  resource_name: string;
  resource_slug: string;
  category: ResourceCategory;
  subcategory: string | null;
  plain_language_purpose: string;
  participant_boundary_note: string | null;
  country_code: string | null;
  state_code: string | null;
  county_name: string | null;
  service_area_text: string | null;
  audience_text: string | null;
  status: string;
  primaryOrganization: ResourceOrganization | null;
};

export type ResourceOrganization = {
  id: string;
  organization_name: string;
  organization_type: string;
  official_website_url: string | null;
  country_code: string | null;
};

export type ResourceAccessPath = {
  id: string;
  resource_id: string;
  organization_id: string | null;
  path_type: string;
  label: string;
  plain_language_instruction: string | null;
  url: string | null;
  phone: string | null;
  email: string | null;
  locality_text: string | null;
  sort_order: number;
  is_primary: boolean;
  status: string;
};

export type ResourceGuidanceSection = {
  id: string;
  resource_id: string;
  section_type: string;
  heading: string;
  content: string;
  source_access_path_id: string | null;
  sort_order: number;
  status: string;
};

type ResourceRole = {
  resource_id: string;
  organization_id: string;
  role_type: string;
  is_primary: boolean;
};

export function categoryLabel(category: string) {
  return resourceCategories.find((item) => item.id === category)?.label ?? "Resource";
}

async function attachPrimaryOrganizations(rows: Omit<ParticipantResource, "primaryOrganization">[]) {
  if (rows.length === 0) return [] as ParticipantResource[];

  const resourceIds = rows.map((row) => row.id);
  const { data: roles, error: roleError } = await supabase
    .from("resource_organization_roles")
    .select("resource_id, organization_id, role_type, is_primary")
    .in("resource_id", resourceIds)
    .eq("status", "active");

  if (roleError) throw roleError;

  const typedRoles = (roles ?? []) as ResourceRole[];
  const authorityRoles = typedRoles.filter(
    (role) => role.role_type === "primary_authority" || role.is_primary,
  );
  const organizationIds = Array.from(new Set(authorityRoles.map((role) => role.organization_id)));

  if (organizationIds.length === 0) {
    return rows.map((row) => ({ ...row, primaryOrganization: null }));
  }

  const { data: organizations, error: organizationError } = await supabase
    .from("resource_organizations")
    .select("id, organization_name, organization_type, official_website_url, country_code")
    .in("id", organizationIds)
    .eq("status", "active");

  if (organizationError) throw organizationError;

  const organizationMap = new Map(
    ((organizations ?? []) as ResourceOrganization[]).map((organization) => [organization.id, organization]),
  );

  return rows.map((row) => {
    const primaryRole =
      authorityRoles.find((role) => role.resource_id === row.id && role.role_type === "primary_authority") ??
      authorityRoles.find((role) => role.resource_id === row.id && role.is_primary);

    return {
      ...row,
      primaryOrganization: primaryRole ? organizationMap.get(primaryRole.organization_id) ?? null : null,
    };
  });
}

export async function loadParticipantResources() {
  const { data, error } = await supabase
    .from("resources")
    .select(
      "id, resource_name, resource_slug, category, subcategory, plain_language_purpose, participant_boundary_note, country_code, state_code, county_name, service_area_text, audience_text, status",
    )
    .order("resource_name", { ascending: true });

  if (error) throw error;

  return attachPrimaryOrganizations(
    (data ?? []) as Omit<ParticipantResource, "primaryOrganization">[],
  );
}

export async function loadParticipantResourceDetail(slug: string) {
  const { data, error } = await supabase
    .from("resources")
    .select(
      "id, resource_name, resource_slug, category, subcategory, plain_language_purpose, participant_boundary_note, country_code, state_code, county_name, service_area_text, audience_text, status",
    )
    .eq("resource_slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const [resource] = await attachPrimaryOrganizations([
    data as Omit<ParticipantResource, "primaryOrganization">,
  ]);

  const [pathResult, guidanceResult] = await Promise.all([
    supabase
      .from("resource_access_paths")
      .select(
        "id, resource_id, organization_id, path_type, label, plain_language_instruction, url, phone, email, locality_text, sort_order, is_primary, status",
      )
      .eq("resource_id", resource.id)
      .eq("status", "active")
      .order("sort_order", { ascending: true }),
    supabase
      .from("resource_guidance_sections")
      .select("id, resource_id, section_type, heading, content, source_access_path_id, sort_order, status")
      .eq("resource_id", resource.id)
      .eq("status", "active")
      .order("sort_order", { ascending: true }),
  ]);

  if (pathResult.error) throw pathResult.error;
  if (guidanceResult.error) throw guidanceResult.error;

  return {
    resource,
    accessPaths: (pathResult.data ?? []) as ResourceAccessPath[],
    guidanceSections: (guidanceResult.data ?? []) as ResourceGuidanceSection[],
  };
}
