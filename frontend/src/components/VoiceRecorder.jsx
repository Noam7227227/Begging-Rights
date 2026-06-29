/**
 * VoiceRecorder component
 * Records speech (when supported) and submits transcribed pleas to the parent.
 * @component
 * @param {{onSubmit: Function, isLoading: boolean}} props
 */
import React, { useState, useEffect, useRef } from 'react';
import speechService from '../services/speech.service';

const VoiceRecorder = ({ onSubmit, isLoading }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [fallbackText, setFallbackText] = useState('');
    const [error, setError] = useState('');
    const recognitionRef = useRef(null);

    const isSpeechSupported = speechService.isSpeechSupported;

    // Set up Speech Recognition on component mount if supported
    useEffect(() => {
        if (isSpeechSupported) {
            const recognition = speechService.createSpeechRecognition();
            if (recognition) {
                recognition.onstart = () => {
                    setIsRecording(true);
                    setError('');
                };

                recognition.onresult = (event) => {
                    let interimTranscript = '';
                    let finalTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        } else {
                            interimTranscript += event.results[i][0].transcript;
                        }
                    }
                    setTranscript(finalTranscript + interimTranscript);
                };

                recognition.onerror = (event) => {
                    console.error('Speech recognition error:', event.error);
                    if (event.error === 'not-allowed') {
                        setError('Microphone access denied by user.');
                    } else if (event.error === 'no-speech') {
                        setError('No speech was detected.');
                    } else {
                        setError(`Microphone error: ${event.error}`);
                    }
                    setIsRecording(false);
                };

                recognition.onend = () => {
                    setIsRecording(false);
                };

                recognitionRef.current = recognition;
            }
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [isSpeechSupported]);

    /**
     * Start speech recognition and clear previous transcript/errors.
     * No-op if already recording or loading or unsupported.
     */
    const startRecording = () => {
        if (isLoading || isRecording || !recognitionRef.current) return;
        setTranscript('');
        setError('');
        try {
            recognitionRef.current.start();
        } catch (err) {
            console.error('Failed to start SpeechRecognition:', err);
            setError('Could not access microphone.');
        }
    };

    /**
     * Stop speech recognition and submit the finalized transcript to parent.
     */
    const stopRecording = () => {
        if (!isRecording || !recognitionRef.current) return;
        recognitionRef.current.stop();

        // Let SpeechRecognition finalize results, then submit plea transcript
        setTimeout(() => {
            setTranscript(currentTranscript => {
                const trimmedPlea = currentTranscript.trim();
                if (trimmedPlea && trimmedPlea !== '...') {
                    onSubmit(trimmedPlea);
                } else {
                    setError('No words captured. Try again.');
                }
                return currentTranscript;
            });
        }, 400);
    };

    /**
     * Handle fallback text submissions when speech recognition is unavailable.
     * @param {Event} e - Form submit event
     */
    const handleFallbackSubmit = (e) => {
        e.preventDefault();
        setError('');
        const plea = fallbackText.trim();
        if (!plea) {
            setError('The judge demands a plea.');
            return;
        }
        onSubmit(plea);
        setFallbackText('');
    };

    return (
        <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 className="panel-title" style={{ marginBottom: '0.5rem' }}>Voice Plea Portal</h3>

            <div className="plead-form-wrapper" style={{ minHeight: '150px', justifyContent: 'space-between', width: '100%' }}>
                {isSpeechSupported ? (
                    <>
                        {/* Start & Stop controls */}
                        <div style={{ display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'center' }}>
                            <button
                                type="button"
                                className={`btn btn-outline ${isRecording ? 'disabled' : ''}`}
                                onClick={startRecording}
                                disabled={isRecording || isLoading}
                                style={{
                                    flex: 1,
                                    borderColor: isRecording ? 'rgba(255,255,255,0.05)' : 'var(--accent-cyan)',
                                    color: isRecording ? 'var(--text-secondary)' : 'var(--text-primary)'
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.35rem' }}>
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <circle cx="12" cy="12" r="3" fill="currentColor"></circle>
                                </svg>
                                Start
                            </button>

                            <button
                                type="button"
                                className={`btn btn-danger ${!isRecording ? 'disabled' : ''}`}
                                onClick={stopRecording}
                                disabled={!isRecording || isLoading}
                                style={{
                                    flex: 1,
                                    background: isRecording ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.02)'
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.35rem' }}>
                                    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" fill="currentColor"></rect>
                                </svg>
                                Stop
                            </button>
                        </div>

                        {/* Live/Interim Transcript box */}
                        <div className="transcription-preview" style={{
                            flex: 1,
                            fontSize: '0.75rem',
                            color: isRecording ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                            fontStyle: 'italic',
                            background: 'rgba(0, 0, 0, 0.15)',
                            borderRadius: '8px',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.4rem',
                            textAlign: 'center',
                            minHeight: '3.25rem',
                            border: '1px solid var(--border-color)'
                        }}>
                            {isRecording
                                ? (transcript ? `"${transcript}"` : 'Listening... Speak now')
                                : (transcript ? `Transcript: "${transcript}"` : 'Click Start and speak your plea...')
                            }
                        </div>
                    </>
                ) : (
                    /* Fallback Input Form */
                    <form onSubmit={handleFallbackSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <div style={{ color: 'var(--accent-orange)', fontSize: '0.7rem', marginBottom: '0.2rem', textAlign: 'center' }}>
                            ⚠️ Speech recognition is unsupported. Type your plea instead:
                        </div>
                        <div className="input-container" style={{ display: 'flex', gap: '0.4rem' }}>
                            <input
                                type="text"
                                className="plead-input"
                                placeholder="Type your plea here..."
                                value={fallbackText}
                                onChange={(e) => setFallbackText(e.target.value)}
                                disabled={isLoading}
                                maxLength={150}
                                style={{ flex: 1 }}
                            />
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isLoading || !fallbackText.trim()}
                            >
                                {isLoading ? <span className="spinner"></span> : <span>Plead</span>}
                            </button>
                        </div>
                        <div className="input-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                                {fallbackText.length} / 150 chars
                            </span>
                        </div>
                    </form>
                )}

                {error && (
                    <div style={{ color: 'var(--accent-red)', fontSize: '0.7rem', marginTop: '0.2rem', textAlign: 'center', width: '100%' }}>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceRecorder;
