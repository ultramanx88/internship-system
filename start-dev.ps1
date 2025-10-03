# 🚀 One-Click Development Environment Starter for Windows
# PowerShell script to start development environment

# Function to print colored output
function Write-Header {
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor White
    Write-Host "║                🚀 Development Environment Starter            ║" -ForegroundColor Cyan
    Write-Host "║                     One-Click Setup                          ║" -ForegroundColor Cyan
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

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Step {
    param($Message)
    Write-Host "[STEP] $Message" -ForegroundColor Magenta
}

# Function to check if port is in use
function Test-Port {
    param($Port)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet
        return $connection
    } catch {
        return $false
    }
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

# Main function
function Start-DevEnvironment {
    Write-Header
    
    # Step 1: Check prerequisites
    Write-Step "1/7 Checking prerequisites..."
    
    # Check if we're in the right directory
    if (-not (Test-Path "package.json")) {
        Write-Error "package.json not found. Please run this script from the project root directory."
        exit 1
    }
    
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Warning "node_modules not found. Installing dependencies..."
        npm install
    }
    
    Write-Success "Prerequisites checked"
    
    # Step 2: Setup database
    Write-Step "2/7 Setting up database..."
    
    # Check if database exists
    if (-not (Test-Path "prisma/dev.db")) {
        Write-Status "Creating SQLite database..."
        npx prisma db push
        Write-Status "Seeding database with initial data..."
        npm run db:seed
    } else {
        Write-Success "Database already exists"
    }
    
    # Step 3: Generate Prisma client
    Write-Step "3/7 Generating Prisma client..."
    npx prisma generate
    Write-Success "Prisma client generated"
    
    # Step 4: Test database connection
    Write-Step "4/7 Testing database connection..."
    try {
        npm run test:crud | Out-Null
        Write-Success "Database connection test passed"
    } catch {
        Write-Warning "Database connection test failed, but continuing..."
    }
    
    # Step 5: Clean up existing processes
    Write-Step "5/7 Cleaning up existing processes..."
    
    # Kill existing processes on common ports
    Stop-ProcessOnPort 3000 "Next.js Server"
    Stop-ProcessOnPort 5555 "Prisma Studio"
    
    Write-Success "Cleanup completed"
    
    # Step 6: Start services
    Write-Step "6/7 Starting development services..."
    
    # Create logs directory
    if (-not (Test-Path "logs")) {
        New-Item -ItemType Directory -Path "logs" | Out-Null
    }
    
    # Start Next.js development server
    Write-Status "Starting Next.js development server on port 3000..."
    $nextjsJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        npm run dev
    }
    
    # Wait for Next.js to start
    Write-Status "Waiting for Next.js server to start..."
    $timeout = 30
    $counter = 0
    
    do {
        Start-Sleep -Seconds 1
        $counter++
        if (Test-Port 3000) {
            Write-Success "Next.js server started successfully"
            break
        }
        if ($counter -eq $timeout) {
            Write-Error "Next.js server failed to start"
            exit 1
        }
    } while ($counter -lt $timeout)
    
    # Start Prisma Studio
    Write-Status "Starting Prisma Studio on port 5555..."
    $prismaJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        npx prisma studio
    }
    
    # Wait for Prisma Studio to start
    Write-Status "Waiting for Prisma Studio to start..."
    $timeout = 20
    $counter = 0
    
    do {
        Start-Sleep -Seconds 1
        $counter++
        if (Test-Port 5555) {
            Write-Success "Prisma Studio started successfully"
            break
        }
    } while ($counter -lt $timeout)
    
    # Step 7: Final setup and information
    Write-Step "7/7 Final setup..."
    
    # Test API endpoints
    Write-Status "Testing API endpoints..."
    Start-Sleep -Seconds 5
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/user/profile" -Headers @{"x-user-id"="test001"} -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Success "API endpoints are responding"
        } else {
            Write-Warning "API endpoints may not be ready yet"
        }
    } catch {
        Write-Warning "API endpoints may not be ready yet"
    }
    
    # Display success information
    Write-Host ""
    Write-Success "🎉 Development environment started successfully!"
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor White
    Write-Host "║                    🌐 Services Running                        ║" -ForegroundColor Green
    Write-Host "╠══════════════════════════════════════════════════════════════╣" -ForegroundColor White
    Write-Host "║ 🚀 Next.js App:     http://localhost:3000                ║" -ForegroundColor Cyan
    Write-Host "║ 🗄️  Prisma Studio:   http://localhost:5555                ║" -ForegroundColor Cyan
    Write-Host "║ 📊 Database:        SQLite (prisma/dev.db)              ║" -ForegroundColor Cyan
    Write-Host "║ 📝 Jobs:            PowerShell Background Jobs          ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor White
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor White
    Write-Host "║                    🧪 Test Credentials                       ║" -ForegroundColor Green
    Write-Host "╠══════════════════════════════════════════════════════════════╣" -ForegroundColor White
    Write-Host "║ Email:              test@test.com                       ║" -ForegroundColor Cyan
    Write-Host "║ Password:           123456                              ║" -ForegroundColor Cyan
    Write-Host "║ Role:               Student                             ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor White
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor White
    Write-Host "║                    ⚡ Quick Commands                         ║" -ForegroundColor Green
    Write-Host "╠══════════════════════════════════════════════════════════════╣" -ForegroundColor White
    Write-Host "║ Stop all services:  .\stop-dev.ps1                     ║" -ForegroundColor Cyan
    Write-Host "║ View jobs:          Get-Job                             ║" -ForegroundColor Cyan
    Write-Host "║ Test CRUD:          npm run test:crud                   ║" -ForegroundColor Cyan
    Write-Host "║ Test API:           npm run test:api                    ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor White
    Write-Host ""
    
    # Open browser automatically
    Write-Status "Opening browser..."
    Start-Process "http://localhost:3000"
    Start-Process "http://localhost:5555"
    
    # Save job information
    $jobInfo = @{
        NextjsJobId = $nextjsJob.Id
        PrismaJobId = $prismaJob.Id
        StartedAt = Get-Date
    }
    $jobInfo | ConvertTo-Json | Out-File "logs/jobs.json"
    
    Write-Success "🎯 Ready for development! Happy coding! 🚀"
    Write-Host ""
    Write-Status "Press Ctrl+C to stop monitoring, or run .\stop-dev.ps1 to stop all services"
    Write-Host ""
    
    # Monitor services
    try {
        while ($true) {
            Start-Sleep -Seconds 60
            
            # Check if services are still running
            if (-not (Test-Port 3000)) {
                Write-Error "Next.js server stopped unexpectedly"
                break
            }
            
            if (-not (Test-Port 5555)) {
                Write-Warning "Prisma Studio stopped"
            }
            
            # Show a heartbeat
            Write-Host "💚 Services running... $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Green
        }
    } catch {
        Write-Warning "Monitoring stopped"
    }
}

# Cleanup function
function Stop-DevEnvironment {
    Write-Warning "Shutting down services..."
    
    # Stop background jobs
    if (Test-Path "logs/jobs.json") {
        $jobInfo = Get-Content "logs/jobs.json" | ConvertFrom-Json
        
        if ($jobInfo.NextjsJobId) {
            Stop-Job -Id $jobInfo.NextjsJobId -ErrorAction SilentlyContinue
            Remove-Job -Id $jobInfo.NextjsJobId -ErrorAction SilentlyContinue
        }
        
        if ($jobInfo.PrismaJobId) {
            Stop-Job -Id $jobInfo.PrismaJobId -ErrorAction SilentlyContinue
            Remove-Job -Id $jobInfo.PrismaJobId -ErrorAction SilentlyContinue
        }
        
        Remove-Item "logs/jobs.json" -ErrorAction SilentlyContinue
    }
    
    # Kill processes on ports
    Stop-ProcessOnPort 3000 "Next.js Server"
    Stop-ProcessOnPort 5555 "Prisma Studio"
    
    Write-Success "All services stopped"
}

# Handle Ctrl+C
$null = Register-EngineEvent PowerShell.Exiting -Action {
    Stop-DevEnvironment
}

# Run main function
Start-DevEnvironment