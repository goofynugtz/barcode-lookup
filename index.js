const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const puppeteer = require("puppeteer");
// const chromium = require("@sparticuz/chromium");

var execPath;
let browser = null
// chromium.setHeadlessMode = false;
// chromium.setGraphicsMode = false;

const workers = [];

const WEBSITES_TO_SCRAPE = [
  { function: barcodeLoopkupScraper, website: "https://barcodelookup.com" },
]

// Terminate all worker threads
const handleThreadCompletion = (result) => {
  workers.forEach((worker) => {
    if (!worker.terminateScheduled) {
      worker.terminateScheduled = true;
      worker.terminate();
    }
  });
  return result;
};

async function getPath() {
  if (execPath) return execPath;
  execPath = await chromium.executablePath()
  return execPath;
}

async function barcodeLoopkupScraper(ean) {
  const page = await browser.newPage();
  const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36";
  await page.setUserAgent(ua)
  await page.goto(`https://www.barcodelookup.com/${ean}`, { waitUntil: "domcontentloaded" });

  try {
    const productName = await page.$eval("#product > section:nth-child(3) > div:nth-child(1) > div > div > div.col-50.product-details > h4", d => d.innerHTML)
    const brandName = await page.$eval("#product > section:nth-child(3) > div:nth-child(1) > div > div > div.col-50.product-details > div:nth-child(8) > span", d => d.innerHTML)
    const category = await page.$eval("#product > section:nth-child(3) > div:nth-child(1) > div > div > div.col-50.product-details > div:nth-child(7) > span", d => d.innerHTML)
    const description = await page.$eval("#product > section:nth-child(3) > div.light-grey-background > div > div:nth-child(1) > div > div > div > span", d => d.innerHTML)
    const imageURI = await page.$eval("#largeProductImage > img", d => d.src)
    return {
      "product_name": productName,
      "brand": brandName,
      "category": category,
      "description": description,
      "image_uri": imageURI,
    }
  } catch { }
}

async function handler(event) {
  if (!event.ean) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid payload" })
    };
  }
  /* if (!browser){
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await getPath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
  } */
  if (!browser){
    browser = await puppeteer.launch({
      headless: false,
    });
  }

  if (isMainThread) {
    WEBSITES_TO_SCRAPE.forEach((data, index) => {
      const worker = new Worker(__filename, { workerData: data.website });
      workers.push(worker);
      worker.once('message', (result) => {
        console.log(result)
        return handleThreadCompletion(result);
      })
    });
  }
  else {
    const x = workerData;
    let result;
    if (x === "https://barcodelookup.com") {
      result = await barcodeLoopkupScraper(event.ean);
    } else if (x === "") {
      result = await barcodeLoopkupScraper(event.ean);
    }
    parentPort.postMessage(result);
  }
};


const x = async () => {
  for (let i = 0; i < 5; i++) {
    let event = {
      ean: "8904063214386"
    }
    await handler(event)
  }
}

x()