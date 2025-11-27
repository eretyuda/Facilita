-- ============================================
-- HABILITAR REALTIME PARA TABELA BANKS
-- Execute no SQL Editor do Supabase
-- ============================================

-- 1. Habilitar Realtime na tabela banks
ALTER PUBLICATION supabase_realtime ADD TABLE banks;

-- 2. Verificar se está habilitado
SELECT 
    schemaname,
    tablename,
    pubname
FROM pg_publication_tables
WHERE tablename = 'banks';

-- 3. Também habilitar para products (se ainda não estiver)
ALTER PUBLICATION supabase_realtime ADD TABLE products;

-- 4. Verificar todas as tabelas com realtime habilitado
SELECT 
    schemaname,
    tablename,
    pubname
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- NOTA: Se receber erro "relation already exists in publication",
-- significa que já está habilitado (isso é bom!)
