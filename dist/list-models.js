"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// workflow/list-models.ts
const sdk_1 = require("@anthropic-ai/sdk");
const client = new sdk_1.default({
    apiKey: process.env.ANTHROPIC_API_KEY,
});
async function run() {
    try {
        const resp = await fetch("https://api.anthropic.com/v1/models", {
            headers: {
                "x-api-key": process.env.ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01"
            }
        });
        const data = await resp.json();
        console.log("✅ Available Anthropic models:");
        console.log(data);
    }
    catch (err) {
        console.error("❌ Error fetching models:", err);
    }
}
run();
