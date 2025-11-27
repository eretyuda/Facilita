-- =============================================
-- FACILITA - SCHEMA SQL PARA SUPABASE
-- =============================================

-- 1. TABELA DE UTILIZADORES (USERS)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    is_business BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    is_bank BOOLEAN DEFAULT FALSE,
    nif VARCHAR(50),
    plan VARCHAR(50) DEFAULT 'Gratuito',
    max_products INTEGER,
    max_highlights INTEGER,
    profile_image TEXT,
    cover_image TEXT,
    address TEXT,
    province VARCHAR(100),
    municipality VARCHAR(100),
    wallet_balance DECIMAL(15, 2) DEFAULT 0.00,
    topup_balance DECIMAL(15, 2) DEFAULT 0.00,
    account_status VARCHAR(20) DEFAULT 'Active' CHECK (account_status IN ('Active', 'Blocked', 'Pending')),
    notifications_enabled BOOLEAN DEFAULT TRUE,
    allow_messages BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_business ON users(is_business);

-- 2. TABELA DE DETALHES BANCARIOS DOS UTILIZADORES
CREATE TABLE IF NOT EXISTS user_bank_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bank_name VARCHAR(255) NOT NULL,
    iban VARCHAR(50) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    beneficiary_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. TABELA DE BANCOS E EMPRESAS
CREATE TABLE IF NOT EXISTS banks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    logo TEXT,
    cover_image TEXT,
    description TEXT,
    followers INTEGER DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    phone VARCHAR(50),
    email VARCHAR(255),
    nif VARCHAR(50),
    address TEXT,
    province VARCHAR(100),
    municipality VARCHAR(100),
    parent_id UUID REFERENCES banks(id) ON DELETE CASCADE,
    is_bank BOOLEAN DEFAULT FALSE,
    type VARCHAR(10) CHECK (type IN ('HQ', 'BRANCH')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_banks_name ON banks(name);
CREATE INDEX idx_banks_type ON banks(type);

-- 4. TABELA DE ATMs
CREATE TABLE IF NOT EXISTS atms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    bank VARCHAR(50) NOT NULL CHECK (bank IN ('BAI', 'BFA', 'BIC', 'Banco Sol', 'Atlantico')),
    address TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Online', 'Offline', 'Sem Dinheiro', 'Tem Dinheiro')),
    distance VARCHAR(50),
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_atms_bank ON atms(bank);
CREATE INDEX idx_atms_status ON atms(status);

-- 5. TABELA DE PRODUTOS E SERVICOS
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    image TEXT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('Produto', 'Servico')),
    is_promoted BOOLEAN DEFAULT FALSE,
    bank_id UUID REFERENCES banks(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_products_owner_id ON products(owner_id);
CREATE INDEX idx_products_category ON products(category);

-- 6. TABELA DE GALERIA DE IMAGENS DOS PRODUTOS
CREATE TABLE IF NOT EXISTS product_gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABELA DE PLANOS
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL UNIQUE,
    price DECIMAL(15, 2) NOT NULL,
    color VARCHAR(100),
    max_products INTEGER NOT NULL,
    max_highlights INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABELA DE CARACTERISTICAS DOS PLANOS
CREATE TABLE IF NOT EXISTS plan_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    feature_description TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

-- 9. TABELA DE TRANSACOES
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(50),
    product_name VARCHAR(255),
    amount DECIMAL(15, 2) NOT NULL,
    date DATE NOT NULL,
    timestamp BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Pendente', 'Aprovado', 'Rejeitado')),
    method VARCHAR(20) NOT NULL CHECK (method IN ('Multicaixa', 'Visa', 'Carteira', 'Transferencia', 'Referencia')),
    category VARCHAR(20) NOT NULL CHECK (category IN ('PURCHASE', 'SALE', 'DEPOSIT', 'WITHDRAWAL', 'PLAN_PAYMENT')),
    reference VARCHAR(50) NOT NULL,
    other_party_name VARCHAR(255),
    proof_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);

-- 10. TABELA DE MENSAGENS
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_name VARCHAR(255) NOT NULL,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255),
    content TEXT NOT NULL,
    timestamp BIGINT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_from_business BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);

-- 11. TABELA DE ANEXOS DAS MENSAGENS
CREATE TABLE IF NOT EXISTS message_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('image', 'document')),
    url TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. TABELA DE NOTIFICACOES
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    timestamp BIGINT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('message', 'promo', 'alert', 'success', 'info')),
    related_entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- 13. TABELA DE FAVORITOS
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- 14. TABELA DE SEGUIDORES
CREATE TABLE IF NOT EXISTS following (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, company_id)
);

-- 15. TABELA DE GATEWAYS DE PAGAMENTO
CREATE TABLE IF NOT EXISTS payment_gateways (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    api_key TEXT,
    api_secret TEXT,
    environment VARCHAR(20) NOT NULL CHECK (environment IN ('Sandbox', 'Production')),
    is_active BOOLEAN DEFAULT TRUE,
    supports_references BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. TABELA DE CONTAS BANCARIAS DA PLATAFORMA
CREATE TABLE IF NOT EXISTS platform_bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_name VARCHAR(255) NOT NULL,
    iban VARCHAR(50) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    holder_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. TABELA DE PEDIDOS DE LEVANTAMENTO
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    request_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Pendente', 'Processado', 'Rejeitado')),
    bank_details TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. TABELA DE VOTOS EM ATMs
CREATE TABLE IF NOT EXISTS atm_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    atm_id UUID NOT NULL REFERENCES atms(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, atm_id)
);

-- TRIGGERS PARA ATUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banks_updated_at BEFORE UPDATE ON banks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_atms_updated_at BEFORE UPDATE ON atms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- POLITICAS RLS (ROW LEVEL SECURITY)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_view_own ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY products_view_all ON products FOR SELECT USING (true);
CREATE POLICY products_insert_own ON products FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY products_update_own ON products FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY transactions_view_own ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY messages_view_own ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
