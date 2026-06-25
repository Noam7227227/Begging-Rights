const SpeechRecognition = typeof window !== 'undefined'
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : null;

export const isSpeechSupported = !!SpeechRecognition;

/**
 * Text-to-Speech Synthesis
 * Reads judge response aloud. Cancels ongoing speech before speaking.
 * @param {string} text
 * @param {Function} onEnd
 */
export const speak = (text, onEnd = null) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
        console.warn('Speech synthesis is not supported.');
        if (onEnd) onEnd();
        return;
    }

    window.speechSynthesis.cancel();

    if (!text) {
        if (onEnd) onEnd();
        return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Attempt to set a natural-sounding English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en-') && (v.name.includes('Google') || v.name.includes('Natural')))
        || voices.find(v => v.lang.startsWith('en'))
        || voices[0];

    if (englishVoice) {
        utterance.voice = englishVoice;
    }

    utterance.rate = 1.05; // Slightly faster for judge sass
    utterance.pitch = 0.95; // Slightly deeper authoritative pitch

    utterance.onend = () => {
        if (onEnd) onEnd();
    };

    utterance.onerror = (err) => {
        console.error('Speech synthesis error:', err);
        if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
};

/**
 * Create a fresh instance of SpeechRecognition
 */
export const createSpeechRecognition = () => {
    if (!isSpeechSupported) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    return recognition;
};

export default {
    isSpeechSupported,
    speak,
    createSpeechRecognition
};
