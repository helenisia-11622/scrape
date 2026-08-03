const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const puppeteer = require('puppeteer-core');
const { CONFIG, ensureOutputDir } = require('./config.js');

ensureOutputDir()

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function log(messages, type = 'info') {
   const timestamp = new Date().toISOString();
   const prefix = {
    info: '📘',
    success: '✅',
    error: '❎🖕🖕',
    warning: '⚠️❗'
   }[type] || '📘';

  console.log(`${prefix} [${timestamp}] ${messages}`);
}


class HttpScraper {
  constructor() {
    this.axios = axios.create({
      timeout: CONFIG.timeout,
      headers: {
       'User-Agent': CONFIG.userAgent
      }
    });
  }

  async fetchHTML(url, retries = CONFIG.retry) {
    try {
     log(`sedang mengambil: ${url}`);
     const response = await this.axios.get(url);
     return response.data;
    } catch(error) {
     if(retries > 0) {
       log(`Retry ${CONFIG.retry - retries + 1}/${CONFIG.retry}`, 'warning');
        await delay(CONFIG.retryDelay);
        return this.fetchHTML(url, retries - 1);
     }
      throw new Error(`gagal untuk mengambil ${url}: ${error.message}`);
    }
  }

  async scrapeHTML(html, selectors) {
    const $ = cheerio.load(html);
    const results = {};

    for(const [key, selector] of Object.entries(selectors)) {
     if (typeof selector === 'string') {
        results[key] = $(selector).text().trim();
       } else if (typeof selector === 'object') {
         const elements = $(selector.selector);
         if (selector.attribute) {
          results[key] = elements.map((i, el) => $(el).attr(selector.attribute)).get();
         } else {
           results[key] = elements.map((i, el) => $(el).text().trim()).get();
         }
       }
    }
     return results;
  }

   async scrape(url, selectors) {
    const html = await this.fetchHTML(url);
    return await this.scrapeHTML(html, selectors)
  }

}


class AdvancedScraper {
  constructor() {
     this.httpScraper = new HttpScraper();
     this.cache = new Map();
  }

   saveResults(data, filename = `scrape-${Date.now()}.json`) {
    const path = `${CONFIG.outputDir}/${filename}`;
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
    log(`hasil di simpan ke: ${path}`, 'success');
    return path;
   }
   loadResults(filename) {
     try {
       const path = `${CONFIG.outputDir}/${filename}`;
       return JSON.parse(fs.readFileSync(path, 'utf-8'));
     } catch(error) {
        log(`gagal untuk memuat ke ${filename}: ${error.message}`, 'error');
        return null;
     }
   }
   async scrapeWithCache(url, options = {}) {
      const cacheKey = `${url}_${JSON.stringify(options)}`
      if (this.cache.has(cacheKey)) {
        log(`menggunakan data cache dari: ${url}`, 'info');
        return this.cache.get(cacheKey);
      }
       const result = await this.scrape(url, options);
       this.cache.set(cacheKey, result);
       return result;
   }
   async scrape(url, options = {}) {
    log(`memulai proses scraping: ${url}`, 'info');
    const finalOptions = {
      saveToFile: false,
      filename: null,
      selectors: CONFIG.defaultSelectors,
      ...options
    };
    const result = await this.httpScraper.scrape(url, finalOptions.selectors)
     if (finalOptions.saveToFile) {
      const filename = finalOptions.filename || `scrape-${Date.now()}.json`;
      this.saveResults(result, filename)
     }
    return result;
   }
}

module.exports = { HttpScraper, AdvancedScraper, delay, log };
