#!/usr/bin/env tsx
/**
 * Log Cleanup Script
 * Runs daily to clean up old logs based on retention policies
 */

import { enhancedLogger } from '../src/lib/enhanced-logger';
import { backupService } from '../src/lib/backup-service';
import { pdpaService } from '../src/lib/pdpa-service';

async function main() {
  console.log('🧹 Starting log cleanup process...');
  
  try {
    // Cleanup old logs
    console.log('📝 Cleaning up old logs...');
    await enhancedLogger.cleanupOldLogs();
    
    // Schedule automatic backups
    console.log('💾 Scheduling automatic backups...');
    await backupService.scheduleBackups();
    
    // Initialize PDPA default rules if not exists
    console.log('🛡️ Initializing PDPA rules...');
    await pdpaService.initializeDefaultRules();
    
    console.log('✅ Log cleanup process completed successfully');
  } catch (error) {
    console.error('❌ Log cleanup process failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { main as cleanupLogs };
