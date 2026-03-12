-- Allow authenticated users to insert their own akun_kontraktor record
CREATE POLICY "Users can insert their own akun"
ON public.akun_kontraktor
FOR INSERT
WITH CHECK (auth.uid() = user_id);