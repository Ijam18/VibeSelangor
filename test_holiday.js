const https = require('https');

https.get(`https://date.nager.at/api/v3/PublicHolidays/${new Date().getFullYear()}/MY`, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            const parsedData = JSON.parse(rawData);
            const today = new Date();
            const upcoming = parsedData.filter(h => new Date(h.date) >= today);
            console.log("Upcoming:", upcoming.slice(0, 3));
        } catch (e) {
            console.error(e.message);
        }
    });
}).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
});
