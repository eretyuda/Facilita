-- Script para garantir que a coluna is_bank existe e está configurada corretamente

-- 1. Adicionar coluna is_bank se não existir
ALTER TABLE banks ADD COLUMN IF NOT EXISTS is_bank BOOLEAN DEFAULT FALSE;

-- 2. Atualizar bancos conhecidos existentes
UPDATE banks SET is_bank = TRUE 
WHERE name IN ('BAI', 'BFA', 'BIC', 'Banco BIC', 'Banco Sol', 'Atlantico', 'Atlântico')
AND (is_bank IS NULL OR is_bank = FALSE);

-- 3. Verificar o resultado
SELECT id, name, is_bank, type FROM banks ORDER BY is_bank DESC, name;
