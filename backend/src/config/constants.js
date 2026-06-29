/**
 * Application constants used across backend services and controllers.
 * @module config/constants
 */

module.exports = {
    LOCK_STATES: {
        LOCKED: 'LOCKED',
        LISTENING: 'LISTENING',
        JUDGING: 'JUDGING',
        REJECTED: 'REJECTED',
        OPEN_REQUESTED: 'OPEN_REQUESTED',
        OPENED: 'OPENED'
    }
};