const { AdvancedScraper, log } = require('./scraper.js');
const args = process.argv.slice(2)

if (args.length === 0 || args.includes('--help')) {
 console.log(`
  ====== MENU BANTUAN ====

 cara penggunaan: node index.js <url yg lu ingin masukin> <options>

 options:
 --puppeteer		untuk menggunakan puppeteer
 --save			untuk menyimpan hasil ke file
 --output <file>	nama file output

 --selectors <json>	selector JSON

 --help			untuk menampilkan menu bantuan

 contoh:
 node index.js https://kontol-anjing.com
 node index.js https://setneg.go.id/baca/index/berita --selectors '{"links":{"selector":"a","attribute":"href"}}'
 
 node index.js https://setneg.go.id/baca/index/berita --save --output kontol.json
 `);
  process.exit(0);
}


async function main() {
  const url = args[0];
  const options = {
   saveToFile: args.includes('--save'),
   filename: null
  };

  const selectorsIndex = args.indexOf('--selectors');
  if (selectorsIndex !== - 1 && args[selectorsIndex + 1]) {
    try {
      options.selectors = JSON.parse(args[selectorsIndex + 1]);
     } catch(e) {
  	log('invalid selector JSON', 'error');
	process.exit(1);
     }
  }
  const outputIndex = args.indexOf('--output');
  if (outputIndex !== - 1 && args[outputIndex + 1]) {
    options.filename = args[outputIndex + 1];
  }
  const scraper = new AdvancedScraper();
  try {
   const result = await scraper.scrape(url, options);
   console.log('\n---- HASIL SCRAPE ----');
   console.log(JSON.stringify(result, null, 2));
   console.log('#'.repeat(100));
   console.log('tugas done');
  } catch(error) {
    log(`proses scrape gagal: ${error.message}`, 'error');
    process.exit(1);
  }
}

main();
