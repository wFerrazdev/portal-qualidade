# Deploy Simples da Pagina de Login React
Write-Host "Deploy Simples da Pagina de Login React" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# 1. Entrar na pasta react
Write-Host "Entrando na pasta react..." -ForegroundColor Yellow
Set-Location react

# 2. Instalar dependencias
Write-Host "Instalando dependencias..." -ForegroundColor Yellow
npm install

# 3. Fazer build
Write-Host "Fazendo build da versao React..." -ForegroundColor Yellow
npm run build

# 4. Verificar se o build foi bem-sucedido
if ($LASTEXITCODE -eq 0) {
    Write-Host "Build concluido com sucesso!" -ForegroundColor Green
} else {
    Write-Host "Erro no build" -ForegroundColor Red
    exit 1
}

# 5. Voltar para a raiz
Set-Location ..

# 6. Fazer commit e push
Write-Host "Fazendo commit e push..." -ForegroundColor Yellow
git add .
git commit -m "Deploy pagina de login React"
git push origin main

Write-Host "Deploy concluido!" -ForegroundColor Green
Write-Host ""
Write-Host "URLs disponiveis:" -ForegroundColor Cyan
Write-Host "  - Login HTML atual: https://portalqualidadewill.netlify.app/login.html" -ForegroundColor White
Write-Host "  - Login React novo: https://portalqualidadewill.netlify.app/login-react" -ForegroundColor White
Write-Host ""
Write-Host "A pagina de login React esta disponivel em /login-react" -ForegroundColor Green
