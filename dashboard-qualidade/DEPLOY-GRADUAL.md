# 🚀 Deploy Gradual - Portal da Qualidade

## 📁 Estrutura Atual

```
portal-qualidade/
├── / (Versão HTML atual - FUNCIONANDO)
│   ├── index.html
│   ├── login.html
│   ├── projetos.html
│   ├── style.css
│   └── netlify/functions/
├── /react (Versão React - EM DESENVOLVIMENTO)
│   ├── pages/
│   ├── components/
│   ├── styles/
│   └── package.json
└── netlify.toml
```

## 🔄 Como Funciona o Deploy Gradual

### **1. Versão Atual (HTML)**
- **URL:** `https://seu-site.netlify.app/`
- **Status:** ✅ Funcionando perfeitamente
- **Usuários:** Continuam usando normalmente

### **2. Versão React**
- **URL:** `https://seu-site.netlify.app/react/`
- **Status:** 🔄 Em desenvolvimento
- **Usuários:** Podem testar as novas funcionalidades

## 🛠️ Configuração do Netlify

### **Build Settings:**
```toml
[build]
  command = "cd react && npm install && npm run build"
  publish = "react/.next"

[build.environment]
  NODE_VERSION = "18"
```

### **Redirects:**
```toml
# Versão React
[[redirects]]
  from = "/react/*"
  to = "/:splat"
  status = 200

# Fallback para HTML
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 📋 Comandos para Deploy

### **1. Deploy da Versão Atual (HTML):**
```bash
# Nada muda! Continua funcionando
git add .
git commit -m "Atualização da versão HTML"
git push origin main
```

### **2. Deploy da Versão React:**
```bash
# Instalar dependências da versão React
cd react
npm install

# Fazer build
npm run build

# Voltar para a raiz e fazer commit
cd ..
git add .
git commit -m "Atualização da versão React"
git push origin main
```

## 🎯 URLs de Acesso

| Página | HTML Atual | React Nova |
|--------|------------|------------|
| Login | `/login.html` | `/react/login` |
| Dashboard | `/` | `/react/dashboard` |
| Projetos | `/projetos.html` | `/react/projetos` |

## 🔄 Migração Gradual

### **Fase 1: ✅ Concluída**
- [x] Estrutura base React
- [x] Página de login migrada
- [x] Configuração de deploy

### **Fase 2: 🔄 Em Andamento**
- [ ] Dashboard principal
- [ ] Componentes base
- [ ] Sistema de roteamento

### **Fase 3: 📋 Planejada**
- [ ] Página de projetos
- [ ] Página de auditorias
- [ ] Página de reuniões
- [ ] Página de calibração

### **Fase 4: 🎯 Final**
- [ ] Migração completa
- [ ] Remoção da versão HTML
- [ ] Otimizações finais

## 🧪 Como Testar

### **1. Versão HTML (Atual):**
```bash
# Acesse normalmente
https://seu-site.netlify.app/
```

### **2. Versão React (Nova):**
```bash
# Acesse a versão React
https://seu-site.netlify.app/react/login
```

## 🐛 Resolução de Problemas

### **Erro de Build:**
```bash
cd react
npm install
npm run build
```

### **Erro de Deploy:**
- Verifique o `netlify.toml`
- Confirme as configurações no Netlify
- Verifique os logs de build

### **Erro de Roteamento:**
- Verifique os redirects no `netlify.toml`
- Confirme as configurações do Next.js

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do Netlify
2. Teste localmente com `npm run dev`
3. Entre em contato com o desenvolvedor

## 🎉 Vantagens do Deploy Gradual

- ✅ **Zero downtime** - Site continua funcionando
- ✅ **Testes seguros** - Usuários podem testar
- ✅ **Rollback fácil** - Volta para versão anterior
- ✅ **Desenvolvimento contínuo** - Migra página por página
- ✅ **Feedback real** - Usuários testam as mudanças
