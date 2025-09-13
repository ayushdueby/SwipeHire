# SwipeHire Complete Error Fix Script
Write-Host "🔧 Fixing all SwipeHire issues..." -ForegroundColor Green

# Stop any running processes first
Write-Host "Stopping any running processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Clean up node_modules
Write-Host "Cleaning up old installations..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force frontend\node_modules -ErrorAction SilentlyContinue  
Remove-Item -Recurse -Force backend\node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
Remove-Item frontend\package-lock.json -ErrorAction SilentlyContinue
Remove-Item backend\package-lock.json -ErrorAction SilentlyContinue

# Install fresh dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Copy environment files if they don't exist
Write-Host "Setting up environment files..." -ForegroundColor Yellow
if (-not (Test-Path "frontend\.env.local")) {
    Copy-Item "env.frontend.example" -Destination "frontend\.env.local"
    Write-Host "✅ Created frontend\.env.local" -ForegroundColor Green
}

if (-not (Test-Path "backend\.env")) {
    Copy-Item "env.backend.example" -Destination "backend\.env"
    Write-Host "✅ Created backend\.env" -ForegroundColor Green
}

# Test TypeScript compilation
Write-Host "Testing TypeScript compilation..." -ForegroundColor Yellow

Push-Location backend
Write-Host "Building backend..." -ForegroundColor Gray
pnpm run build
$backendBuildSuccess = $LASTEXITCODE -eq 0
Pop-Location

Push-Location frontend
Write-Host "Type-checking frontend..." -ForegroundColor Gray
pnpm run type-check
$frontendTypeSuccess = $LASTEXITCODE -eq 0
Pop-Location

# Report results
Write-Host ""
if ($backendBuildSuccess) {
    Write-Host "✅ Backend TypeScript compilation successful" -ForegroundColor Green
} else {
    Write-Host "❌ Backend TypeScript compilation failed" -ForegroundColor Red
}

if ($frontendTypeSuccess) {
    Write-Host "✅ Frontend TypeScript compilation successful" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend TypeScript compilation failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Fix process completed!" -ForegroundColor Green
Write-Host ""
Write-Host "To start development:" -ForegroundColor Cyan
Write-Host "1. Update your .env files with real API keys" -ForegroundColor White
Write-Host "2. Run 'pnpm run dev' to start both servers" -ForegroundColor White
Write-Host "3. Visit http://localhost:3000" -ForegroundColor White

if ($backendBuildSuccess -and $frontendTypeSuccess) {
    Write-Host ""
    Write-Host "✅ All TypeScript errors should now be resolved!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️  Some issues remain. Check the compilation output above." -ForegroundColor Yellow
}


