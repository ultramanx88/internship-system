# 🛑 Stop Development Environment Script for Windows
# PowerShell script to stop development environment

function Write-Header {
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor White
    Write-Host "║                🛑 Stopping Development Environment           ║" -ForegroundColor Red
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor White
}

function Write-Status {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

# Function to kill process on port
function Stop-ProcessOnPort {
    param($Port, $ServiceName)
    
    try {
        $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        
        if ($processes) {
            foreach ($pid in $processes) {
                Write-Status "Stopping $ServiceName (PID: $pid) on port $Port"
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
            Write-Success "$ServiceName stopped"
        } else {
            Write-Status "$ServiceName is not running on port $Port"
        }
    } catch {
        Write-Warning "Could not stop process on port $Port"
    }
}

function Stop-DevEnvironment {
    Write-Header
    
    Write-Status "Stopping all development services..."
    
    # Stop background jobs first
    if (Test-Path "logs/jobs.json") {
        try {
            $jobInfo = Get-Content "logs/jobs.json" | ConvertFrom-Json
            
            Write-Status "Stopping background jobs..."
            
            if ($jobInfo.NextjsJobId) {
                Stop-Job -Id $jobInfo.NextjsJobId -ErrorAction SilentlyContinue
                Remove-Job -Id $jobInfo.NextjsJobId -ErrorAction SilentlyContinue
                Write-Success "Next.js job stopped"
            }
            
            if ($jobInfo.PrismaJobId) {
                Stop-Job -Id $jobInfo.PrismaJobId -ErrorAction SilentlyContinue
                Remove-Job -Id $jobInfo.PrismaJobId -ErrorAction SilentlyContinue
                Write-Success "Prisma Studio job stopped"
            }
            
            Remove-Item "logs/jobs.json" -ErrorAction SilentlyContinue
        } catch {
            Write-Warning "Could not read job information"
        }
    }
    
    # Stop all PowerShell background jobs
    Write-Status "Stopping all background jobs..."
    Get-Job | Stop-Job -ErrorAction SilentlyContinue
    Get-Job | Remove-Job -ErrorAction SilentlyContinue
    
    # Stop services by port
    Stop-ProcessOnPort 3000 "Next.js Server"
    Stop-ProcessOnPort 5555 "Prisma Studio"
    
    # Kill any Node.js processes that might be related
    Write-Status "Cleaning up any remaining Node.js processes..."
    
    try {
        Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
            $_.CommandLine -like "*next dev*" -or $_.CommandLine -like "*prisma studio*"
        } | Stop-Process -Force -ErrorAction SilentlyContinue
    } catch {
        # Ignore errors
    }
    
    # Clean up log files
    if (Test-Path "logs") {
        Write-Status "Cleaning up log files..."
        
        # Archive old logs
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        
        if (Test-Path "logs/nextjs.log") {
            Move-Item "logs/nextjs.log" "logs/nextjs_$timestamp.log" -ErrorAction SilentlyContinue
        }
        
        if (Test-Path "logs/prisma-studio.log") {
            Move-Item "logs/prisma-studio.log" "logs/prisma-studio_$timestamp.log" -ErrorAction SilentlyContinue
        }
    }
    
    # Final verification
    Start-Sleep -Seconds 2
    
    $nextjsRunning = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -ErrorAction SilentlyContinue
    $prismaRunning = Test-NetConnection -ComputerName localhost -Port 5555 -InformationLevel Quiet -ErrorAction SilentlyContinue
    
    if (-not $nextjsRunning -and -not $prismaRunning) {
        Write-Host ""
        Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor White
        Write-Host "║                ✅ All Services Stopped Successfully          ║" -ForegroundColor Green
        Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor White
        Write-Host ""
        Write-Success "🎯 Development environment stopped cleanly"
        Write-Status "💡 To start again, run: .\start-dev.ps1"
    } else {
        Write-Host ""
        Write-Warning "Some services may still be running:"
        if ($nextjsRunning) {
            Write-Warning "- Next.js server still running on port 3000"
        }
        if ($prismaRunning) {
            Write-Warning "- Prisma Studio still running on port 5555"
        }
        Write-Host ""
        Write-Status "💡 You may need to manually kill remaining processes"
    }
    
    Write-Host ""
    Write-Status "📊 Port status:"
    $port3000Status = if (Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -ErrorAction SilentlyContinue) { "OCCUPIED" } else { "FREE" }
    $port5555Status = if (Test-NetConnection -ComputerName localhost -Port 5555 -InformationLevel Quiet -ErrorAction SilentlyContinue) { "OCCUPIED" } else { "FREE" }
    
    Write-Host "Port 3000: $port3000Status" -ForegroundColor Blue
    Write-Host "Port 5555: $port5555Status" -ForegroundColor Blue
}

Stop-DevEnvironment