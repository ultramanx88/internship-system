# 🚀 One-Click Development Environment

## 🎯 Overview
สคริปต์คลิกเดียวสำหรับเริ่มต้น development environment แบบเรียลไทม์ พร้อมทั้ง Next.js server และ Prisma Studio

## 🖱️ One-Click Start

### สำหรับ macOS/Linux:
```bash
# วิธีที่ 1: รันสคริปต์โดยตรง
./start-dev.sh

# วิธีที่ 2: ใช้ npm command
npm run start:dev

# วิธีที่ 3: Double-click ไฟล์ start-dev.sh ใน Finder
```

### สำหรับ Windows:
```powershell
# วิธีที่ 1: รันใน PowerShell
.\start-dev.ps1

# วิธีที่ 2: ใช้ npm command
npm run start:dev:win

# วิธีที่ 3: Right-click start-dev.ps1 → "Run with PowerShell"
```

## 🛑 One-Click Stop

### สำหรับ macOS/Linux:
```bash
# วิธีที่ 1: รันสคริปต์โดยตรง
./stop-dev.sh

# วิธีที่ 2: ใช้ npm command
npm run stop:dev

# วิธีที่ 3: กด Ctrl+C ในหน้าต่างที่รัน start-dev.sh
```

### สำหรับ Windows:
```powershell
# วิธีที่ 1: รันใน PowerShell
.\stop-dev.ps1

# วิธีที่ 2: ใช้ npm command
npm run stop:dev:win

# วิธีที่ 3: กด Ctrl+C ในหน้าต่างที่รัน start-dev.ps1
```

## 🎉 สิ่งที่สคริปต์ทำให้คุณ

### ✅ การตั้งค่าอัตโนมัติ:
1. **ตรวจสอบ Prerequisites** - Node.js, dependencies
2. **ตั้งค่าฐานข้อมูล** - สร้าง SQLite database และ seed ข้อมูล
3. **Generate Prisma Client** - สร้าง Prisma client ใหม่
4. **ทดสอบการเชื่อมต่อ** - ตรวจสอบ database connection
5. **ล้างกระบวนการเก่า** - หยุด processes ที่รันอยู่
6. **เริ่มต้นบริการ** - รัน Next.js และ Prisma Studio
7. **เปิดเบราว์เซอร์** - เปิด localhost:3000 และ localhost:5555 อัตโนมัติ

### 🌐 Services ที่เริ่มต้น:
- **Next.js Development Server** - http://localhost:3000
- **Prisma Studio** - http://localhost:5555
- **SQLite Database** - prisma/dev.db
- **Real-time CRUD** - API endpoints พร้อมใช้งาน

### 🧪 Test Credentials:
- **Email:** test@test.com
- **Password:** 123456
- **Role:** Student

## 📊 การตรวจสอบสถานะ

### ขณะที่ระบบทำงาน:
- สคริปต์จะแสดงสถานะทุก 1 นาที
- แสดง heartbeat: `💚 Services running... HH:MM:SS`
- ตรวจสอบว่า services ยังทำงานอยู่

### Log Files:
```
logs/
├── nextjs.log          # Next.js server logs
├── prisma-studio.log   # Prisma Studio logs
├── nextjs.pid          # Next.js process ID
├── prisma.pid          # Prisma process ID
└── processes.env       # Process information
```

## 🔧 Quick Commands

### ขณะที่ระบบทำงาน:
```bash
# ดู logs แบบ real-time
tail -f logs/nextjs.log

# ทดสอบ CRUD operations
npm run test:crud

# ทดสอบ API endpoints
npm run test:api

# ทดสอบทั้งหมด
npm run test:all

# ตรวจสอบ ports
lsof -i :3000
lsof -i :5555
```

## 🚨 Troubleshooting

### ปัญหาที่พบบ่อย:

#### 1. Port Already in Use
```
Error: Port 3000 is already in use
```
**แก้ไข:** สคริปต์จะหยุด processes เก่าอัตโนมัติ หรือรัน `./stop-dev.sh`

