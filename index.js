require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Initialize Groq Client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

app.post('/api/process', async (req, res) => {
    const { text } = req.body;
    const startTime = Date.now();

    if (!text) return res.status(400).json({ error: "Text payload required" });

    try {
        // SYSTEM PROMPT:
        // We act as a "Prompt Engineer" here to force the LLM into a specific behavior.
        // We demand strict JSON so our frontend doesn't break.
        const systemPrompt = `
        You are an enterprise-grade NLP classification engine.
        Analyze the user's input and extract structured data.
        
        RETURN ONLY JSON. NO MARKDOWN. NO EXPLANATIONS.
        
        Required JSON Schema:
        {
            "intent": "string (snake_case, e.g., check_order_status, technical_issue)",
            "confidence": "number (0.0 to 1.0)",
            "category": "string (e.g., Support, Sales, General, Urgent)",
            "entities": [
                { "name": "string", "type": "string (e.g., DATETIME, LOCATION, PRODUCT)", "value": "string" }
            ],
            "sentiment": "string (positive, negative, neutral)",
            "suggested_action": "string (short recommendation for the system)",
            "language": "string (detected language code)"
        }
        `;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: text }
            ],
            model: "llama-3.3-70b-versatile", // Fast, efficient, open-source
            temperature: 0, // 0 = Deterministic (critical for API consistency)
            max_tokens: 1024,
            response_format: { type: "json_object" } // Force valid JSON
        });

        const processingTime = Date.now() - startTime;
        const resultText = completion.choices[0]?.message?.content || "{}";
        const parsedResult = JSON.parse(resultText);

        // Append performance metrics for the dashboard
        const finalResponse = {
            ...parsedResult,
            meta: {
                model: "llama-3.3-70b-versatile",
                provider: "groq-cloud",
                latency_ms: processingTime
            }
        };

        res.json(finalResponse);

    } catch (error) {
        console.error("Groq Error:", error);
        res.status(500).json({ error: "NLP Processing Failed", details: error.message });
    }
});

app.listen(PORT, () => console.log(`🚀 Groq NLP Engine running on http://localhost:${PORT}`));
