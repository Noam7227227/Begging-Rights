/**
 * Mock Judge AI Service
 */
module.exports = {
    /**
     * Judge the pleading text and return a score, shouldOpen, and reply.
     * @param {string} text
     * @returns {{ score: number, shouldOpen: boolean, reply: string }}
     */
    judgePlea: (text) => {
        if (!text || typeof text !== 'string') {
            return {
                score: 0,
                shouldOpen: false,
                reply: "You said nothing. Speak up and show some respect!"
            };
        }

        const trimmed = text.trim();
        let baseScore = 0;

        // Score based on length
        if (trimmed.length < 15) {
            baseScore = 30; // Very short
        } else if (trimmed.length < 50) {
            baseScore = 60; // Medium
        } else {
            baseScore = 80; // Long
        }

        // Add bonus points for respectful words
        let bonus = 0;
        const lowercaseText = trimmed.toLowerCase();
        
        if (lowercaseText.includes('please')) bonus += 10;
        if (lowercaseText.includes('beg')) bonus += 10;
        if (lowercaseText.includes('sorry')) bonus += 10;

        const score = Math.min(baseScore + bonus, 100);
        const shouldOpen = score >= 80;

        // Generate reply based on results
        let reply;
        if (shouldOpen) {
            reply = `The judge is moved by your words. Granting access! (Score: ${score})`;
        } else if (score >= 50) {
            reply = `Not bad, but you need to be more convincing. Try using words of respect like 'please' or 'beg'. (Score: ${score})`;
        } else {
            reply = `Pathetic! That's not how you ask for a favor. Try harder. (Score: ${score})`;
        }

        return {
            score,
            shouldOpen,
            reply
        };
    }
};
