# PowerShell script to fix useEffect infinite loop

$phoneSignIn = "components\auth\phone-sign-in.tsx"
$phoneSignUp = "components\auth\phone-sign-up.tsx"

Write-Host "Fixing useEffect infinite loops..." -ForegroundColor Cyan

# Fix phone-sign-in.tsx
if (Test-Path $phoneSignIn) {
    $content = Get-Content $phoneSignIn -Raw
    $content = $content -replace '}, \[setupRecaptcha\]\);', '}, []);'
    $content | Set-Content $phoneSignIn -NoNewline
    Write-Host "Fixed: phone-sign-in.tsx" -ForegroundColor Green
}
else {
    Write-Host "File not found: $phoneSignIn" -ForegroundColor Red
}

# Fix phone-sign-up.tsx  
if (Test-Path $phoneSignUp) {
    $content = Get-Content $phoneSignUp -Raw
    $content = $content -replace '}, \[setupRecaptcha\]\);', '}, []);'
    $content | Set-Content $phoneSignUp -NoNewline
    Write-Host "Fixed: phone-sign-up.tsx" -ForegroundColor Green
}
else {
    Write-Host "File not found: $phoneSignUp" -ForegroundColor Red
}

Write-Host ""
Write-Host "Done! useEffect dependencies fixed." -ForegroundColor Green
Write-Host "This will prevent infinite loops and rate limiting." -ForegroundColor Yellow
