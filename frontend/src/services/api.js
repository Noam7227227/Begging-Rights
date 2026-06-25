import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const getStatus = async () => {
    const response = await apiClient.get('/api/status');
    return response.data;
};

export const getLockState = async () => {
    const response = await apiClient.get('/api/lock/state');
    return response.data;
};

export const plead = async (text) => {
    const response = await apiClient.post('/api/plead', { text });
    return response.data;
};

export const resetStatus = async () => {
    const response = await apiClient.post('/api/admin/reset');
    return response.data;
};

export const forceOpen = async () => {
    const response = await apiClient.post('/api/admin/open');
    return response.data;
};

export const getSpeechAudio = async (text) => {
    const response = await apiClient.post('/api/tts', { text }, { responseType: 'blob' });
    return response.data;
};

export default {
    getStatus,
    getLockState,
    plead,
    resetStatus,
    forceOpen,
    getSpeechAudio
};
