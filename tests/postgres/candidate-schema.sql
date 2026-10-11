\set ON_ERROR_STOP on
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;
CREATE TABLE public.workspaces(id uuid PRIMARY KEY);
CREATE TABLE public.support_requests(id uuid PRIMARY KEY, workspace_id uuid NOT NULL REFERENCES public.workspaces(id), UNIQUE(id,workspace_id));
CREATE TABLE public.support_request_entries(id uuid PRIMARY KEY, support_request_id uuid NOT NULL, workspace_id uuid NOT NULL, entry_type text NOT NULL CHECK (entry_type IN ('participant_reply','internal_note')), FOREIGN KEY(support_request_id,workspace_id) REFERENCES public.support_requests(id,workspace_id));
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_requests FORCE ROW LEVEL SECURITY;
ALTER TABLE public.support_request_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_request_entries FORCE ROW LEVEL SECURITY;
INSERT INTO public.workspaces VALUES ('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222');
