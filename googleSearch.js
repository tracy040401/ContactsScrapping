const puppeteer = require("puppeteer");
const fs = require("fs");
const { extractQuery } = require('./extractQuery'); // Import the extractQuery module

async function googleSearch(query, del = 0 ) {
    try {
        const browser = await puppeteer.launch({
            headless: false,
            args: ["--lang=fr-FR"], // Set language to French
        });
        const page = await browser.newPage();

        // Set the Accept-Language header to French
        await page.setExtraHTTPHeaders({
            "Accept-Language": "fr-FR",
        });
        await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
        console.log(`https://www.google.com/search?q=${encodeURIComponent(query)}`);

        // Wait for some time before extracting the search results
        await delay(del); // Delay for 2 seconds (adjust as needed)

/*
        // Wait for the "Accept" button to be visible
        await page.waitForSelector("div.QS5gu.sy4vM");

        // Click on the "Accept" button
        await page.click("div.QS5gu.sy4vM");
        console.log('The button ALL ACCEPTED is clicked')

 */

        // Capture screenshot of the entire page
        await page.screenshot({ path: "captcha.png" });

        // Wait for the search results to load
        await page.waitForSelector('div.VwiC3b.yXK7lf.MUxGbd.yDYNvb.lyLwlc.lEBKkf');
        console.log('Selector found')

        // Extract search result descriptions using XPath
        const descriptions = await page.$$eval('div.VwiC3b.yXK7lf.MUxGbd.yDYNvb.lyLwlc.lEBKkf', (elements) =>
            elements.map((element) => element.textContent.trim())
        );
        console.log(descriptions);

        const emailRegex = /\S+@\S+/g;
        const websiteRegex = /https?:\/\/\S+/g;

        let emails = [];
        let websites = [];

        descriptions.forEach((description) => {
            const foundEmails = description.match(emailRegex);
            if (foundEmails) {
                emails = [...emails, ...foundEmails];
            }

            const foundWebsites = description.match(websiteRegex);
            if (foundWebsites) {
                websites = [...websites, ...foundWebsites];
            }

        });

        // Capture screenshot of the entire page
        await page.screenshot({ path: "screenshot.png" });


        console.log("Emails:", emails);
        console.log("Websites:", websites);

        // Prepare the data for CSV
        const data = [
            ["LAMOUREUX", "Hugo", ...emails, ...websites],
        ];

        // Convert data to CSV format
        let csvContent = "Last Name, First Name, Email 1, Email 2, ... , Website 1, ... \n";
        data.forEach((row) => {
            csvContent += row.map((item) => `"${item}"`).join(",") + "\n";
        });

        // Save the CSV file
        fs.writeFileSync("search_results.csv", csvContent, "utf8");

        console.log("Search results saved in search_results.csv");

        await browser.close();
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

// Delay function - to not be detected by google as a script
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


async function main() {
    try {
        const queries = await extractQuery('random.csv');
        for (const query of queries) {
            await googleSearch(query, 2000);
            console.log('ok!');
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

// Usage
main();






