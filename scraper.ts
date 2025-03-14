import puppeteer, { Browser, Page } from "puppeteer";

const URL = "https://tsetmc.com/";

async function openBrowser(): Promise<{ browser: Browser; page: Page }> {
  const browser = await puppeteer.launch({
    defaultViewport: { width: 1920, height: 1080 },
  });
  const page = await browser.newPage();
  await page.goto(URL);
  return {
    page,
    browser,
  };
}

async function searchAndGoToStock(
  browser: Browser,
  page: Page
): Promise<{ newPage: Page }> {
  await page.click("#search");

  // Type the search query
  await page.type("input", "فولاد مبارکه");

  const rowSelector = ".ag-center-cols-clipper .ag-row-first";
  await page.waitForSelector(rowSelector);

  // Get the link from the first search result and click it
  const link = await page.evaluate((rowSelector) => {
    const row = document.querySelector(rowSelector);
    const anchor = row?.querySelector("a");
    const href = anchor?.getAttribute("href");

    if (anchor) anchor.click(); // Clicking opens a new tab

    return href; // Return the link
  }, rowSelector);
  if (!link) {
    throw new Error("NOT FOUND");
  }
  const newPage: Page = await new Promise((resolve) => {
    browser.on("targetcreated", async (target) => {
      const newPage = await target.page();
      if (newPage) {
        console.log("New tab created.");
        await newPage.screenshot({ path: "screenshot.png" });
        // just wait for 5 sec
        await newPage.waitForTimeout(5000);
        resolve(newPage);
      }
    });
  });
  return {
    newPage,
  };
}

export async function scrapeNewsWebsite() {
  const browser = await puppeteer.launch({
    defaultViewport: { width: 1920, height: 1080 },
  });

  try {
    const page = await browser.newPage();

    // Navigate to the target website
    await page.goto(URL);

    // Click on the search input field
    await page.click("#search");

    // Type the search query
    await page.type("input", "فولاد مبارکه");

    const rowSelector = ".ag-center-cols-clipper .ag-row-first";
    await page.waitForSelector(rowSelector);

    // Get the link from the first search result and click it
    const link = await page.evaluate((rowSelector) => {
      const row = document.querySelector(rowSelector);
      const anchor = row?.querySelector("a");
      const href = anchor?.getAttribute("href");

      if (anchor) anchor.click(); // Clicking opens a new tab

      return href; // Return the link
    }, rowSelector);

    if (!link) {
      console.log("No link found.");
      return;
    }

    console.log("Clicked link:", link);

    // const newPage: Page = await new Promise((resolve) =>
    //   browser.on("targetcreated", async (target) => {
    //     const newPage = await target.page();
    //     if (!newPage) throw new Error("New page");
    //     resolve(newPage);
    //   })
    // );

    const newTabPromise = await new Promise((resolve) => {
      browser.on("targetcreated", async (target) => {
        const newPage = await target.page();
        if (newPage) {
          console.log("New tab created.");
          await newPage.screenshot({ path: "screenshot.png" });
          // just wait for 5 sec
          await newPage.waitForTimeout(5000);
          await newPage.screenshot({ path: "screenshot2.png" });
          console.log("New tab loaded.");
          const title = await newPage.title(); // Get the title of the new tab
          const element = await newPage.$("#TopBox table #d02");
          const text = await newPage.evaluate((el) => el?.textContent, element);
          console.log("Price: ", text);
          resolve(title);
        }
      });
    });
    console.log("Waiting for new tab to open...");
    console.log(newTabPromise);
    // screenshot
    // if (newPage) {
    //   // await newPage.waitForNavigation({ timeout: 10000 });
    //   const title = await newPage.title();
    //   await newPage.screenshot({ path: "screenshot.png" });
    //   console.log("New Tab Title:", title);
    //   return { title };
    // } else {
    //   console.log("New tab did not open.");
    // }
  } catch (error) {
    console.error("Error during web scraping:", error);
  } finally {
    // Close the browser
    await browser.close();
  }
}
