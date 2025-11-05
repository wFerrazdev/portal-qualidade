# 📋 Contexto do Projeto - Portal da Qualidade

**Última atualização:** Janeiro 2025  
**Proprietário:** William Ferraz

---

## 🎯 Visão Geral

Este é um Dashboard de Indicadores de Qualidade desenvolvido para gestão de projetos, auditorias, reuniões, calibrações e compras. O projeto está em produção no Vercel e usa integração com Google Sheets e PostgreSQL.

---

## 📁 ESTRUTURA DO PROJETO

### ⚠️ **IMPORTANTE: Onde fazer alterações**

**Para alterações de PÁGINAS → Editar arquivos em `/public/`**  
**Para alterações de APIs → Editar arquivos em `/api/`**

A pasta `/public/` contém os arquivos que são deployados no Vercel e estão em produção.  
As outras pastas (`/react/`, `/api-backup/`, etc.) são para desenvolvimento/referência.

---

## 📂 Estrutura de Pastas

### `/public/` - **ARQUIVOS DE PRODUÇÃO (Vercel)**

Esta é a pasta principal que vai para o Vercel. Todas as alterações de páginas devem ser feitas aqui.

#### Páginas HTML:
- `index.html` - Dashboard principal (indicadores de qualidade)
- `projetos.html` - Gestão de projetos
- `auditoriasevisitas.html` - Gestão de auditorias e visitas
- `reunioes.html` - Gestão de reuniões
- `calibracao.html` - Gestão de calibração
- `compras.html` - Gestão de compras/pedidos
- `login.html` - Página de login
- `callback.html` - Callback do Auth0
- `404.html` - Página de erro 404

#### Arquivos de Configuração:
- `style.css` - Estilos principais da aplicação
- `auth0-config.js` - Configuração do Auth0 (autenticação)
- `mock-data.js` - Dados mock para desenvolvimento
- `js/calibracao.js` - JavaScript específico da página de calibração

#### Assets:
- Logos, imagens, favicon, etc.

---

### `/api/` - **APIs Serverless (Vercel Functions)**

APIs que são chamadas pelas páginas HTML. Cada API tem um nome autoexplicativo, exceto a do dashboard.

#### Mapeamento de Páginas → APIs:

| Página HTML | API Correspondente | Endpoint |
|------------|-------------------|----------|
| `index.html` (Dashboard) | `/api/getSheetData.js` | `/api/getSheetData` |
| `projetos.html` | `/api/projetos.js` | `/api/projetos` |
| `auditoriasevisitas.html` | `/api/auditorias.js` | `/api/auditorias` |
| `reunioes.html` | `/api/reunioes.js` | `/api/reunioes` |
| `compras.html` | `/api/compras.js` | `/api/compras` |
| `calibracao.html` | (verificar se usa API específica) | - |

#### APIs Utilitárias:
- `utils.js` - API utilitária usada por outras APIs
  - Funções: `getItem`, `updateItem`, `checkTable`
  - Usada internamente por outras APIs

#### Observações Importantes:
- **`getSheetData.js`** - API especial do dashboard que:
  - Busca dados do Google Sheets
  - Atualiza células no Google Sheets
  - Integra com múltiplas planilhas (Externo, Interno, RIFs, NC Externa)
  - Usa credenciais do Google Service Account (variáveis de ambiente)

---

## 🔧 Tecnologias Utilizadas

### Frontend:
- **HTML5, CSS3, JavaScript (Vanilla)**
- **Chart.js** - Gráficos e visualizações
- **Chart.js Plugin Datalabels** - Labels nos gráficos
- **Auth0** - Autenticação (login via Microsoft)

### Backend:
- **Node.js** - Runtime para APIs Serverless
- **PostgreSQL** - Banco de dados (Neon)
- **Google Sheets API** - Integração com planilhas Google
- **Vercel Serverless Functions** - Hospedagem das APIs

### Deploy:
- **Vercel** - Plataforma de deploy
- **GitHub** - Repositório Git
- **Integração contínua** - Deploy automático via GitHub

---

## 🗄️ Banco de Dados

### PostgreSQL (Neon)

#### Tabelas Principais:
- `projetos` - Projetos de qualidade
- `auditorias` - Auditorias e visitas
- `reunioes` - Reuniões
- `pedidos_compras` / `purchase_orders` - Pedidos de compra
- `historico_pedidos` / `purchase_order_history` - Histórico de mudanças

