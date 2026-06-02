
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('room-images', 'room-images', true, 5242880, ARRAY['image/png','image/jpeg','image/jpg','image/webp','image/gif'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880, allowed_mime_types = ARRAY['image/png','image/jpeg','image/jpg','image/webp','image/gif'];

CREATE POLICY "Public read room images"
ON storage.objects FOR SELECT
USING (bucket_id = 'room-images');

CREATE POLICY "Public upload room images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'room-images');

CREATE POLICY "Public delete room images"
ON storage.objects FOR DELETE
USING (bucket_id = 'room-images');
