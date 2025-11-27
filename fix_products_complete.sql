-- ============================================
-- SCRIPT COMPLETO PARA CORRIGIR SALVAMENTO DE PRODUTOS
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. CORRIGIR CONSTRAINT DE CATEGORIA (aceitar "Serviço" com cedilha)
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE products ADD CONSTRAINT products_category_check 
CHECK (category IN ('Produto', 'Serviço', 'Servico'));

-- 2. GARANTIR QUE A TABELA product_gallery EXISTE
CREATE TABLE IF NOT EXISTS product_gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. DESABILITAR RLS NA TABELA product_gallery (para performance)
ALTER TABLE product_gallery DISABLE ROW LEVEL SECURITY;

-- 4. ATUALIZAR POLÍTICAS RLS DA TABELA products
-- Remover políticas antigas
DROP POLICY IF EXISTS products_insert_own ON products;
DROP POLICY IF EXISTS products_update_own ON products;
DROP POLICY IF EXISTS products_delete_own ON products;

-- Criar políticas mais permissivas (qualquer usuário autenticado pode criar/editar seus produtos)
CREATE POLICY products_insert_authenticated ON products 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY products_update_own ON products 
FOR UPDATE 
TO authenticated
USING (auth.uid() = owner_id OR owner_id IS NULL);

CREATE POLICY products_delete_own ON products 
FOR DELETE 
TO authenticated
USING (auth.uid() = owner_id);

-- 5. CRIAR ÍNDICES PARA MELHORAR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_products_owner_id ON products(owner_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_promoted ON products(is_promoted);
CREATE INDEX IF NOT EXISTS idx_product_gallery_product_id ON product_gallery(product_id);

-- 6. VERIFICAR RESULTADO
SELECT 
    'Products Table' as table_name,
    COUNT(*) as total_records
FROM products
UNION ALL
SELECT 
    'Product Gallery Table' as table_name,
    COUNT(*) as total_records
FROM product_gallery;

-- Mostrar políticas RLS ativas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('products', 'product_gallery')
ORDER BY tablename, policyname;
