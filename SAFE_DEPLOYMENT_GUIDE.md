# 🚀 Safe Docker Deployment Scripts

## 📋 Overview

Scripts เหล่านี้แก้ปัญหา **container duplication** และ **VPS overfilling** ที่เกิดขึ้นจากการ deploy แบบเดิม

## 🛠️ Scripts Available

### 1. `safe-docker-deploy.sh` - Safe Deployment
**แก้ปัญหา:** สร้าง container ใหม่ทุกครั้ง
**วิธีแก้:** ใช้ `--no-recreate` flag เพื่ออัปเดต container เดิม

```bash
# Deploy แบบปลอดภัย (ไม่สร้าง container ใหม่)
./safe-docker-deploy.sh
```

**Features:**
- ✅ Graceful stop containers
- ✅ No container recreation
- ✅ Auto-migration
- ✅ Health checks
- ✅ API testing

### 2. `docker-manager.sh` - Container Management
**แก้ปัญหา:** จัดการ containers ที่มีอยู่

```bash
# ดูสถานะ containers
./docker-manager.sh status

# ลบ containers ซ้ำ
./docker-manager.sh cleanup

# Restart services แบบปลอดภัย
./docker-manager.sh restart

# ตรวจสอบ containers ซ้ำ
./docker-manager.sh check

# ดู logs
./docker-manager.sh logs
```

### 3. `vps-checker.sh` - VPS Resource Monitor
**แก้ปัญหา:** VPS เต็มจากการ deploy หลายครั้ง

```bash
# ตรวจสอบทรัพยากร VPS
./vps-checker.sh check

# ตรวจสอบความปลอดภัยสำหรับ deploy
./vps-checker.sh safety

# ทำความสะอาด VPS
./vps-checker.sh cleanup

# ดูคำแนะนำ
./vps-checker.sh recommendations
```

## 🚨 ปัญหาที่แก้ไข

### ❌ ปัญหาเดิม:
- สร้าง container ใหม่ทุกครั้ง deploy
- VPS เต็มจาก containers ซ้ำ
- ไม่มีการตรวจสอบทรัพยากร
- ไม่มีการ cleanup

### ✅ วิธีแก้:
- ใช้ `--no-recreate` flag
- ตรวจสอบทรัพยากรก่อน deploy
- Cleanup containers ซ้ำ
- Monitor disk/memory usage

## 📊 การใช้งาน

### ก่อน Deploy:
```bash
# 1. ตรวจสอบ VPS
./vps-checker.sh check

# 2. ทำความสะอาดถ้าจำเป็น
./vps-checker.sh cleanup
```

### Deploy:
```bash
# 3. Deploy แบบปลอดภัย
./safe-docker-deploy.sh
```

### หลัง Deploy:
```bash
# 4. ตรวจสอบ containers
./docker-manager.sh status

# 5. ดู logs ถ้ามีปัญหา
./docker-manager.sh logs
```

## 🔍 Monitoring

### Resource Limits:
- **Disk Usage:** < 80% (Warning: > 85%)
- **Memory Usage:** < 85% (Warning: > 90%)
- **Container Count:** < 10 (Warning: > 10)

### Safety Checks:
- ✅ Disk space available
- ✅ Memory available
- ✅ No duplicate containers
- ✅ Services running properly
- ✅ API endpoints responding

## 🛡️ Best Practices

1. **Always check VPS resources before deploying**
2. **Use safe-docker-deploy.sh instead of regular docker-deploy**
3. **Monitor container count and resource usage**
4. **Clean up unused Docker resources regularly**
5. **Test API endpoints after deployment**

## 🆘 Troubleshooting

### VPS Full:
```bash
./vps-checker.sh cleanup
```

### Duplicate Containers:
```bash
./docker-manager.sh cleanup
```

### Services Not Starting:
```bash
./docker-manager.sh logs
./docker-manager.sh restart
```

### API Not Responding:
```bash
./docker-manager.sh status
./vps-checker.sh check
```

## 📞 Support

หากมีปัญหา:
1. ตรวจสอบ VPS resources: `./vps-checker.sh check`
2. ตรวจสอบ containers: `./docker-manager.sh status`
3. ดู logs: `./docker-manager.sh logs`
4. ทำความสะอาด: `./vps-checker.sh cleanup`
