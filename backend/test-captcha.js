require("dotenv").config();
const axios = require("axios");

async function test() {
    console.log("Testing CAPTCHA...");
    try {
        const response = await axios.post("https://www.google.com/recaptcha/api/siteverify", null, {
            params: {
                secret: process.env.RECAPTCHA_SECRET_KEY,
                response: "test-token",
            }
        });
        console.log("Success:", response.data);
    } catch(e) {
        console.error("Error:", e);
    }
    process.exit(0);
}

test();
