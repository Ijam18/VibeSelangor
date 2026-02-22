// test_se_tts.js
async function testStreamElementsTTS() {
    try {
        // Test fetching a list of voices if possible, or just generate a test URL
        const text = encodeURIComponent("Yo welcome bro! Aku ijam bot.");
        // Brian (UK English), or maybe Google bahasa Indonesia?
        // Let's try Brian or Russell
        const url = `https://api.streamelements.com/kappa/v2/speech?voice=Russell&text=${text}`;

        const res = await fetch(url);
        if (res.ok) {
            console.log("Success! Audio available at:", url);
        } else {
            console.error(res.status, await res.text());
        }
    } catch (e) {
        console.error(e);
    }
}
testStreamElementsTTS();
