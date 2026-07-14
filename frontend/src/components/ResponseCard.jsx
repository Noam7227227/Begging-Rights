/**
 * ResponseCard component
 * Shows the AI judge's evaluation, score, and whether audio generation is in progress.
 * @component
 * @param {{evaluation: {score:number,shouldOpen:boolean,reply:string}, isGeneratingAudio:boolean}} props
 */
import React from 'react';

const ResponseCard = ({ evaluation, isGeneratingAudio }) => {
    if (!evaluation) {
        return (
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '150px', color: 'var(--text-secondary)' }}>
                <div style={{ textAlign: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '0.75rem', opacity: 0.5 }}>
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <p>No pleading results yet. Submit a plea above.</p>
                </div>
            </div>
        );
    }

    const { score, shouldOpen, reply } = evaluation;

    return (
        <div className="glass-card response-container">
            <div className="response-header">
                <h3 className="panel-title" style={{ margin: 0 }}>Judgment Verdict</h3>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    {isGeneratingAudio && (
                        <span className="response-badge" style={{ background: 'rgba(167, 139, 250, 0.15)', color: 'var(--accent-purple)', border: '1px solid rgba(167, 139, 250, 0.25)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span className="spinner" style={{ width: '8px', height: '8px', border: '1.2px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff' }}></span>
                            <span>Speaking...</span>
                        </span>
                    )}
                    <span className={`response-badge ${shouldOpen ? 'success' : 'fail'}`}>
                        {shouldOpen ? 'Approved' : 'Denied'}
                    </span>
                </div>
            </div>

            <div className="response-reply-box">
                "{reply}"
            </div>

            <div className="score-gauge-wrapper">
                <div className="score-gauge-label">
                    <span>Judge's Verdict Score</span>
                    <span style={{ fontWeight: '700', color: shouldOpen ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                        {score} / 100
                    </span>
                </div>

                <div className="score-gauge-bg">
                    <div
                        className={`score-gauge-fill ${shouldOpen ? 'success' : 'fail'}`}
                        style={{ width: `${score}%` }}
                    />
                    <div className="score-threshold-marker" title="Pass threshold (80)" />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>0</span>
                    <span style={{ position: 'relative', left: '30px' }}>Target (80)</span>
                    <span>100</span>
                </div>
            </div>
        </div>
    );
};

export default ResponseCard;
