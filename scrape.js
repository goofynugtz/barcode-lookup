const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

const WEBSITES_TO_SCRAPE = [
  { function: barcodeLoopkupScraper, website: "https://barcodelookup.com" },
]

chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;


async function getPath() {
  if (execPath) return execPath;
  execPath = await chromium.executablePath()
  return execPath;
}

async function goUpcScraper(ean, index) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();
  const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36";
  await page.setUserAgent(ua)
  await page.goto(`https://go-upc.com/search?q=${ean}`, { waitUntil: "domcontentloaded" });
  await page.screenshot({ path: `screens/${index}.jpg`})

  try {
    const productName = await page.$eval("#resultPageContainer > div > div.left-column > div:nth-child(1) > h1", d => d.innerHTML)
    const brandName = await page.$eval("#resultPageContainer > div > div.left-column > div:nth-child(1) > table > tbody > tr:nth-child(2) > td:nth-child(2)", d => d.innerHTML)
    const category = await page.$eval("#resultPageContainer > div > div.left-column > div:nth-child(1) > table > tbody > tr:nth-child(3) > td:nth-child(2)", d => d.innerHTML)
    const description = await page.$eval("#resultPageContainer > div > div.left-column > div:nth-child(2) > span", d => d.innerHTML)
    const imageURI = await page.$eval("#resultPageContainer > div > div.right-column > figure > img", d => d.src)
    await browser.close()
    return {
      "product_name": productName,
      "brand": brandName,
      "category": category,
      "description": description,
      "image_uri": imageURI,
    }
  } catch { }

}


async function barcodeLoopkupScraper(ean, index) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();
  const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36";
  await page.setUserAgent(ua)
  await page.goto(`https://www.barcodelookup.com/${ean}`, { waitUntil: "domcontentloaded" });
  await page.screenshot({ path: `screens/${index}.jpg`})

  try {
    const productName = await page.$eval("#product > section:nth-child(3) > div:nth-child(1) > div > div > div.col-50.product-details > h4", d => d.innerHTML)
    const brandName = await page.$eval("#product > section:nth-child(3) > div:nth-child(1) > div > div > div.col-50.product-details > div:nth-child(8) > span", d => d.innerHTML)
    const category = await page.$eval("#product > section:nth-child(3) > div:nth-child(1) > div > div > div.col-50.product-details > div:nth-child(7) > span", d => d.innerHTML)
    const description = await page.$eval("#product > section:nth-child(3) > div.light-grey-background > div > div:nth-child(1) > div > div > div > span", d => d.innerHTML)
    const imageURI = await page.$eval("#largeProductImage > img", d => d.src)
    await browser.close()
    return {
      "product_name": productName,
      "brand": brandName,
      "category": category,
      "description": description,
      "image_uri": imageURI,
    }
  } catch { }
}

async function handler(event, index) {
  if (!event.ean) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid payload" })
    };
  }

  let result = await goUpcScraper(event.ean, index);
  console.log(result)
  // return result;
}

const x = async () => {
  for (let i = 0; i < 100; i++) {
    console.log(`Request No ${i+1}\n`)
    try {
      await handler({ ean: "8904063214386"}, i)
    } catch {} 
  }
}

x();