# Script pour initialiser manuellement la base de données d'une instance
# Usage: npm run init-db

Write-Host "Initializing database for LogicAI instance..." -ForegroundColor Cyan

$INSTANCE_ID = $env:INSTANCE_ID
if (-not $INSTANCE_ID) {
    $INSTANCE_ID = "default-instance"
    Write-Host "INSTANCE_ID not set, using default: $INSTANCE_ID" -ForegroundColor Yellow
}

$DB_PATH = ".\prisma\instance-$INSTANCE_ID.db"
$DB_DIR = Split-Path -Parent $DB_PATH

# Creer le dossier s'il n'existe pas
if (-not (Test-Path $DB_DIR)) {
    New-Item -ItemType Directory -Path $DB_DIR -Force | Out-Null
    Write-Host "Created directory: $DB_DIR" -ForegroundColor Green
}

# Creer le fichier de base de donnees vide s'il n'existe pas
if (-not (Test-Path $DB_PATH)) {
    New-Item -ItemType File -Path $DB_PATH -Force | Out-Null
    Write-Host "Created database file: $DB_PATH" -ForegroundColor Green
}

# Appliquer les migrations
Write-Host "Pushing database schema..." -ForegroundColor Cyan
$env:DATABASE_URL = "file:$DB_PATH"
npx prisma db push --skip-generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database initialized successfully for instance: $INSTANCE_ID" -ForegroundColor Green
    Write-Host "   Database path: $DB_PATH" -ForegroundColor Gray
} else {
    Write-Host "Failed to initialize database" -ForegroundColor Red
    exit 1
}
