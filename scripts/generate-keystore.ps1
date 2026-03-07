# ============================================================
# Sketchbyte — Keystore Generator
# ============================================================
# Run this script ONCE to generate your Android signing keystore.
# The keystore is used to sign the APK — keep it safe forever!
#
# HOW TO RUN:
#   Right-click this file → "Run with PowerShell"
#   OR in a terminal: .\scripts\generate-keystore.ps1
# ============================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Sketchbyte Keystore Generator" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if keytool is available (comes with Java)
if (-not (Get-Command keytool -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: keytool not found. Make sure Java is installed and in PATH." -ForegroundColor Red
    exit 1
}

$keystorePath = ".\sketchbyte.keystore"
$keyAlias     = "sketchbyte"

# Prompt for passwords
$keystorePassword = Read-Host "Enter a KEYSTORE password (min 6 chars, save this!)" -AsSecureString
$keyPassword      = Read-Host "Enter a KEY password (min 6 chars, can be same as above)" -AsSecureString

# Convert SecureString to plain text for keytool
$ksPass  = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($keystorePassword))
$keyPass = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($keyPassword))

Write-Host ""
Write-Host "Generating keystore..." -ForegroundColor Yellow

# Generate keystore using keytool
& keytool -genkeypair `
    -v `
    -keystore $keystorePath `
    -alias $keyAlias `
    -keyalg RSA `
    -keysize 2048 `
    -validity 10000 `
    -storepass $ksPass `
    -keypass $keyPass `
    -dname "CN=Sketchbyte, OU=Mobile, O=Sketchbyte, L=India, ST=Karnataka, C=IN"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Keystore generation failed." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Keystore generated: $keystorePath" -ForegroundColor Green
Write-Host ""

# Encode to Base64 for GitHub Secret
Write-Host "Encoding keystore to Base64 (for GitHub Secret)..." -ForegroundColor Yellow
$base64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes((Resolve-Path $keystorePath)))

# Save to file for easy copy-paste
$base64 | Out-File -FilePath ".\keystore-base64.txt" -Encoding ASCII -NoNewline
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DONE! Next steps:" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "1. Go to your GitHub repo → Settings → Secrets → Actions" -ForegroundColor White
Write-Host "2. Add these 4 secrets:" -ForegroundColor White
Write-Host ""
Write-Host "   KEYSTORE_BASE64  →  copy from keystore-base64.txt" -ForegroundColor Cyan
Write-Host "   KEY_ALIAS        →  sketchbyte" -ForegroundColor Cyan
Write-Host "   KEYSTORE_PASSWORD → <the password you entered>" -ForegroundColor Cyan
Write-Host "   KEY_PASSWORD     → <the key password you entered>" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Push a version tag to trigger the APK build:" -ForegroundColor White
Write-Host "   git tag v1.0.0" -ForegroundColor Yellow
Write-Host "   git push origin v1.0.0" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  IMPORTANT: Never commit sketchbyte.keystore or keystore-base64.txt to Git!" -ForegroundColor Red
Write-Host "   They are already in .gitignore." -ForegroundColor Red
Write-Host ""
