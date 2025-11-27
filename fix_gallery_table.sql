-- 1. Criar a tabela product_gallery se não existir
CREATE TABLE IF NOT EXISTS product_gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Desabilitar RLS para garantir que as imagens sejam salvas sem problemas de permissão
ALTER TABLE product_gallery DISABLE ROW LEVEL SECURITY;

-- 3. Garantir que a tabela products também tenha RLS desativado (para evitar problemas em cascata)
-- ALTER TABLE products DISABLE ROW LEVEL SECURITY; -- Opcional, se já não tiver sido feito
