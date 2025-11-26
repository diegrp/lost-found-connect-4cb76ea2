-- Criar função que exclui item encontrado quando correspondência for rejeitada
CREATE OR REPLACE FUNCTION delete_found_item_on_reject()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o status mudou para 'rejected', excluir o item encontrado
  IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    DELETE FROM items WHERE id = NEW.found_item_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger que executa após atualização na tabela matches
CREATE TRIGGER trigger_delete_found_item_on_reject
AFTER UPDATE ON matches
FOR EACH ROW
EXECUTE FUNCTION delete_found_item_on_reject();