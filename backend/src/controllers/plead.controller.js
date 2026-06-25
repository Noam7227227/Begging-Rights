const aiService = require('../services/ai.service');
const stateService = require('../services/state.service');
const { LOCK_STATES } = require('../config/constants');

module.exports = {
    /**
     * POST /api/plead
     * Body: { text: "user plea" }
     */
    plead: (req, res) => {
        const { text } = req.body;

        if (text === undefined) {
            return res.status(400).json({ error: "Missing 'text' parameter in request body" });
        }

        const evaluation = aiService.judgePlea(text);
        const currentState = stateService.getState();

        // Determine new state fields
        const newStatus = evaluation.shouldOpen ? LOCK_STATES.OPEN_REQUESTED : LOCK_STATES.REJECTED;
        const newShouldOpen = evaluation.shouldOpen;

        // Update global state manager
        stateService.updateState({
            attempts: currentState.attempts + 1,
            lastScore: evaluation.score,
            status: newStatus,
            shouldOpen: newShouldOpen
        });

        // Return the judge's response
        res.json({
            score: evaluation.score,
            shouldOpen: evaluation.shouldOpen,
            reply: evaluation.reply
        });
    }
};
