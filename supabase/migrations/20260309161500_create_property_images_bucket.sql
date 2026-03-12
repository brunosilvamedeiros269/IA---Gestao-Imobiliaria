-- Create a new storage bucket for property images
insert into storage.buckets (id, name, public)
values ('property_images', 'property_images', true);

-- Policy to allow anyone to read property images
create policy "Public Access"
on storage.objects for select
to public
using ( bucket_id = 'property_images' );

-- Policy to allow authenticated users to upload their own images
create policy "Brokers can upload images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'property_images' AND
  auth.uid() = owner
);

-- Policy to allow authenticated users to update their own images
create policy "Brokers can update their images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'property_images' AND
  auth.uid() = owner
);

-- Policy to allow authenticated users to delete their own images
create policy "Brokers can delete their images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'property_images' AND
  auth.uid() = owner
);
