# SwipeHire Setup Verification Script
Write-Host "🔍 Verifying SwipeHire setup..." -ForegroundColor Green

# Check if all required files exist
$requiredFiles = @(
    "package.json",
    "pnpm-workspace.yaml",
    "frontend/package.json",
    "backend/package.json",
    "frontend/next.config.mjs",
    "frontend/tsconfig.json",
    "backend/tsconfig.json",
    "frontend/tailwind.config.ts",
    "frontend/src/app/layout.tsx",
    "backend/src/server.ts"
)

Write-Host "Checking required files..." -ForegroundColor Yellow
$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ Missing files found. Setup may be incomplete." -ForegroundColor Red
    exit 1
}

# Check if node_modules exist
Write-Host "Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ Root dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Root dependencies not installed" -ForegroundColor Red
}

if (Test-Path "frontend/node_modules") {
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend dependencies not installed" -ForegroundColor Red
}

if (Test-Path "backend/node_modules") {
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Backend dependencies not installed" -ForegroundColor Red
}

# Check environment files
Write-Host "Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path "frontend/.env.local") {
    Write-Host "✅ Frontend environment file exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend environment file missing. Run: Copy-Item env.frontend.example -Destination frontend/.env.local" -ForegroundColor Yellow
}

if (Test-Path "backend/.env") {
    Write-Host "✅ Backend environment file exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend environment file missing. Run: Copy-Item env.backend.example -Destination backend/.env" -ForegroundColor Yellow
}

# Try to compile TypeScript
Write-Host "Checking TypeScript compilation..." -ForegroundColor Yellow
Push-Location frontend
$frontendCompile = & pnpm run type-check 2>&1
Pop-Location

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend TypeScript compiles successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend TypeScript has compilation issues" -ForegroundColor Yellow
}

Push-Location backend
$backendCompile = & pnpm run build 2>&1
Pop-Location

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend TypeScript compiles successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend TypeScript has compilation issues" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Setup verification completed!" -ForegroundColor Green
Write-Host ""
Write-Host "To start development:" -ForegroundColor Cyan
Write-Host "1. Configure your .env files with real API keys" -ForegroundColor White
Write-Host "2. Run 'pnpm run dev' to start both servers" -ForegroundColor White
Write-Host "3. Visit http://localhost:3000" -ForegroundColor White
