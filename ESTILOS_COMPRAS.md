# 📋 Lista de Estilos - Página de Compras

## 📍 Localização no `public/style.css`

### 🎨 **Container Principal** (Linhas 5591-5601)
- **`.gestao-compras-container`** - Container principal da página
  - Background gradiente azul
  - Padding e margin
  - Flex layout

### ⏳ **Loading State** (Linhas 5604-5626)
- **`.loading-state`** - Estado de carregamento
- **`.loading-spinner`** - Spinner de carregamento
- **`@keyframes spin`** - Animação de rotação

### 📱 **App Content** (Linhas 5629-5631)
- **`.app-content`** - Conteúdo do app

### 📝 **Header da Página** (Linhas 5634-5682)
- **`.app-header`** (5634-5639) - Header principal
- **`.header-left h1.app-title`** (5641-5649) - Título com gradiente azul
- **`.header-left p.app-subtitle`** (5651-5655) - Subtítulo
- **`.btn-nova-solicitacao`** (5658-5671) - **Botão "Nova Solicitação"**
- **`.btn-nova-solicitacao:hover`** (5673-5677) - Hover do botão
- **`.btn-nova-solicitacao .icon`** (5679-5682) - Ícone do botão

### 📊 **Cards de Estatísticas** (Linhas 5684-5776)
- **`.stats-grid`** (5684-5690) - Grid de estatísticas
- **`.stat-card`** (5692-5699) - Card individual
- **`.stat-card:hover`** (5701-5704) - Hover do card
- **`.stat-content`** (5706-5710) - Conteúdo do card
- **`.stat-info p.stat-label`** (5712-5719) - Label
- **`.stat-info p.stat-value`** (5721-5725) - Valor
- **`.stat-card:nth-child(1-4) .stat-value`** (5727-5744) - Cores dos valores
- **`.stat-icon`** (5746-5754) - Ícone
- **`.stat-card:nth-child(1-4) .stat-icon`** (5756-5770) - Cores dos ícones
- **`.stat-icon svg`** (5772-5776) - SVG dos ícones

### 🔍 **Seção de Filtros** (Linhas 5778-5846)
- **`.filters-section`** (5778-5787) - Seção de filtros (gradiente azul)
- **`.search-container, .filter-container`** (5795-5798) - Containers
- **`.search-icon, .filter-icon`** (5800-5809) - Ícones
- **`.search-input, .status-filter`** (5811-5821) - Inputs
- **`.search-input::placeholder`** (5823-5825) - Placeholder
- **`.search-input:focus, .status-filter:focus`** (5827-5832) - Focus
- **`.status-filter`** (5834-5841) - Select de status
- **`.status-filter option`** (5843-5846) - Opções

### 📋 **Tabela de Pedidos** (Linhas 5848-6059)
- **`.orders-table-container`** (5849-5860) - Container da tabela
- **`.orders-table-wrapper`** (5862-5868) - Wrapper com scroll
- **`.orders-table-wrapper::-webkit-scrollbar`** (5870-5896) - Scrollbar personalizada
- **`.orders-table`** (5905-5908) - Tabela
- **`.orders-table thead`** (5910-5913) - Header da tabela
- **`.orders-table th`** (5915-5923) - Células de header
- **`.orders-table td`** (5925-5929) - Células de dados
- **`.orders-table tbody tr:hover`** (5931-5933) - Hover nas linhas

### 🎯 **Cores de Status** (Linhas 5935-5975)
- **`.bg-amber-50, .text-amber-700, .border-amber-200`** (5936-5938) - Amarelo
- **`.bg-blue-50, .text-blue-700, .border-blue-200`** (5940-5942) - Azul
- **`.bg-orange-50, .text-orange-700, .border-orange-200`** (5944-5946) - Laranja
- **`.bg-purple-50, .text-purple-700, .border-purple-200`** (5948-5950) - Roxo
- **`.bg-indigo-50, .text-indigo-700, .border-indigo-200`** (5952-5954) - Indigo
- **`.bg-pink-50, .text-pink-700, .border-pink-200`** (5956-5958) - Rosa
- **`.bg-cyan-50, .text-cyan-700, .border-cyan-200`** (5960-5962) - Ciano
- **`.bg-teal-50, .text-teal-700, .border-teal-200`** (5964-5966) - Verde água
- **`.bg-emerald-50, .text-emerald-700, .border-emerald-200`** (5968-5970) - Esmeralda
- **`.bg-red-50, .text-red-700, .border-red-200`** (5972-5974) - Vermelho

