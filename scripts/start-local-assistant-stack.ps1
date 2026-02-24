param(
    [string]$ProjectRoot = (Resolve-Path "$PSScriptRoot\..").Path
)

$memoryDir = Join-Path $ProjectRoot "services\memory-service"
$scrapeDir = Join-Path $ProjectRoot "services\scrape-service"
$scrapePy = Join-Path $scrapeDir ".venv\Scripts\python.exe"

if (-not (Test-Path $scrapePy)) {
    Write-Host "Scrape service venv not found. Run setup first:"
    Write-Host "  cd services/scrape-service"
    Write-Host "  python -m venv .venv"
    Write-Host "  .venv\Scripts\python -m pip install -r requirements.txt"
    exit 1
}

Write-Host "Starting memory service on :8081 ..."
$memoryProc = Start-Process -FilePath "go" -ArgumentList "run ." -WorkingDirectory $memoryDir -PassThru

Write-Host "Starting scrape service on :8082 ..."
$scrapeProc = Start-Process -FilePath $scrapePy -ArgumentList "-m","uvicorn","app:app","--host","127.0.0.1","--port","8082" -WorkingDirectory $scrapeDir -PassThru

Write-Host "memory PID: $($memoryProc.Id)"
Write-Host "scrape PID: $($scrapeProc.Id)"
Write-Host "Press Enter to stop both services."
[void][System.Console]::ReadLine()

if ($memoryProc -and -not $memoryProc.HasExited) {
    Stop-Process -Id $memoryProc.Id -Force
}
if ($scrapeProc -and -not $scrapeProc.HasExited) {
    Stop-Process -Id $scrapeProc.Id -Force
}
