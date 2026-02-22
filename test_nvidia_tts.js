import dotenv from 'dotenv';
dotenv.config();

async function testTTS() {
    try {
        const response = await fetch('https://integrate.api.nvidia.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.VITE_NVIDIA_API_KEY_70B}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "tts-1",
                input: "Hello world, this is a test.",
                voice: "alloy"
            })
        });
        if (!response.ok) {
            console.error(response.status, await response.text());
        } else {
            console.log("Success! Headers:", response.headers.get('content-type'));
        }
    } catch (e) {
        console.error(e);
    }
}

testTTS();
