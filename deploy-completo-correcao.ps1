# Deploy Completo - Correcao Total
Write-Host "Deploy Completo - Correcao Total" -ForegroundColor Red
Write-Host "=================================" -ForegroundColor Red

# 1. Verificar se estamos na pasta correta
Write-Host "Verificando pasta atual..." -ForegroundColor Yellow
if (!(Test-Path "index.html")) {
    Write-Host "ERRO: Nao estamos na pasta correta!" -ForegroundColor Red
    exit 1
}

# 2. Fazer build do React
Write-Host "Fazendo build do React..." -ForegroundColor Yellow
Set-Location react
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Build do React falhou!" -ForegroundColor Red
    exit 1
}

# 3. Copiar arquivo HTML gerado
Write-Host "Copiando arquivo HTML gerado..." -ForegroundColor Yellow
Set-Location ..
Copy-Item "react\.next\server\pages\login.html" "login-react.html" -Force

# 4. Verificar se arquivos existem
Write-Host "Verificando arquivos..." -ForegroundColor Yellow
if (!(Test-Path "index.html")) {
    Write-Host "ERRO: index.html nao encontrado!" -ForegroundColor Red
    exit 1
}
if (!(Test-Path "login.html")) {
    Write-Host "ERRO: login.html nao encontrado!" -ForegroundColor Red
    exit 1
}
if (!(Test-Path "login-react.html")) {
    Write-Host "ERRO: login-react.html nao encontrado!" -ForegroundColor Red
    exit 1
}

# 5. Fazer commit e push
Write-Host "Fazendo commit e push..." -ForegroundColor Yellow
git add .
git commit -m "Correcao completa - todas as paginas funcionando"
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Deploy completo realizado com sucesso!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Teste as paginas:" -ForegroundColor Cyan
    Write-Host "1. Pagina principal: https://portalqualidadewill.netlify.app/" -ForegroundColor White
    Write-Host "2. Login HTML: https://portalqualidadewill.netlify.app/login.html" -ForegroundColor White
    Write-Host "3. Login React: https://portalqualidadewill.netlify.app/login-react" -ForegroundColor White
    Write-Host ""
    Write-Host "Aguarde 1-2 minutos para o Netlify processar as mudancas." -ForegroundColor Yellow
} else {
    Write-Host "ERRO: Falha no push para o repositorio!" -ForegroundColor Red
    exit 1
}
