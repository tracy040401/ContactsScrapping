const getRandomNumberBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const sleep = async (min, max) => new Promise((resolve) => setTimeout(resolve, getRandomNumberBetween(min, max)));

async function isBotDetected(page) {
    try {
        const exist = await page.$eval("#captcha-form, #px-captcha, .cf-wrapper, #recaptcha", (e) => e);
        if (exist) return true;
    } catch (e) {}
    return false;
}

async function isNotFoundOnGoogleCache(page) {
    // ex :https://webcache.googleusercontent.com/search?q=cache:https://www.crunchbase.com/organization/carpe-diem-team
    try {
        const exist = await page.$eval("ins", (e) => e.innerText === "That’s an error.");
        console.log("isNotFoundOnGoogleCache : " + exist);
        if (exist) return true;
    } catch (e) {}
    return false;
}

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

const getHost = (n) => {
    try {
        let url = n;
        if (!/^(?:f|ht)tps?\:\/\//.test(url)) url = "http://" + url;
        const urlObject = new URL(url);
        return urlObject.host.replace("www.", "");
    } catch (e) {
        console.log(e);
        return "";
    }
};

module.exports = {
    sleep,
    isBotDetected,
    isNotFoundOnGoogleCache,
    getHost,
    autoScroll,
};
