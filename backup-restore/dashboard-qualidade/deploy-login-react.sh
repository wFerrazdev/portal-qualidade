#!/bin/bash

echo "🚀 Deploy da Página de Login React"
echo "=================================="

# 1. Entrar na pasta react
echo "📁 Entrando na pasta react..."
cd react

# 2. Instalar dependências
echo "📦 Instalando dependências..."
npm install

# 3. Fazer build
echo "🔨 Fazendo build da versão React..."
npm run build

# 4. Verificar se o build foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
else
    echo "❌ Erro no build"
    exit 1
fi

# 5. Voltar para a raiz
cd ..

# 6. Fazer commit e push
echo "📤 Fazendo commit e push..."
git add .
git commit -m "Deploy página de login React"
git push origin main

echo "🎉 Deploy da página de login React concluído!"
echo ""
echo "📋 URLs disponíveis:"
echo "  - Login HTML atual: https://seu-site.netlify.app/login.html"
echo "  - Login React novo: https://seu-site.netlify.app/login-react"
echo ""
echo "✨ A página de login React está disponível em /login-react"
