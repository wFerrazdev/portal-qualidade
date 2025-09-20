# Deploy do Novo Design da Pagina de Login
Write-Host "Deploy do Novo Design da Pagina de Login" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

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
git commit -m "Novo design moderno da pagina de login - tech e minimalista"
git push origin main

Write-Host "Deploy do novo design concluido!" -ForegroundColor Green
Write-Host ""
Write-Host "Teste agora:" -ForegroundColor Cyan
Write-Host "https://portalqualidadewill.netlify.app/login-react" -ForegroundColor White
Write-Host ""
Write-Host "Novo design inclui:" -ForegroundColor Green
Write-Host "- Linhas onduladas animadas que cruzam a tela" -ForegroundColor White
Write-Host "- Partículas flutuantes" -ForegroundColor White
Write-Host "- Grid pattern de fundo" -ForegroundColor White
Write-Host "- Card com borda animada" -ForegroundColor White
Write-Host "- Efeitos de brilho e glassmorphism" -ForegroundColor White
Write-Host "- Gradiente azul marinho para azul claro" -ForegroundColor White
