require("dotenv").config();
const { sendOTP } = require("./utils/emailService");

async function test() {
    console.log("Sending email...");
    try {
        const success = await sendOTP("test@example.com", "123456");
        console.log("Success:", success);
    } catch(e) {
        console.error("Error:", e);
    }
    process.exit(0);
}

test();
