
-- Function to notify all users when a resource is published
CREATE OR REPLACE FUNCTION public.notify_on_resource_publish()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  profile_record RECORD;
BEGIN
  -- Only fire when is_published changes to true (new publish or re-publish)
  IF (TG_OP = 'INSERT' AND NEW.is_published = true AND NEW.is_deleted = false)
     OR (TG_OP = 'UPDATE' AND NEW.is_published = true AND OLD.is_published = false AND NEW.is_deleted = false) THEN
    FOR profile_record IN SELECT user_id FROM public.profiles LOOP
      INSERT INTO public.notifications (user_id, title, message)
      VALUES (
        profile_record.user_id,
        'New Resource Published',
        'A new resource "' || NEW.title || '" has been published in ' || NEW.category || '.'
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger on resources table
CREATE TRIGGER notify_resource_published
AFTER INSERT OR UPDATE ON public.resources
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_resource_publish();
