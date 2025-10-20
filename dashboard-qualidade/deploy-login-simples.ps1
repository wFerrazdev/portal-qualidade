# Deploy Simples da Página de Login React
Write-Host "🚀 Deploy Simples da Página de Login React" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# 1. Entrar na pasta react
Write-Host "📁 Entrando na pasta react..." -ForegroundColor Yellow
Set-Location react

# 2. Instalar dependências
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
npm install

# 3. Fazer build
Write-Host "🔨 Fazendo build da versão React..." -ForegroundColor Yellow
npm run build

# 4. Verificar se o build foi bem-sucedido
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build concluído com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro no build" -ForegroundColor Red
    exit 1
}

# 5. Voltar para a raiz
Set-Location ..

# 6. Criar página de login React na raiz
Write-Host "📄 Criando página de login React na raiz..." -ForegroundColor Yellow

# Copiar arquivos buildados para a raiz
Copy-Item "react\.next\static" -Destination "." -Recurse -Force
Copy-Item "react\.next\*.html" -Destination "." -Force

# 7. Fazer commit e push
Write-Host "📤 Fazendo commit e push..." -ForegroundColor Yellow
git add .
git commit -m "Deploy página de login React na raiz"
git push origin main

Write-Host "🎉 Deploy concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 URLs disponíveis:" -ForegroundColor Cyan
Write-Host "  - Login HTML atual: https://portalqualidadewill.netlify.app/login.html" -ForegroundColor White
Write-Host "  - Login React novo: https://portalqualidadewill.netlify.app/login-react" -ForegroundColor White
Write-Host ""
Write-Host "A pagina de login React esta disponivel em /login-react" -ForegroundColor Green
