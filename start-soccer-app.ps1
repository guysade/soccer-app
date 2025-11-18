# Soccer Team Maker Launcher
Write-Host "Starting Soccer Team Maker..." -ForegroundColor Green
Write-Host ""

# Set the project directory
$projectDir = "C:\Users\guysa\Documents\Soccer-app\soccer-team-maker"
Set-Location $projectDir

try {
    # Start the development server in a new window
    Write-Host "Starting development server..." -ForegroundColor Yellow
    $serverProcess = Start-Process -FilePath "cmd" -ArgumentList "/c", "npm start" -WindowStyle Minimized -PassThru
    
    # Wait for server to start
    Write-Host "Waiting for server to initialize..." -ForegroundColor Yellow
    Start-Sleep -Seconds 8
    
    # Try to open Chrome, fallback to default browser
    Write-Host "Opening Soccer Team Maker in browser..." -ForegroundColor Yellow
    $chromeFound = $false
    
    # Common Chrome installation paths
    $chromePaths = @(
        "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
        "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
        "${env:LOCALAPPDATA}\Google\Chrome\Application\chrome.exe"
    )
    
    foreach ($path in $chromePaths) {
        if (Test-Path $path) {
            Start-Process -FilePath $path -ArgumentList "http://localhost:3000"
            $chromeFound = $true
            break
        }
    }
    
    if (-not $chromeFound) {
        # Fallback to default browser
        Write-Host "Chrome not found, using default browser..." -ForegroundColor Yellow
        Start-Process "http://localhost:3000"
    }
    
    Write-Host ""
    Write-Host "Soccer Team Maker is now running!" -ForegroundColor Green
    Write-Host "Server PID: $($serverProcess.Id)" -ForegroundColor Cyan
    Write-Host "URL: http://localhost:3000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press any key to stop the server and exit..." -ForegroundColor Red
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    # Stop the server process
    Write-Host "Stopping server..." -ForegroundColor Yellow
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Host "Server stopped." -ForegroundColor Green
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Make sure Node.js and npm are installed and the project dependencies are installed."
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}