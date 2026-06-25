const aiService = require('../services/ai.service');
const stateService = require('../services/state.service');
const { LOCK_STATES } = require('../config/constants');

module.exports = {
    /**
     * POST /api/plead
     * Body: { text: "user plea" }
     */
    plead: async (req, res) => {
        try {
            const { text } = req.body;

            if (text === undefined) {
                return res.status(400).json({ error: "Missing 'text' parameter in request body" });
            }

            const currentState = stateService.getState();
            const attempts = currentState.attempts + 1; // This plea counts as the next attempt

            // Call the async AI service with the current plea and attempts count
            const evaluation = await aiService.judgePlea(text, attempts);

            const newStatus = evaluation.shouldOpen ? LOCK_STATES.OPEN_REQUESTED : LOCK_STATES.REJECTED;
            const newShouldOpen = evaluation.shouldOpen;

            // Update state manager
            stateService.updateState({
                attempts: attempts,
                lastScore: evaluation.score,
                status: newStatus,
                shouldOpen: newShouldOpen
            });

            // Return evaluation response
            res.json({
                score: evaluation.score,
                shouldOpen: evaluation.shouldOpen,
                reply: evaluation.reply
            });
        } catch (err) {
            console.error('[Plead Controller] Error processing plea:', err);
            res.status(500).json({ error: 'Internal server error evaluating pleading.' });
        }
    }
};
