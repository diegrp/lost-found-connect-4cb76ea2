-- Criar profiles para usuários existentes que não têm profile
INSERT INTO public.profiles (id, full_name)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'fullName', email)
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- Verificar se o trigger existe e recriá-lo se necessário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recriar a função do trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'fullName', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();