/**
 * LockIndicator component
 * Visual indicator showing current lock state with iconography and descriptions.
 * @component
 * @param {{status: string}} props
 */
import React from 'react';

const LockIndicator = ({ status }) => {
    // Determine the icon and visual text based on status
    const renderContent = () => {
        switch (status) {
            case 'OPENED':
            case 'OPEN_REQUESTED':
                return {
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                        </svg>
                    ),
                    label: 'Opened',
                    desc: 'The gate is unlocked! Access granted.'
                };
            case 'REJECTED':
                return {
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            <line x1="9" y1="15" x2="15" y2="15"></line>
                        </svg>
                    ),
                    label: 'Rejected',
                    desc: 'Plea denied by the judge. Try again.'
                };
            case 'JUDGING':
                return {
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m14 13-5 5 3 3 5-5z"></path>
                            <path d="m3 21 6-6"></path>
                            <path d="m16 5 2 2-7 7-2-2z"></path>
                            <path d="m19 2 3 3-3 3-3-3z"></path>
                        </svg>
                    ),
                    label: 'Judging',
                    desc: 'The judge is evaluating your plea...'
                };
            case 'LOCKED':
            default:
                return {
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            <circle cx="12" cy="16" r="1"></circle>
                        </svg>
                    ),
                    label: 'Locked',
                    desc: 'Access restricted. Please plead your case.'
                };
        }
    };

    const { icon, label, desc } = renderContent();
    const normalizedStatus = status === 'OPEN_REQUESTED' ? 'OPENED' : status;

    return (
        <div className="glass-card lock-indicator-wrapper">
            <h3 className="panel-title" style={{ width: '100%', textAlign: 'left' }}>Security Lock</h3>
            
            <div className={`lock-shield ${normalizedStatus}`}>
                <div className="lock-icon">{icon}</div>
            </div>
            
            <div className={`lock-status-label label-${normalizedStatus}`}>
                {label}
            </div>
            <div className="lock-status-desc">{desc}</div>
        </div>
    );
};

export default LockIndicator;
