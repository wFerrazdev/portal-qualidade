#!/bin/bash

# Script para build da versão React
echo "🚀 Iniciando build da versão React..."

# Entrar na pasta react
cd react

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Fazer build
echo "🔨 Fazendo build..."
npm run build

# Verificar se o build foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "✅ Build da versão React concluído com sucesso!"
else
    echo "❌ Erro no build da versão React"
    exit 1
fi

echo "🎉 Deploy da versão React pronto!"
