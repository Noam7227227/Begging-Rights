/**
 * Status controller - exposes health and status telemetry endpoints.
 * @module controllers/status.controller
 */

const stateService = require('../services/state.service');

module.exports = {
    /**
     * Health check endpoint. Returns a simple OK JSON object.
     * GET /health
     */
    getHealth: (req, res) => res.json({ status: 'ok' }),

    /**
     * Return current telemetry status including attempts and last score.
     * GET /api/status
     */
    getStatus: (req, res) => {
        const { status, attempts, lastScore } = stateService.getState();
        res.json({ status, attempts, lastScore });
    }
};