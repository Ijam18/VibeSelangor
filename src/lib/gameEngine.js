import { GAME_LEVELS, GAME_ITEMS } from '../constants';

/**
 * Game Engine Logic for Builder Simulator
 */

/**
 * Calculates offline earnings based on time elapsed and build rate.
 * @param {string} lastClaimTime - ISO timestamp of last claim
 * @param {number} buildRate - Vibes per hour
 * @returns {number} - Amount of vibes earned
 */
export function calculateIdleVibes(lastClaimTime, buildRate) {
    if (!lastClaimTime) return 0;
    const last = new Date(lastClaimTime).getTime();
    const now = Date.now();
    const diffHours = (now - last) / (1000 * 60 * 60);
    // Cap at 24 hours of idle time
    const effectiveHours = Math.min(diffHours, 24);
    return Math.floor(effectiveHours * buildRate);
}

/**
 * Determines current level based on XP.
 * @param {number} xp 
 * @returns {number} - Current level
 */
export function getLevelFromXP(xp) {
    // Find the highest level where xp >= xpRequired
    for (let i = GAME_LEVELS.length - 1; i >= 0; i--) {
        if (xp >= GAME_LEVELS[i].xpRequired) {
            return GAME_LEVELS[i].level;
        }
    }
    return 1;
}

/**
 * Checks if user can afford an item.
 * @param {number} currentVibes 
 * @param {string} itemId 
 * @returns {boolean}
 */
export function canAfford(currentVibes, itemId) {
    const item = GAME_ITEMS.find(i => i.id === itemId);
    if (!item) return false;
    return currentVibes >= item.cost;
}

/**
 * Processes an item purchase.
 * @param {string} itemId 
 * @param {number} currentVibes 
 * @param {string[]} currentInventory 
 * @returns {object} { success, newVibes, error }
 */
export function processPurchase(itemId, currentVibes, currentInventory) {
    const item = GAME_ITEMS.find(i => i.id === itemId);
    if (!item) return { success: false, error: 'Item not found' };

    if (currentInventory.includes(itemId)) {
        return { success: false, error: 'Item already owned' };
    }

    if (currentVibes < item.cost) {
        return { success: false, error: 'Not enough vibes' };
    }

    return {
        success: true,
        newVibes: currentVibes - item.cost,
        item
    };
}

/**
 * Calculates total build rate from inventory.
 * @param {string[]} inventory - Array of item IDs
 * @returns {number} - Total vibes/hour
 */
export function calculateBuildRate(inventory) {
    let rate = 1; // Base rate
    if (!inventory) return rate;

    inventory.forEach(itemId => {
        const item = GAME_ITEMS.find(i => i.id === itemId);
        if (item) {
            rate += item.buildRate;
        }
    });
    return rate;
}
