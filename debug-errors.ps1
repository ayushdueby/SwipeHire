# SwipeHire Error Debugging Script
Write-Host "🔍 Debugging SwipeHire errors..." -ForegroundColor Green

Write-Host ""
Write-Host "=== BACKEND ERRORS ===" -ForegroundColor Cyan
Push-Location backend
Write-Host "Checking backend TypeScript errors..." -ForegroundColor Yellow
pnpm run build 2>&1 | Select-Object -First 20
Pop-Location

Write-Host ""
Write-Host "=== FRONTEND ERRORS ===" -ForegroundColor Cyan  
Push-Location frontend
Write-Host "Checking frontend TypeScript errors..." -ForegroundColor Yellow
pnpm run type-check 2>&1 | Select-Object -First 20
Pop-Location

Write-Host ""
Write-Host "=== DEPENDENCY VERSIONS ===" -ForegroundColor Cyan
Write-Host "Node.js: $(node --version)"
Write-Host "pnpm: $(pnpm --version)"
Write-Host "TypeScript (backend): $(cd backend && pnpm list typescript --depth=0 2>$null | Select-String 'typescript')"
Write-Host "TypeScript (frontend): $(cd frontend && pnpm list typescript --depth=0 2>$null | Select-String 'typescript')"

Write-Host ""
Write-Host "=== FILE EXISTENCE CHECK ===" -ForegroundColor Cyan
$criticalFiles = @(
    "backend\src\server.ts",
    "backend\src\lib\db.ts", 
    "backend\tsconfig.json",
    "frontend\src\app\layout.tsx",
    "frontend\tsconfig.json",
    "frontend\.env.local",
    "backend\.env"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== ENVIRONMENT VARIABLES ===" -ForegroundColor Cyan
if (Test-Path "backend\.env") {
    Write-Host "Backend .env file contents (first few lines):" -ForegroundColor Gray
    Get-Content "backend\.env" | Select-Object -First 5
} else {
    Write-Host "❌ Backend .env file missing" -ForegroundColor Red
}

if (Test-Path "frontend\.env.local") {
    Write-Host "Frontend .env.local file contents (first few lines):" -ForegroundColor Gray
    Get-Content "frontend\.env.local" | Select-Object -First 5
} else {
    Write-Host "❌ Frontend .env.local file missing" -ForegroundColor Red
}


