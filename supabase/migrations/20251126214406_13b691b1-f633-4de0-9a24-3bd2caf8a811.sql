-- Remove a foreign key incorreta que referencia auth.users
ALTER TABLE public.items DROP CONSTRAINT IF EXISTS items_user_id_fkey;

-- Adiciona a foreign key correta referenciando profiles
ALTER TABLE public.items 
ADD CONSTRAINT items_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;