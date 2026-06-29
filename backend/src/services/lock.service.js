/**
 * Lock service - high-level lock operations used by controllers.
 * @module services/lock.service
 */

const stateService = require('./state.service');
const { LOCK_STATES } = require('../config/constants');

module.exports = {
    /**
     * Mark the lock as requested to open.
     * @returns {{status:string,shouldOpen:boolean,attempts:number,lastScore:number}}
     */
    triggerOpen: () => {
        return stateService.updateState({
            shouldOpen: true,
            status: LOCK_STATES.OPEN_REQUESTED
        });
    },

    /**
     * Acknowledge that the lock has opened and clear the open request flag.
     * @returns {{status:string,shouldOpen:boolean,attempts:number,lastScore:number}}
     */
    acknowledgeOpen: () => {
        return stateService.updateState({
            shouldOpen: false,
            status: LOCK_STATES.OPENED
        });
    }
};
