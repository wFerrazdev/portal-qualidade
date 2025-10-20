# Deploy da Página de Login React - Windows PowerShell
Write-Host "🚀 Deploy da Página de Login React" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

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

# 6. Fazer commit e push
Write-Host "📤 Fazendo commit e push..." -ForegroundColor Yellow
git add .
git commit -m "Deploy página de login React"
git push origin main

Write-Host "🎉 Deploy da página de login React concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 URLs disponíveis:" -ForegroundColor Cyan
Write-Host "  - Login HTML atual: https://seu-site.netlify.app/login.html" -ForegroundColor White
Write-Host "  - Login React novo: https://seu-site.netlify.app/login-react" -ForegroundColor White
Write-Host ""
Write-Host "✨ A página de login React está disponível em /login-react" -ForegroundColor Green
