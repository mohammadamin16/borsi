import { scrapeNewsWebsite } from "./scraper";

async function main(): Promise<void> {
  try {
    console.log("Starting web scraping example...");
    const result = await scrapeNewsWebsite();
    console.log("Here is the result:");
    console.log(result);
  } catch (error) {
    console.error("Error during web scraping:", error);
  }
}

// Run the main function
main();
