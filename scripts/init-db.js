const fs = require('fs');
const path = require('path');

// Create data directory if it doesn't exist
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Import and run initialization
const { initializeDatabase } = require('./lib/db.ts');

(async () => {
  try {
    await initializeDatabase();
    console.log('✓ Database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Failed to initialize database:', error);
    process.exit(1);
  }
})();
