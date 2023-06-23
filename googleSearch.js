const puppeteer = require("puppeteer");
const fs = require("fs");
const { extractQuery, extractNames } = require("./extractQuery");
const { sleep, isBotDetected } = require("./isBot");

const files = "test script tracy.csv"
async function googleSearch(query, del = 0) {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ["--lang=fr-FR"], // Set language to French
        });
        const page = await browser.newPage();

        // Set the Accept-Language header to French
        await page.setExtraHTTPHeaders({
            "Accept-Language": "fr-FR",
        });
        await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
        console.log(`https://www.google.com/search?q=${encodeURIComponent(query)}`);

        // Bot detected. Sleeping 20 to 30 minutes
        const isDetected = await isBotDetected(page);
        if (isDetected) {
            console.log('Bot detected, closing browser, going to sleep for 20-30 minutes');
            await sleep(1000 * 60 * 20, 1000 * 60 * 30);
            await browser.close();
            return;
        }

        // Wait for some time before extracting the search results
        await delay(del); // Delay for 2 seconds (adjust as needed)

        // Check if the "Accept" button is present
        const acceptButton = await page.$("div.QS5gu.sy4vM");
        if (acceptButton) {
            // Click on the "Accept" button
            await acceptButton.click();
            // console.log("The button ALL ACCEPTED is clicked");
        }

        // Capture screenshot of the entire page
        await page.screenshot({ path: "captcha.png" });

        // Wait for the search results to load
        await page.waitForSelector('div.VwiC3b.yXK7lf.MUxGbd.yDYNvb.lyLwlc.lEBKkf');
         console.log('Selector found');

        // Extract search result descriptions using XPath
        const descriptions = await page.$$eval('div.VwiC3b.yXK7lf.MUxGbd.yDYNvb.lyLwlc.lEBKkf', (elements) =>
            elements.map((element) => element.textContent.trim())
        );
        // console.log(descriptions);

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


        //console.log("Emails:", emails);
        //console.log("Websites:", websites);

        // Prepare the data for CSV
        // TODO : must create an object to put the data with the 'emails','website'
        const searchResults = [];
        for (let i = 0; i < emails.length; i++) {
            const result = {
                email: emails[i] || "",
                website: websites[i] || ""
            };
            searchResults.push(result);
        }

        await browser.close();
        return searchResults ;

    } catch (error) {
        console.error("An error occurred:", error);
    }
}


// Delay function - to not be detected by Google as a script
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function saveCSV(results) {
    try {
        const names = await extractNames(files);

        let csvContent = "firstName,lastName,emails,websites\n";

        const length = names.length < results.length ? names.length : results.length;

        for (let i = 0; i < length; i++) {
            const name = names[i] || [] ;
            const firstName = name[0] || "" ;
            const lastName = name[1] || "" ;
            const result = results[i] || []; // Get the array of objects at the current index

            // Extract emails and websites separately
            const emails = result.map(obj => obj.email);
            const websites = result.map(obj => obj.website);

            // Combine emails and websites into a single string with comma-separated values
            const emailString = emails.map(email => `"${email}"`).join(",");
            const websiteString = websites.map(website => `"${website}"`).join(",");
            csvContent += `"${firstName}","${lastName}",${emailString},${websiteString}\n`;
        }
        fs.writeFileSync("results.csv", csvContent, "utf8");
        console.log("Search results saved in results.csv");
    } catch (error) {
        console.error("An error occurred:", error);
    }
}



async function main() {
    let results = []
    try {
        const queries = await extractQuery(files);
        for (const query of queries) {
            results.push(await googleSearch(query, 2000));
            console.log('ok!');
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
    await saveCSV(results)
}

// Usage
main();