### 🔖 **Badges de Status** (Linhas 6060-6119)
- **`.status-AGUARDANDO_APROVACAO_SC`** (6061-6065) - Aguardando SC
- **`.status-SC_APROVADA`** (6067-6071) - SC Aprovada
- **`.status-AGUARDANDO_APROVACAO_OC`** (6073-6077) - Aguardando OC
- **`.status-OC_APROVADA`** (6079-6083) - OC Aprovada
- **`.status-PEDIDO_EMITIDO`** (6085-6089) - Pedido Emitido
- **`.status-AGUARDANDO_PAGAMENTO`** (6091-6095) - Aguardando Pagamento
- **`.status-PAGO`** (6097-6101) - Pago
- **`.status-AGUARDANDO_ENTREGA`** (6103-6107) - Aguardando Entrega
- **`.status-ENTREGUE`** (6109-6113) - Entregue
- **`.status-CANCELADO`** (6115-6119) - Cancelado

### 🔘 **Botões da Tabela** (Linhas 6006-6014)
- **`.orders-table button`** (6007-6009) - **Botão "Ver"**
- **`.orders-table button:hover`** (6011-6014) - Hover do botão

### 📑 **TBody com Altura Reduzida** (Linhas 6016-6048)
- **`.orders-tbody tr`** (6017-6021) - Linhas (altura: 60px)
- **`.orders-tbody tr:hover`** (6023-6025) - Hover nas linhas
- **`.orders-tbody`** (6027-6030) - Container com scroll
- **`.orders-tbody::-webkit-scrollbar`** (6032-6048) - Scrollbar azul personalizada

### 📄 **Estado Vazio** (Linhas 5977-6004)
- **`.empty-state`** (5977-5981) - Estado vazio
- **`.empty-icon`** (5983-5992) - Ícone vazio
- **`.empty-icon svg`** (5994-5999) - SVG do ícone
- **`.empty-state p`** (6001-6004) - Texto vazio

### 🪟 **Modal** (Linhas 6121-6167)
- **`.modal-overlay`** (6122-6124) - Overlay do modal
- **`.modal-content`** (6126-6128) - Conteúdo do modal
- **`@keyframes modalSlideIn`** (6130-6139) - Animação do modal
- **`.modal-content button`** (6142-6167) - Botões do modal

### 📱 **Responsividade** (Linhas 6169-6193)
- **`@media (max-width: 768px)`** - Mobile
  - `.gestao-compras-container` (6171-6173)
  - `.app-header` (6175-6179)
  - `.stats-grid` (6181-6184)
  - `.filters-section` (6186-6188)
  - `.orders-table-container` (6190-6192)
  - `.orders-table` (6194-6196)

---

## 🎯 **Elementos Principais**

### ⭐ **Mais Importantes**
1. **`.btn-nova-solicitacao`** - **Linhas 5658-5682** 🔵
2. **`.orders-table button`** - **Linhas 6007-6014** 🔵 (Botão Ver)
3. **`.orders-tbody`** - **Linhas 6017-6048** 🔵 (Scrollbar azul)
4. **`.stat-card`** - **Linhas 5692-5776** 📊
5. **`.status-*`** - **Linhas 6060-6119** 🎨 (Cores dos status)

### 🎨 **Onde Modificar Cores**
- **Botão Nova Solicitação:** Linha 5659
- **Botão Ver (hover):** Linha 6012
- **Scrollbar azul:** Linhas 6042, 6047
- **Status colors:** Linhas 6060-6119

