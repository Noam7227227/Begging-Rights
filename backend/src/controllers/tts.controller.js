const ttsService = require('../services/tts.service');

module.exports = {
    /**
     * POST /api/tts
     * Body: { text: "verdict text" }
     */
    generateTTS: async (req, res) => {
        try {
            const { text } = req.body;

            if (!text) {
                return res.status(400).json({ error: "Missing 'text' parameter in request body" });
            }

            const audioBuffer = await ttsService.generateSpeech(text);

            // Stream binary data directly to client
            res.set({
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioBuffer.length
            });
            res.send(audioBuffer);
        } catch (error) {
            console.error('[TTS Controller] Error generating TTS:', error.message);
            res.status(500).json({ error: error.message || 'Failed to generate speech audio.' });
        }
    }
};
