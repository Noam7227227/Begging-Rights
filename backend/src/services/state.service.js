/**
 * State service - in-memory lock state manager.
 * Provides helpers to get, update, and reset the lock state used by the server.
 * @module services/state.service
 */

const { LOCK_STATES } = require('../config/constants');

let state = {
    status: LOCK_STATES.LOCKED,
    shouldOpen: false,
    attempts: 0,
    lastScore: 0
};

module.exports = {
    /**
     * Return a shallow copy of the current in-memory state.
     * @returns {{status:string,shouldOpen:boolean,attempts:number,lastScore:number}}
     */
    getState: () => ({ ...state }),

    /**
     * Merge provided partial state into the current state and return the updated state.
     * @param {Object} newState - Partial state to merge
     * @returns {{status:string,shouldOpen:boolean,attempts:number,lastScore:number}}
     */
    updateState: (newState) => {
        state = { ...state, ...newState };
        return state;
    },

    /**
     * Reset the in-memory state to its initial locked defaults.
     * @returns {{status:string,shouldOpen:boolean,attempts:number,lastScore:number}}
     */
    resetState: () => {
        state = {
            status: LOCK_STATES.LOCKED,
            shouldOpen: false,
            attempts: 0,
            lastScore: 0
        };
        return state;
    }
};
