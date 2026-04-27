// Using built-in fetch

const API_URL = "https://daitya-legion-api-264.onrender.com/api/players";

async function test() {
    console.log(`Testing API: ${API_URL}`);
    try {
        const res = await fetch(API_URL);
        console.log(`Status: ${res.status}`);
        const data = await res.json();
        console.log(`Is Array: ${Array.isArray(data)}`);
        if (Array.isArray(data)) {
            console.log(`Count: ${data.length}`);
            if (data.length > 0) {
                console.log(`First Player: ${data[0].name}`);
            }
        } else {
            console.log(`Response: ${JSON.stringify(data).substring(0, 200)}`);
        }
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }
}

test();
