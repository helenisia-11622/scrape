const CONFIG = {
   timeout: 30000,
   userAgent: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, Like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
   retry: 3,
   retryDelay: 2000,
   outputDir: './result',
   defaultSelectors: {
     title: 'title',
     heading: 'h1',
     paragraphs: 'p'
   }
};

function ensureOutputDir() {
   const fs = require('fs')
    if (!fs.existsSync(CONFIG.outputDir)) {
       fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }
}

module.exports = { CONFIG, ensureOutputDir };
