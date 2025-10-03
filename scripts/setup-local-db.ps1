# Setup Local Database Script for Windows
Write-Host "🚀 Setting up local database..." -ForegroundColor Blue

# Function to print colored output
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

# Check if PostgreSQL is installed
Write-Status "Checking PostgreSQL installation..."
try {
    $pgVersion = psql --version
    Write-Success "PostgreSQL is installed: $pgVersion"
} catch {
    Write-Error "PostgreSQL is not installed"
    Write-Status "Please install PostgreSQL from: https://www.postgresql.org/download/windows/"
    Write-Status "Or use Docker: docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15"
    exit 1
}

# Create database
Write-Status "Creating database..."
$DB_NAME = "internship_system_dev"

try {
    # Check if database exists
    $dbExists = psql -lqt | Select-String $DB_NAME
    if ($dbExists) {
        Write-Warning "Database '$DB_NAME' already exists"
    } else {
        createdb $DB_NAME
        Write-Success "Database '$DB_NAME' created successfully"
    }
} catch {
    Write-Error "Failed to create database '$DB_NAME'"
    exit 1
}

# Test database connection
Write-Status "Testing database connection..."
try {
    psql -d $DB_NAME -c "SELECT version();" | Out-Null
    Write-Success "Database connection successful"
} catch {
    Write-Error "Database connection failed"
    exit 1
}

# Run Prisma commands
Write-Status "Setting up Prisma..."

# Generate Prisma client
Write-Status "Generating Prisma client..."
try {
    npx prisma generate
    Write-Success "Prisma client generated"
} catch {
    Write-Error "Failed to generate Prisma client"
    exit 1
}

# Push database schema
Write-Status "Pushing database schema..."
try {
    npx prisma db push
    Write-Success "Database schema pushed"
} catch {
    Write-Error "Failed to push database schema"
    exit 1
}

# Seed database
Write-Status "Seeding database..."
try {
    npm run db:seed
    Write-Success "Database seeded successfully"
} catch {
    Write-Warning "Database seeding failed or no seed script found"
}

# Final status
Write-Success "Local database setup completed!"
Write-Status "Database URL: postgresql://postgres@localhost:5432/$DB_NAME"
Write-Status "You can now run: npm run dev"
Write-Status "To manage database: npm run db:studio"

Write-Host ""
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host "📊 Next steps:" -ForegroundColor Blue
Write-Host "   1. Run 'npm run dev' to start the development server"
Write-Host "   2. Run 'npm run db:studio' to open Prisma Studio"
Write-Host "   3. Check your application at http://localhost:3000"