#### Conexão:
- Connection String: `process.env.DATABASE_URL`
- SSL habilitado: `rejectUnauthorized: false`
- Pool configurado para otimização

---

## 🔐 Autenticação

### Auth0
- **Arquivo de configuração:** `public/auth0-config.js`
- **Domínio:** `dev-oii2kkbrimlakra2.us.auth0.com`
- **Client ID:** Configurado no arquivo
- **Redirect URI:** `/callback.html`
- **Método de login:** Microsoft (SSO)

⚠️ **Segurança:** As credenciais estão no código. Considerar mover para variáveis de ambiente.

---

## 📊 Integração com Google Sheets

### Planilhas Utilizadas:
1. **SPREADSHEET_ID_EXTERNO** - Indicadores externos
2. **SPREADSHEET_ID_INTERNO** - Indicadores internos
3. **SPREADSHEET_ID_RIFS** - RIFs (Reclamações)
4. **SPREADSHEET_ID_NC_EXTERNA** - NCs Externas

### API `getSheetData.js`:
- **GET:** Busca dados de múltiplas abas de uma planilha
- **POST:** Atualiza células específicas (A1 notation)
- **Autenticação:** Google Service Account (JWT)
- **Variáveis de ambiente necessárias:**
  - `GOOGLE_CLIENT_EMAIL`
  - `GOOGLE_PRIVATE_KEY`

---

## 🚀 Deploy

### Vercel
- **Configuração:** `vercel.json` na raiz
- **Deploy automático:** Via GitHub (branch main)
- **Pasta de build:** `/public` (arquivos estáticos)
- **APIs:** `/api` (Serverless Functions)

### Processo de Deploy:
1. Push para GitHub (branch main)
2. Vercel detecta mudanças
3. Deploy automático
4. Páginas em `/public/` são servidas
5. APIs em `/api/` viram Serverless Functions

---

## 📝 Como Fazer Alterações

### Alterar uma Página:
1. Editar o arquivo HTML em `/public/[nome-da-pagina].html`
2. Fazer commit e push para GitHub
3. Deploy automático no Vercel

### Alterar uma API:
1. Editar o arquivo JavaScript em `/api/[nome-da-api].js`
2. Fazer commit e push para GitHub
3. Deploy automático no Vercel
4. A API fica disponível em `/api/[nome-da-api]`

### Alterar Estilos:
1. Editar `/public/style.css`
2. Fazer commit e push
3. Deploy automático

### Adicionar Nova Funcionalidade:
1. Criar/editar página em `/public/`
2. Criar/editar API em `/api/` se necessário
3. Testar localmente (se possível)
4. Fazer commit e push
5. Deploy automático

---

## 🔄 Outras Pastas (Referência/Desenvolvimento)

### `/react/`
- Versão React/Next.js em desenvolvimento
- **Status:** Não está em produção
- **Tecnologias:** Next.js 14, TypeScript, Tailwind CSS, Framer Motion

### `/api-backup/`
- Versões antigas/backup das APIs
- **Status:** Não usado em produção

### Raiz do projeto
- Arquivos de configuração
- Scripts de deploy
- Documentação adicional
- Arquivos de backup

---

## ⚠️ Pontos de Atenção

1. **Pasta `public/` é a fonte de verdade** - Todas as alterações de páginas devem ser feitas aqui
2. **APIs são autoexplicativas** - Exceto `getSheetData.js` que é do dashboard
3. **`utils.js` é compartilhada** - Usada por outras APIs
4. **Credenciais no código** - Auth0 config está no código (considerar mover para env vars)
5. **Múltiplas estruturas de BD** - Existem dois arquivos SQL de setup (verificar qual está em uso)

---

## 📞 Informações Importantes

- **Projeto:** Dashboard de Indicadores de Qualidade
- **Versão:** 2.1+ (Dashboard moderno)
- **Desenvolvedor:** William Ferraz
- **Plataforma de Deploy:** Vercel
- **Integração:** GitHub → Vercel (automático)

---

## 🎯 Resumo Rápido

✅ **Alterar páginas?** → Editar arquivos em `/public/`  
✅ **Alterar APIs?** → Editar arquivos em `/api/`  
✅ **Dashboard usa?** → `/api/getSheetData.js`  
✅ **APIs compartilham?** → `/api/utils.js`  
✅ **Deploy?** → Automático via GitHub → Vercel  

---

**Este documento foi criado para preservar o contexto do projeto e facilitar futuras manutenções.**

