/**
 * ElevenLabs Text-To-Speech Service
 */

const DEFAULT_VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Standard voice ID ("Adam")

module.exports = {
    /**
     * Generate speech audio from text using ElevenLabs API
     * @param {string} text - The text to read aloud
     * @returns {Promise<Buffer>} - Binary audio stream buffer
     */
    generateSpeech: async (text) => {
        const apiKey = process.env.ELEVENLABS_API_KEY;

        if (!apiKey) {
            throw new Error('ElevenLabs API key is not configured inside .env');
        }

        if (!text) {
            throw new Error('Text parameter is required for TTS generation');
        }

        const url = `https://api.elevenlabs.io/v1/text-to-speech/${DEFAULT_VOICE_ID}`;
        const payload = {
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'accept': 'audio/mpeg',
                'xi-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            throw new Error(`ElevenLabs API returned status ${response.status}: ${errorText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }
};
