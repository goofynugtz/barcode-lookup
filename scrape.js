const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

const WEBSITES_TO_SCRAPE = {
  BARCODE_LOOKUP: "BARCODE_LOOKUP",
  GO_UPC: "GO_UPC",
  AMAZON: "AMAZON"
}

async function amazonScraper(ean, index) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();
  const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36";
  await page.setUserAgent(ua)
  await page.goto(`https://www.amazon.in/s?k=${ean}&crid=1OM8F4UMNW3FK&sprefix=${ean}%2Caps%2C284&ref=nb_sb_noss`, { waitUntil: "domcontentloaded" });
  let bestMatch;
  await page.screenshot({ path: `screens/${index}.jpg`})

  try {
    bestMatch = await page.$eval("#search > div.s-desktop-width-max.s-desktop-content.s-wide-grid-style-t1.s-opposite-dir.s-wide-grid-style.sg-row > div.sg-col-20-of-24.s-matching-dir.sg-col-16-of-20.sg-col.sg-col-8-of-12.sg-col-12-of-16 > div > span.rush-component.s-latency-cf-section > div.s-main-slot.s-result-list.s-search-results.sg-row > div:nth-child(6) > div > div > span > div > div > div.a-section.a-spacing-small.puis-padding-left-small.puis-padding-right-small > div.a-section.a-spacing-none.a-spacing-top-small.s-title-instructions-style > h2 > a", d => d.href)

    await page.goto(bestMatch)
    try {
      const productName = await page.$eval("#productTitle", d => d.innerHTML)
      const brandName = await page.$eval("#productOverview_feature_div > div > table > tbody > tr.a-spacing-small.po-brand > td.a-span9 > span", d => d.innerHTML)
      const category = await page.$eval("#productOverview_feature_div > div > table > tbody > tr.a-spacing-small.po-diet_type > td.a-span9 > span", d => d.innerHTML)
      const description = await page.$eval("#feature-bullets > ul", d => d.innerHTML)
      const imageURI = await page.$eval("#landingImage", d => d.src)
      await browser.close()
      return {
        "product_name": productName,
        "brand": brandName,
        "category": category,
        "description": description,
        "image_uri": imageURI,
      }
    } catch {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "something went wrong" })
      };
     }
  } catch { 
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "ean not found" })
    };
  }
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
  console.log(`https://go-upc.com/search?q=${ean}`)
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
  } catch {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "ean not found" })
    };
  }
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
  console.log(`https://www.barcodelookup.com/${ean}`)
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
  } catch {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "ean not found" })
    };
  }
}


async function scraper(ean, type, index) {
  console.log(index)
  switch (type){
    case WEBSITES_TO_SCRAPE.BARCODE_LOOKUP:
      return barcodeLoopkupScraper(ean, index);
    case WEBSITES_TO_SCRAPE.GO_UPC:
      return goUpcScraper(ean, index);
    case WEBSITES_TO_SCRAPE.AMAZON:
      return amazonScraper(ean, index);
  }
}

async function handler(event, index) {
  if (!event.ean || !event.type) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid payload" })
    };
  }

  let result = await scraper(event.ean, event.type, index);
  console.log(result)
  // return result;
}

const x = async () => {
  for (let i = 0; i < 100; i++) {
    console.log(`Request No ${i + 1}\n`)
    try {
      await handler({ ean: "8904063214386", type: WEBSITES_TO_SCRAPE.AMAZON}, i)
    } catch {} 
  }
}

x();