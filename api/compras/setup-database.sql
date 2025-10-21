-- Criação das tabelas para o sistema de compras
-- Execute este script no seu banco de dados PostgreSQL

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS compras_pedidos (
    id SERIAL PRIMARY KEY,
    numero INTEGER UNIQUE NOT NULL,
    descricao TEXT NOT NULL,
    fornecedor VARCHAR(255) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observacoes TEXT
);

-- Tabela de histórico de mudanças de status
CREATE TABLE IF NOT EXISTS compras_historico (
    id SERIAL PRIMARY KEY,
    numero_pedido INTEGER NOT NULL,
    status_anterior VARCHAR(50),
    status_novo VARCHAR(50) NOT NULL,
    data_mudanca TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observacao TEXT,
    FOREIGN KEY (numero_pedido) REFERENCES compras_pedidos(numero) ON DELETE CASCADE
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_compras_pedidos_numero ON compras_pedidos(numero);
CREATE INDEX IF NOT EXISTS idx_compras_pedidos_status ON compras_pedidos(status);
CREATE INDEX IF NOT EXISTS idx_compras_historico_numero ON compras_historico(numero_pedido);

-- Dados de exemplo (opcional)
INSERT INTO compras_pedidos (numero, descricao, fornecedor, valor, status, observacoes) VALUES
(1001, 'Equipamentos de laboratório', 'LabTech Solutions', 15000.00, 'AGUARDANDO_APROVACAO_SC', 'Equipamentos para novo laboratório'),
(1002, 'Material de consumo', 'SupplyCorp', 2500.00, 'SC_APROVADA', 'Material para testes de qualidade')
ON CONFLICT (numero) DO NOTHING;

-- Histórico de exemplo
INSERT INTO compras_historico (numero_pedido, status_anterior, status_novo, observacao) VALUES
(1001, NULL, 'AGUARDANDO_APROVACAO_SC', 'Solicitação de compra criada pelo setor de Qualidade'),
(1002, NULL, 'AGUARDANDO_APROVACAO_SC', 'Solicitação de compra criada pelo setor de Qualidade'),
(1002, 'AGUARDANDO_APROVACAO_SC', 'SC_APROVADA', 'Aprovado pelo Supervisor de Compras')
ON CONFLICT DO NOTHING;
