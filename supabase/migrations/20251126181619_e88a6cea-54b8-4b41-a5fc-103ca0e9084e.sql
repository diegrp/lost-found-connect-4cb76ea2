-- Adicionar política RLS para permitir que usuários atualizem matches dos seus itens
CREATE POLICY "Users can update matches for their items"
ON matches
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM items
    WHERE (items.id = matches.lost_item_id OR items.id = matches.found_item_id)
    AND items.user_id = auth.uid()
  )
);