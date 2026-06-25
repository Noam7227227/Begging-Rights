import React, { useState, useEffect } from 'react';

// Mock pleas to randomly select from to simulate speech-to-text
const MOCK_PLEAS = [
    "please open the lock, i beg you, sorry for the hassle!",
    "please open the door, i'm sorry",
    "open the lock! i demand entry!",
    "please beg sorry open now",
    "i beg you to let me in, i'm sorry!",
    "open the gate, please!"
];

const PleadForm = ({ onSubmit, isLoading }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcribedText, setTranscribedText] = useState('');
    const [statusMessage, setStatusMessage] = useState('Tap Mic to Speak');

    useEffect(() => {
        let timer;
        if (isListening) {
            setStatusMessage('Listening...');
            setTranscribedText('...');
            
            // Simulate 2 seconds of listening / speaking
            timer = setTimeout(() => {
                const randomPlea = MOCK_PLEAS[Math.floor(Math.random() * MOCK_PLEAS.length)];
                setTranscribedText(randomPlea);
                setStatusMessage('Transcribing...');
                setIsListening(false);
                
                // Submit plea after showing transcription briefly
                setTimeout(() => {
                    onSubmit(randomPlea);
                }, 800);
            }, 2000);
        }
        return () => clearTimeout(timer);
    }, [isListening, onSubmit]);

    const handleMicClick = () => {
        if (isLoading || isListening) return;
        setIsListening(true);
    };

    return (
        <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 className="panel-title" style={{ marginBottom: '0.5rem' }}>Voice Plea</h3>
            
            <div className="plead-form-wrapper">
                <button
                    type="button"
                    className={`mic-button ${isListening ? 'recording' : ''} ${isLoading ? 'disabled' : ''}`}
                    onClick={handleMicClick}
                    disabled={isLoading || isListening}
                    aria-label="Push to Speak"
                >
                    {isListening && <span className="pulse-ring"></span>}
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" y1="19" x2="12" y2="22"></line>
                    </svg>
                </button>

                <div className="mic-status" style={{ 
                    margin: '0.4rem 0 0.2rem 0', 
                    fontWeight: '700', 
                    fontSize: '0.85rem', 
                    color: isListening ? 'var(--accent-red)' : 'var(--text-primary)' 
                }}>
                    {statusMessage}
                </div>

                <div className="transcription-preview" style={{ 
                    fontSize: '0.75rem', 
                    color: transcribedText === '...' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    fontStyle: 'italic',
                    minHeight: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.25rem 0.5rem',
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '8px',
                    width: '100%',
                    maxWidth: '320px',
                    textAlign: 'center'
                }}>
                    {transcribedText ? `"${transcribedText}"` : 'Spoken words appear here...'}
                </div>
            </div>
        </div>
    );
};

export default PleadForm;
