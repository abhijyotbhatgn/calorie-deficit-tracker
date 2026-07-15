const fs = require('fs');
const path = require('path');

// Create data directory if it doesn't exist
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'calorie_tracker.json');

const defaultDb = {
  foods: [],
  daily_logs: [],
  health_sync: [],
  frequent_foods: [],
  weekly_summary: [],
};

try {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(defaultDb, null, 2));
    console.log('✓ Local JSON database initialized');
  } else {
    console.log('✓ Local JSON database already exists');
  }
  process.exit(0);
} catch (error) {
  console.error('✗ Failed to initialize local JSON database:', error);
  process.exit(1);
}
