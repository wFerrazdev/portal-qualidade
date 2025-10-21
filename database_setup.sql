-- ========================================
-- SCRIPT PARA CRIAÇÃO DA TABELA DE GESTÃO DE COMPRAS
-- Banco: Neon PostgreSQL
-- ========================================

-- Criar tabela para pedidos de compra
CREATE TABLE IF NOT EXISTS purchase_orders (
    id SERIAL PRIMARY KEY,
    numero INTEGER UNIQUE NOT NULL,
    descricao TEXT NOT NULL,
    fornecedor VARCHAR(255) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    observacoes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'AGUARDANDO_APROVACAO_SC',
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    criado_por VARCHAR(255),
    atualizado_por VARCHAR(255)
);

-- Criar tabela para histórico de status
CREATE TABLE IF NOT EXISTS purchase_order_history (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES purchase_orders(id) ON DELETE CASCADE,
    status_anterior VARCHAR(50),
    status_novo VARCHAR(50) NOT NULL,
    observacao TEXT,
    data_mudanca TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    usuario VARCHAR(255)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_numero ON purchase_orders(numero);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_data_criacao ON purchase_orders(data_criacao);
CREATE INDEX IF NOT EXISTS idx_purchase_order_history_order_id ON purchase_order_history(order_id);

-- Inserir dados de exemplo (opcional)
INSERT INTO purchase_orders (numero, descricao, fornecedor, valor, observacoes, status, criado_por) VALUES
(1001, 'Equipamentos de laboratório', 'LabTech Solutions', 15000.00, 'Equipamentos para novo laboratório', 'AGUARDANDO_APROVACAO_SC', 'Sistema'),
(1002, 'Material de consumo', 'SupplyCorp', 2500.00, 'Material para testes de qualidade', 'SC_APROVADA', 'Sistema')
ON CONFLICT (numero) DO NOTHING;

-- Inserir histórico para os dados de exemplo
INSERT INTO purchase_order_history (order_id, status_anterior, status_novo, observacao, usuario) VALUES
((SELECT id FROM purchase_orders WHERE numero = 1001), NULL, 'AGUARDANDO_APROVACAO_SC', 'Solicitação de compra criada pelo setor de Qualidade', 'Sistema'),
((SELECT id FROM purchase_orders WHERE numero = 1002), NULL, 'AGUARDANDO_APROVACAO_SC', 'Solicitação de compra criada pelo setor de Qualidade', 'Sistema'),
((SELECT id FROM purchase_orders WHERE numero = 1002), 'AGUARDANDO_APROVACAO_SC', 'SC_APROVADA', 'Aprovado pelo Supervisor de Compras', 'Sistema')
ON CONFLICT DO NOTHING;

-- ========================================
-- FUNÇÕES AUXILIARES
-- ========================================

-- Função para atualizar data_atualizacao automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar data_atualizacao
CREATE TRIGGER update_purchase_orders_updated_at 
    BEFORE UPDATE ON purchase_orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- VIEWS ÚTEIS
-- ========================================

-- View para pedidos com histórico completo
CREATE OR REPLACE VIEW purchase_orders_with_history AS
SELECT 
    po.*,
    poh.status_novo as ultimo_status,
    poh.data_mudanca as ultima_atualizacao,
    poh.usuario as ultimo_usuario
FROM purchase_orders po
LEFT JOIN LATERAL (
    SELECT status_novo, data_mudanca, usuario
    FROM purchase_order_history 
    WHERE order_id = po.id 
    ORDER BY data_mudanca DESC 
    LIMIT 1
) poh ON true;

-- ========================================
-- COMENTÁRIOS DAS TABELAS
-- ========================================

COMMENT ON TABLE purchase_orders IS 'Tabela principal para pedidos de compra';
COMMENT ON TABLE purchase_order_history IS 'Histórico de mudanças de status dos pedidos';

COMMENT ON COLUMN purchase_orders.numero IS 'Número único do pedido';
COMMENT ON COLUMN purchase_orders.descricao IS 'Descrição do item/serviço solicitado';
COMMENT ON COLUMN purchase_orders.fornecedor IS 'Nome do fornecedor';
COMMENT ON COLUMN purchase_orders.valor IS 'Valor estimado em reais';
COMMENT ON COLUMN purchase_orders.status IS 'Status atual do pedido';
COMMENT ON COLUMN purchase_orders.criado_por IS 'Usuário que criou o pedido';
COMMENT ON COLUMN purchase_orders.atualizado_por IS 'Usuário que fez a última atualização';

COMMENT ON COLUMN purchase_order_history.status_anterior IS 'Status anterior da mudança';
COMMENT ON COLUMN purchase_order_history.status_novo IS 'Novo status após a mudança';
COMMENT ON COLUMN purchase_order_history.observacao IS 'Observação sobre a mudança de status';
COMMENT ON COLUMN purchase_order_history.usuario IS 'Usuário responsável pela mudança';
