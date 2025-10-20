# Deploy das Correcoes das Ondas
Write-Host "Deploy das Correcoes das Ondas" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green

# 1. Entrar na pasta react
Write-Host "Entrando na pasta react..." -ForegroundColor Yellow
Set-Location react

# 2. Fazer build
Write-Host "Fazendo build da versao React..." -ForegroundColor Yellow
npm run build

# 3. Verificar se o build foi bem-sucedido
if ($LASTEXITCODE -eq 0) {
    Write-Host "Build concluido com sucesso!" -ForegroundColor Green
} else {
    Write-Host "Erro no build" -ForegroundColor Red
    exit 1
}

# 4. Voltar para a raiz
Set-Location ..

# 5. Fazer commit e push
Write-Host "Fazendo commit e push..." -ForegroundColor Yellow
git add .
git commit -m "Correcoes das ondas animadas"
git push origin main

Write-Host "Deploy das correcoes concluido!" -ForegroundColor Green
Write-Host ""
Write-Host "Teste agora:" -ForegroundColor Cyan
Write-Host "https://portalqualidadewill.netlify.app/login-react" -ForegroundColor White
Write-Host ""
Write-Host "As ondas agora devem estar mais suaves e nao sair da borda!" -ForegroundColor Green
