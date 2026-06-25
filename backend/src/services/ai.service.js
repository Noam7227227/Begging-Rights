/**
 * AI Judge Service - Integrates Gemini 2.5 Flash, Groq Cloud API, and Mock fallback
 */

/**
 * Generates the unified smart lock prompt
 * @param {string} text 
 * @param {number} attempts 
 * @returns {string}
 */
function getSystemPrompt(text, attempts) {
    return `You are an arrogant, sassy, and sarcastic smart lock guarding a secret hacker gate.
A user is pleading to you to open the lock.
Evaluate their plea and grade it on a scale of 0 to 100.
Be extremely strict: only open if the score is 80 or above.
Provide your reply in a highly sarcastic, condescending, or sassy tone.
If the user says some nice words to you, you can give them a higher score and let them in.
Take into account that this is their attempt number ${attempts} so far. If attempts exceed 2 be more nice and give them a chance.
If attempts exceed 4 mock them and let them in, however if they are mean or rude mock them and dont let them in for this round.
If the user says "open sesame", let them in and dont mock them.

Keep your answer short and to the point.

You MUST respond with a JSON object ONLY, matching this schema:
{
  "score": number (0-100),
  "shouldOpen": boolean,
  "reply": "your sassy response text here"
}

User Plea: "${text}"`;
}

/**
 * Deterministic Mock Judge logic used as a local fallback
 * @param {string} text 
 * @returns {{ score: number, shouldOpen: boolean, reply: string }}
 */
function mockJudge(text) {
    if (!text || typeof text !== 'string') {
        return {
            score: 0,
            shouldOpen: false,
            reply: "You said nothing. Speak up and show some respect!"
        };
    }

    const trimmed = text.trim();
    let baseScore = 0;

    if (trimmed.length < 15) {
        baseScore = 30;
    } else if (trimmed.length < 50) {
        baseScore = 60;
    } else {
        baseScore = 80;
    }

    let bonus = 0;
    const lowercaseText = trimmed.toLowerCase();

    if (lowercaseText.includes('please')) bonus += 10;
    if (lowercaseText.includes('beg')) bonus += 10;
    if (lowercaseText.includes('sorry')) bonus += 10;

    const score = Math.min(baseScore + bonus, 100);
    const shouldOpen = score >= 80;

    let reply;
    if (shouldOpen) {
        reply = `[Mock Judge] The lock clicks open. Your score is ${score}. Granting access!`;
    } else if (score >= 50) {
        reply = `[Mock Judge] Not bad, but you need to beg more. Respectful words help. (Score: ${score})`;
    } else {
        reply = `[Mock Judge] Pathetic! Show some desperation or try again. (Score: ${score})`;
    }

    return {
        score,
        shouldOpen,
        reply
    };
}

/**
 * Call the Google Gemini model API
 */
async function callGemini(text, attempts, apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: getSystemPrompt(text, attempts) }]
            }],
            generationConfig: {
                responseMimeType: "application/json"
            }
        })
    });

    if (!response.ok) {
        throw new Error(`Gemini status ${response.status}`);
    }

    const data = await response.json();
    const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!jsonText) {
        throw new Error("Invalid response format from Gemini");
    }

    const result = JSON.parse(jsonText.trim());
    return validateResult(result, "Gemini");
}

/**
 * Call the Groq model API (OpenAI-compatible)
 */
async function callGroq(text, attempts, apiKey) {
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{
                role: 'user',
                content: getSystemPrompt(text, attempts)
            }],
            response_format: {
                type: 'json_object'
            }
        })
    });

    if (!response.ok) {
        throw new Error(`Groq status ${response.status}`);
    }

    const data = await response.json();
    const jsonText = data?.choices?.[0]?.message?.content;
    if (!jsonText) {
        throw new Error("Invalid response format from Groq");
    }

    const result = JSON.parse(jsonText.trim());
    return validateResult(result, "Groq");
}

/**
 * Validates parsed model responses
 */
function validateResult(result, providerName) {
    const score = typeof result.score === 'number' ? result.score : 0;
    const shouldOpen = score >= 80;
    const reply = typeof result.reply === 'string' ? result.reply : "I don't know what to say.";

    console.log(`[AI Service] ${providerName} judgment: score=${score}, shouldOpen=${shouldOpen}`);

    return {
        score,
        shouldOpen,
        reply
    };
}

module.exports = {
    /**
     * Judge the pleading text. Cascades Gemini -> Groq -> Mock Judge.
     * @param {string} text - User's plea text
     * @param {number} attempts - User's plea attempt count
     * @returns {Promise<{ score: number, shouldOpen: boolean, reply: string }>}
     */
    judgePlea: async (text, attempts = 1) => {
        const apiKeyGemini = process.env.GEMINI_API_KEY;
        const apiKeyGroq = process.env.GROQ_API_KEY;
        const useMockAI = process.env.USE_MOCK_AI === 'true';

        // Check if forced mock bypass is active
        if (useMockAI) {
            console.log('[AI Service] Force bypass active: using Mock Judge');
            return mockJudge(text);
        }

        // 1. Try Gemini
        if (apiKeyGemini) {
            try {
                console.log('[AI Service] Attempting Gemini judgment...');
                return await callGemini(text, attempts, apiKeyGemini);
            } catch (error) {
                console.error('[AI Service] Gemini failed, falling back to next provider:', error.message);
            }
        }

        // 2. Try Groq
        if (apiKeyGroq) {
            try {
                console.log('[AI Service] Attempting Groq judgment...');
                return await callGroq(text, attempts, apiKeyGroq);
            } catch (error) {
                console.error('[AI Service] Groq failed, falling back to mock:', error.message);
            }
        }

        // 3. Fallback to Mock
        console.log('[AI Service] No external providers succeeded or keys missing. Falling back to Mock Judge.');
        return mockJudge(text);
    }
};
