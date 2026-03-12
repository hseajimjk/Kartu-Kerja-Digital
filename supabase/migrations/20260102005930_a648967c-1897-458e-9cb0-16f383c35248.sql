-- Add policy to allow public read for kontraktors (needed for registration)
CREATE POLICY "Public can read kontraktors for registration"
ON public.kontraktors
FOR SELECT
USING (true);

-- Update existing policy to be permissive
DROP POLICY IF EXISTS "Authenticated can read kontraktors" ON public.kontraktors;