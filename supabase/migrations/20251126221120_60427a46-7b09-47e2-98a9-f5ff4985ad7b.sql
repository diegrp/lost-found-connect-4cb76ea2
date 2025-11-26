-- Add quantity field to items table
ALTER TABLE public.items 
ADD COLUMN quantity integer NOT NULL DEFAULT 1;

-- Add check constraint to ensure quantity is positive
ALTER TABLE public.items 
ADD CONSTRAINT items_quantity_positive CHECK (quantity > 0);