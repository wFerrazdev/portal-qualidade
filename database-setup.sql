-- =============================================
-- SISTEMA DE COMPRAS - SETUP COMPLETO
-- =============================================

-- 1. Tabela principal de pedidos de compra
CREATE TABLE IF NOT EXISTS pedidos_compras (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(20) UNIQUE NOT NULL,
    descricao TEXT NOT NULL,
    fornecedor VARCHAR(255),
    valor DECIMAL(12,2),
    status VARCHAR(50) NOT NULL DEFAULT 'AGUARDANDO_APROVACAO',
    solicitante VARCHAR(100) DEFAULT 'Qualidade',
    observacoes TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de histórico de mudanças de status
CREATE TABLE IF NOT EXISTS historico_pedidos (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL,
    status_anterior VARCHAR(50),
    status_novo VARCHAR(50) NOT NULL,
    observacao TEXT,
    data_mudanca TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    usuario VARCHAR(100) DEFAULT 'Sistema',
    FOREIGN KEY (pedido_id) REFERENCES pedidos_compras(id) ON DELETE CASCADE
);

-- 3. Índices para otimização
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos_compras (status);
CREATE INDEX IF NOT EXISTS idx_pedidos_data ON pedidos_compras (data_criacao);
CREATE INDEX IF NOT EXISTS idx_pedidos_numero ON pedidos_compras (numero);
CREATE INDEX IF NOT EXISTS idx_historico_pedido ON historico_pedidos (pedido_id);
CREATE INDEX IF NOT EXISTS idx_historico_data ON historico_pedidos (data_mudanca);

-- 4. Dados de exemplo
INSERT INTO pedidos_compras (numero, descricao, fornecedor, valor, status, solicitante, observacoes) VALUES
('SC-001', 'Equipamentos de laboratório', 'LabTech Solutions', 15000.00, 'AGUARDANDO_APROVACAO', 'Qualidade', 'Equipamentos para novo laboratório'),
('SC-002', 'Material de consumo', 'SupplyCorp', 2500.00, 'APROVADO', 'Qualidade', 'Material para testes de qualidade'),
('SC-003', 'Software de gestão', 'TechSoft', 5000.00, 'EM_ANALISE', 'Qualidade', 'Licenças de software'),
('SC-004', 'Equipamentos de segurança', 'SafetyCorp', 4500.00, 'CONCLUIDO', 'Qualidade', 'EPIs para laboratório')
ON CONFLICT (numero) DO NOTHING;

-- 5. Histórico de exemplo
INSERT INTO historico_pedidos (pedido_id, status_anterior, status_novo, observacao, usuario) VALUES
(1, NULL, 'AGUARDANDO_APROVACAO', 'Solicitação de compra criada pelo setor de Qualidade', 'Sistema'),
(2, NULL, 'AGUARDANDO_APROVACAO', 'Solicitação de compra criada pelo setor de Qualidade', 'Sistema'),
(2, 'AGUARDANDO_APROVACAO', 'APROVADO', 'Aprovado pelo Gerente de Qualidade', 'Gerente'),
(3, NULL, 'EM_ANALISE', 'Solicitação de compra criada pelo setor de Qualidade', 'Sistema'),
(4, NULL, 'AGUARDANDO_APROVACAO', 'Solicitação de compra criada pelo setor de Qualidade', 'Sistema'),
(4, 'AGUARDANDO_APROVACAO', 'APROVADO', 'Aprovado pelo Gerente de Qualidade', 'Gerente'),
(4, 'APROVADO', 'EM_ANALISE', 'Enviado para análise técnica', 'Sistema'),
(4, 'EM_ANALISE', 'CONCLUIDO', 'Pedido finalizado com sucesso', 'Sistema')
ON CONFLICT DO NOTHING;

-- 6. Verificar dados inseridos
SELECT 
    p.id,
    p.numero,
    p.descricao,
    p.status,
    p.data_criacao,
    COUNT(h.id) as total_historico
FROM pedidos_compras p
LEFT JOIN historico_pedidos h ON p.id = h.pedido_id
GROUP BY p.id, p.numero, p.descricao, p.status, p.data_criacao
ORDER BY p.data_criacao DESC;
