import React, { useState, useEffect, useRef } from 'react';
import { getStatus, plead, resetStatus, forceOpen, getSpeechAudio } from './services/api';
import { speak } from './services/speech.service';
import LockIndicator from './components/LockIndicator';
import StatusPanel from './components/StatusPanel';
import VoiceRecorder from './components/VoiceRecorder';
import ResponseCard from './components/ResponseCard';
import './styles/app.css';

function App() {
    const [status, setStatus] = useState('LOCKED');
    const [attempts, setAttempts] = useState(0);
    const [lastScore, setLastScore] = useState(0);

    const [isJudging, setIsJudging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [evaluation, setEvaluation] = useState(null);
    const [error, setError] = useState('');

    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const activeAudioRef = useRef(null);
    const lastSpokenEvaluationRef = useRef(null);

    // Fetch status from API
    const fetchStatus = async () => {
        try {
            const data = await getStatus();
            if (!isJudging) {
                setStatus(data.status);
                setAttempts(data.attempts);
                setLastScore(data.lastScore);
            }
        } catch (err) {
            console.error('Error fetching status:', err);
            setError('Could not connect to the backend server.');
        }
    };

    // Polling interval
    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 3000);
        return () => clearInterval(interval);
    }, [isJudging]);

    // Handle Text-To-Speech playback when the reply changes
    useEffect(() => {
        if (!evaluation?.reply) {
            lastSpokenEvaluationRef.current = null;
            return;
        }

        // Avoid starting duplicate voice playbacks for the same evaluation object
        if (lastSpokenEvaluationRef.current === evaluation) {
            return;
        }

        lastSpokenEvaluationRef.current = evaluation;

        const handleVoicePlayback = async () => {
            // Stop any currently playing ElevenLabs audio
            if (activeAudioRef.current) {
                activeAudioRef.current.pause();
                activeAudioRef.current = null;
            }

            // Cancel any browser Web Speech synthesis
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }

            setIsGeneratingAudio(true);
            try {
                // Request generated voice blob from ElevenLabs backend endpoint
                const blob = await getSpeechAudio(evaluation.reply);

                // If evaluation has changed since we started fetching, do not play
                if (lastSpokenEvaluationRef.current !== evaluation) {
                    return;
                }

                const audioUrl = URL.createObjectURL(blob);

                const audio = new Audio(audioUrl);
                activeAudioRef.current = audio;

                audio.onended = () => {
                    setIsGeneratingAudio(false);
                    URL.revokeObjectURL(audioUrl);
                    if (activeAudioRef.current === audio) {
                        activeAudioRef.current = null;
                    }
                };

                audio.onerror = (e) => {
                    console.warn('ElevenLabs audio playback failed, falling back to Web Speech API:', e);
                    setIsGeneratingAudio(false);
                    URL.revokeObjectURL(audioUrl);
                    if (activeAudioRef.current === audio) {
                        activeAudioRef.current = null;
                    }
                    // Only play fallback if the current evaluation is still active
                    if (lastSpokenEvaluationRef.current === evaluation) {
                        speak(evaluation.reply);
                    }
                };

                await audio.play();
            } catch (err) {
                console.warn('ElevenLabs generation failed, falling back to Web Speech API:', err.message);
                setIsGeneratingAudio(false);
                // Only play fallback if the current evaluation is still active
                if (lastSpokenEvaluationRef.current === evaluation) {
                    speak(evaluation.reply);
                }
            }
        };

        handleVoicePlayback();

        // Cleanup on unmount or reply change
        return () => {
            if (activeAudioRef.current) {
                activeAudioRef.current.pause();
            }
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, [evaluation]);

    // Submit plea handler
    const handlePleadSubmit = async (text) => {
        setIsLoading(true);
        setIsJudging(true);
        setError('');

        try {
            // Short delay to display a transition state in the UI
            await new Promise((resolve) => setTimeout(resolve, 800));

            const result = await plead(text);
            setEvaluation(result);

            // Sync status
            const updated = await getStatus();
            setStatus(updated.status);
            setAttempts(updated.attempts);
            setLastScore(updated.lastScore);
        } catch (err) {
            console.error('Error pleading:', err);
            setError('The Judge is currently unreachable.');
        } finally {
            setIsLoading(false);
            setIsJudging(false);
        }
    };

    // Admin reset
    const handleReset = async () => {
        try {
            setError('');
            const data = await resetStatus();
            setStatus(data.status);
            setAttempts(data.attempts);
            setLastScore(data.lastScore);
            setEvaluation(null);
        } catch (err) {
            console.error('Reset error:', err);
            setError('Failed to reset state.');
        }
    };

    // Admin force open
    const handleForceOpen = async () => {
        try {
            setError('');
            const data = await forceOpen();
            setStatus(data.status);
            setAttempts(data.attempts);
            setLastScore(data.lastScore);
        } catch (err) {
            console.error('Force open error:', err);
            setError('Failed to force open.');
        }
    };

    const currentVisualStatus = isJudging ? 'JUDGING' : status;

    return (
        <div className="app-container">
            <header>
                <div className="logo-section">
                    <h1>Begging Rights</h1>
                    <p>Voice Gate Portal</p>
                </div>
                <div className="admin-actions">
                    <button className="btn btn-outline btn-sm" onClick={handleForceOpen}>
                        Open
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={handleReset}>
                        Reset
                    </button>
                </div>
            </header>

            {error && (
                <div style={{ color: 'var(--accent-red)', fontSize: '0.75rem', textAlign: 'center', margin: '0.25rem 0' }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            <main className="dashboard-grid">
                <section className="sidebar-col">
                    <LockIndicator status={currentVisualStatus} />
                    <StatusPanel
                        status={status}
                        attempts={attempts}
                        lastScore={lastScore}
                    />
                </section>

                <section className="main-col">
                    <VoiceRecorder
                        onSubmit={handlePleadSubmit}
                        isLoading={isLoading}
                    />
                    <ResponseCard
                        evaluation={evaluation}
                        isGeneratingAudio={isGeneratingAudio}
                    />
                </section>
            </main>

            <footer>
                <p>Begging Rights Voice Portal © 2026</p>
            </footer>
        </div>
    );
}

export default App;
