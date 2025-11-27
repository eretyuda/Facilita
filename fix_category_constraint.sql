-- Remover a constraint antiga
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;

-- Adicionar a nova constraint aceitando 'Serviço' (com cedilha) e 'Servico' (sem cedilha) para compatibilidade
ALTER TABLE products ADD CONSTRAINT products_category_check CHECK (category IN ('Produto', 'Serviço', 'Servico'));
