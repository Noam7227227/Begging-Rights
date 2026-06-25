import React, { useState, useEffect } from 'react';
import { getStatus, plead, resetStatus, forceOpen } from './services/api';
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

    // Automatically read the judge's reply aloud when it changes
    useEffect(() => {
        if (evaluation?.reply) {
            speak(evaluation.reply);
        }
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
            
            // Cancel any reading speech
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
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
                    <ResponseCard evaluation={evaluation} />
                </section>
            </main>

            <footer>
                <p>Begging Rights Voice Portal © 2026</p>
            </footer>
        </div>
    );
}

export default App;
