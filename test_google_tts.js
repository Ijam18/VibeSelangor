async function testGoogleTTS() {
    try {
        const text = encodeURIComponent("Welcome builder");
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${text}&tl=id&client=tw-ob`;

        const res = await fetch(url);
        if (res.ok) {
            console.log("Success! Audio available at:", url);
            console.log("Content-Type:", res.headers.get('content-type'));
            console.log("Content-Length:", res.headers.get('content-length'));
        } else {
            console.error(res.status, await res.text());
        }
    } catch (e) {
        console.error(e);
    }
}
testGoogleTTS();
