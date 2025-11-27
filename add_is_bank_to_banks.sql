-- Adicionar coluna is_bank na tabela banks
ALTER TABLE banks ADD COLUMN IF NOT EXISTS is_bank BOOLEAN DEFAULT FALSE;

-- Atualizar registros existentes (opcional, mas recomendado para consistência)
-- Define como TRUE para bancos conhecidos se necessário, ou deixa como FALSE por padrão
UPDATE banks SET is_bank = TRUE WHERE name IN ('BAI', 'BFA', 'BIC', 'Banco Sol', 'Atlantico');
