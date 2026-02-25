
-- Audit logs table
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Resource versions table
CREATE TABLE public.resource_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  file_url text,
  file_name text,
  file_size bigint,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.resource_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage resource versions"
  ON public.resource_versions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users view resource versions"
  ON public.resource_versions FOR SELECT
  USING (true);

-- Add soft delete and visibility columns to resources
ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS file_name text,
  ADD COLUMN IF NOT EXISTS file_size bigint;

-- Site settings table  
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins manage site settings"
  ON public.site_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert default settings
INSERT INTO public.site_settings (key, value) VALUES
  ('branding', '{"site_name": "HartLong", "tagline": "Decode the Market", "logo_url": null}'::jsonb),
  ('theme', '{"primary_color": "#22c55e", "accent_color": "#eab308"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Storage bucket for resource files
INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for resources bucket
CREATE POLICY "Admins upload resources"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'resources' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update resources"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'resources' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete resources"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'resources' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read resources"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resources');
