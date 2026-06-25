import React from 'react';

const StatusPanel = ({ status, attempts, lastScore }) => {
    // Format status nicely for human reading
    const formatStatus = (s) => {
        if (!s) return 'UNKNOWN';
        if (s === 'OPEN_REQUESTED') return 'OPEN REQ';
        return s;
    };

    return (
        <div className="glass-card">
            <h3 className="panel-title">Gate Telemetry</h3>
            <div className="stats-grid">
                <div className="stat-box">
                    <span className="stat-label">Status</span>
                    <span className={`stat-value label-${status === 'OPEN_REQUESTED' ? 'OPENED' : status}`} style={{ fontSize: '0.8rem' }}>
                        {formatStatus(status)}
                    </span>
                </div>
                
                <div className="stat-box">
                    <span className="stat-label">Pleadings</span>
                    <span className="stat-value">{attempts}</span>
                </div>
                
                <div className="stat-box">
                    <span className="stat-label">Score</span>
                    <span className="stat-value score">{lastScore}</span>
                </div>
            </div>
        </div>
    );
};

export default StatusPanel;