#### 2. Permission Denied (macOS/Linux)
```
Permission denied: ./start-dev.sh
```
**แก้ไข:**
```bash
chmod +x start-dev.sh stop-dev.sh
```

#### 3. PowerShell Execution Policy (Windows)
```
Execution of scripts is disabled on this system
```
**แก้ไข:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 4. Database Connection Error
```
Error: database "dev.db" does not exist
```
**แก้ไข:** สคริปต์จะสร้าง database อัตโนมัติ หรือรัน:
```bash
npx prisma db push
npm run db:seed
```

#### 5. Node Modules Missing
```
Error: Cannot find module
```
**แก้ไข:** สคริปต์จะติดตั้ง dependencies อัตโนมัติ หรือรัน:
```bash
npm install
```

### การตรวจสอบสถานะ:

#### ตรวจสอบ Services:
```bash
# macOS/Linux
lsof -i :3000  # Next.js
lsof -i :5555  # Prisma Studio

# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5555
```

#### ตรวจสอบ Database:
```bash
# ตรวจสอบไฟล์ database
ls -la prisma/dev.db

# เชื่อมต่อ database
npx prisma studio
```

## 🎯 การใช้งานจริง

### 1. เริ่มต้น Development:
```bash
./start-dev.sh
```

### 2. เปิดเบราว์เซอร์:
- **Application:** http://localhost:3000
- **Database Admin:** http://localhost:5555

### 3. Login และทดสอบ:
- ใช้ credentials ที่ให้ไว้
- ทดสอบ CRUD operations
- ตรวจสอบการเปลี่ยนแปลงใน Prisma Studio

### 4. Development Workflow:
- แก้ไขโค้ด → เห็นผลทันทีใน browser
- เปลี่ยนข้อมูล → เห็นใน Prisma Studio
- ทดสอบ API → ใช้ `npm run test:api`

### 5. หยุดการทำงาน:
```bash
./stop-dev.sh
```

## 🚀 Advanced Usage

### Custom Configuration:
```bash
# เปลี่ยน port (แก้ไขใน start-dev.sh)
PORT=4000 ./start-dev.sh

# รันเฉพาะ Next.js
npm run dev

# รันเฉพาะ Prisma Studio
npm run db:studio
```

### Development Tips:
1. **Hot Reload** - Next.js จะ reload อัตโนมัติเมื่อแก้ไขโค้ด
2. **Database Changes** - ใช้ Prisma Studio เพื่อดูการเปลี่ยนแปลง
3. **API Testing** - ใช้ browser หรือ Postman ทดสอบ API
4. **Real-time Updates** - การเปลี่ยนแปลงจะเห็นผลทันที

## 📈 Performance Monitoring

### Resource Usage:
```bash
# ตรวจสอบ CPU และ Memory
top -p $(cat logs/nextjs.pid)
top -p $(cat logs/prisma.pid)

# ตรวจสอบ Database Size
du -h prisma/dev.db
```

### Response Time:
```bash
# ทดสอบ API response time
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3000/api/user/profile" -H "x-user-id: test001"
```

## 🎉 Success Indicators

เมื่อทุกอย่างทำงานถูกต้อง คุณจะเห็น:

✅ **Console Output:**
```
🎉 Development environment started successfully!
🚀 Next.js App:     http://localhost:3000
🗄️  Prisma Studio:   http://localhost:5555
💚 Services running... HH:MM:SS
```

✅ **Browser:**
- localhost:3000 แสดงหน้า login
- localhost:5555 แสดง Prisma Studio

✅ **Database:**
- ไฟล์ prisma/dev.db มีขนาด > 0
- Prisma Studio แสดงตารางและข้อมูล

✅ **API:**
- API endpoints ตอบกลับ status 200
- CRUD operations ทำงานได้

🎯 **Ready for Development!** 🚀