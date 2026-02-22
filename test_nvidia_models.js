import dotenv from 'dotenv';
dotenv.config();

async function checkModels() {
    try {
        const response = await fetch('https://integrate.api.nvidia.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${process.env.VITE_NVIDIA_API_KEY_70B}`
            }
        });
        const data = await response.json();
        console.log(`Total models found: ${data.data.length}`);
        console.log(data.data.map(m => m.id).join(', '));
    } catch (e) {
        console.error(e);
    }
}

checkModels();
