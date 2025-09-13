# SwipeHire Installation Script for Windows PowerShell
Write-Host "🚀 Installing SwipeHire..." -ForegroundColor Green

# Check Node.js version
Write-Host "Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ Node.js not found. Please install Node.js 20+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

$majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
if ($majorVersion -lt 20) {
    Write-Host "❌ Node.js version $nodeVersion found. Please upgrade to Node.js 20+" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js $nodeVersion found" -ForegroundColor Green

# Install pnpm if not exists
Write-Host "Checking pnpm..." -ForegroundColor Yellow
$pnpmVersion = pnpm --version 2>$null
if (-not $pnpmVersion) {
    Write-Host "Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install pnpm" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ pnpm $pnpmVersion found" -ForegroundColor Green
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    Write-Host "Trying with legacy peer deps..." -ForegroundColor Yellow
    pnpm install --legacy-peer-deps
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Installation failed. Please check the error above." -ForegroundColor Red
        exit 1
    }
}

# Copy environment files
Write-Host "Setting up environment files..." -ForegroundColor Yellow

if (-not (Test-Path "frontend\.env.local")) {
    Copy-Item "env.frontend.example" -Destination "frontend\.env.local"
    Write-Host "✅ Created frontend\.env.local" -ForegroundColor Green
} else {
    Write-Host "⚠️  frontend\.env.local already exists" -ForegroundColor Yellow
}

if (-not (Test-Path "backend\.env")) {
    Copy-Item "env.backend.example" -Destination "backend\.env"
    Write-Host "✅ Created backend\.env" -ForegroundColor Green
} else {
    Write-Host "⚠️  backend\.env already exists" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Installation completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Configure your environment variables in:" -ForegroundColor White
Write-Host "   - frontend\.env.local" -ForegroundColor Gray
Write-Host "   - backend\.env" -ForegroundColor Gray
Write-Host "2. Set up external services (Clerk, MongoDB, Cloudinary)" -ForegroundColor White
Write-Host "3. Run 'pnpm run dev' to start the development server" -ForegroundColor White
Write-Host "4. Run 'pnpm run seed' to create sample data" -ForegroundColor White
Write-Host ""
Write-Host "For detailed setup instructions, see README.md" -ForegroundColor Cyan
