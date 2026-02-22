const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    await page.goto('http://localhost:5173/ijamos');
    await new Promise(r => setTimeout(r, 2000));

    console.log("Looking for buttons...");
    const buttons = await page.$$('button');
    for (let b of buttons) {
        const text = await page.evaluate(el => el.textContent, b);
        if (text && text.includes('SETTINGS')) {
            console.log("Clicking SETTINGS...");
            await b.click();
            break;
        }
    }
    await new Promise(r => setTimeout(r, 2000));

    for (let b of buttons) {
        const text = await page.evaluate(el => el.textContent, b);
        if (text && text.includes('TERMINAL')) {
            console.log("Clicking TERMINAL...");
            await b.click();
            break;
        }
    }

    await new Promise(r => setTimeout(r, 2000));
    await browser.close();
})();
