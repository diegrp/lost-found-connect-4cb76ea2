-- Corrigir função para incluir search_path
CREATE OR REPLACE FUNCTION delete_found_item_on_reject()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o status mudou para 'rejected', excluir o item encontrado
  IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    DELETE FROM items WHERE id = NEW.found_item_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;