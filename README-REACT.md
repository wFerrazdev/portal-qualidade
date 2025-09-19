# Portal da Qualidade - Versão React

Esta é a versão React/Next.js do Portal da Qualidade, migrada do HTML/CSS/JS puro.

## 🚀 Instalação e Execução

### 1. Instalar dependências
```bash
npm install
```

### 2. Executar em desenvolvimento
```bash
npm run dev
```

### 3. Acessar a aplicação
Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📁 Estrutura do Projeto

```
├── pages/
│   ├── _app.tsx          # Configuração global da aplicação
│   ├── index.tsx         # Página inicial (redirecionamento)
│   └── login.tsx         # Página de login
├── components/           # Componentes reutilizáveis
├── styles/
│   └── globals.css       # Estilos globais + Tailwind
├── types/
│   └── netlify.d.ts      # Tipos TypeScript
├── next.config.js        # Configuração do Next.js
├── tailwind.config.js    # Configuração do Tailwind
└── package-react.json    # Dependências (renomear para package.json)
```

## ✨ Funcionalidades Implementadas

### ✅ Página de Login
- [x] Design idêntico ao original
- [x] Background animado com ondas
- [x] Integração com Netlify Identity
- [x] Animações suaves com Framer Motion
- [x] Responsividade completa
- [x] Validação de formulário

### 🔄 Em Desenvolvimento
- [ ] Dashboard principal
- [ ] Página de projetos
- [ ] Página de auditorias
- [ ] Página de reuniões
- [ ] Página de calibração
- [ ] Componentes reutilizáveis
- [ ] Sistema de roteamento

## 🎨 Tecnologias Utilizadas

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Framer Motion** - Animações
- **Lucide React** - Ícones
- **Netlify Identity** - Autenticação

## 🔧 Configuração

### Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_NETLIFY_IDENTITY_URL=https://seu-site.netlify.app
```

### Deploy no Netlify
1. Conecte o repositório ao Netlify
2. Configure o build command: `npm run build`
3. Configure o publish directory: `.next`
4. Adicione as variáveis de ambiente

## 📝 Próximos Passos

1. **Migrar Dashboard** - Página principal com gráficos
2. **Migrar Projetos** - CRUD de projetos
3. **Migrar Auditorias** - Sistema de auditorias
4. **Migrar Reuniões** - Gestão de reuniões
5. **Migrar Calibração** - Sistema de calibração
6. **Otimizações** - Performance e SEO

## 🐛 Resolução de Problemas

### Erro de Netlify Identity
- Verifique se o script está carregando
- Confirme as configurações no Netlify
- Verifique o console do navegador

### Erro de Build
- Execute `npm run build` localmente
- Verifique se todas as dependências estão instaladas
- Confirme a configuração do TypeScript

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com o desenvolvedor.
