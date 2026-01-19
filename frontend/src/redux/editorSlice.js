// src/redux/editorSlice.js
import { createSlice } from '@reduxjs/toolkit';

const loadState = () => {
    try {
        const serializedState = localStorage.getItem('editor_code');
        if (serializedState === null) {
            return { userCode: {}, lastSelectedLanguage: {} };
        }
        const parsed = JSON.parse(serializedState);
        
        // IMPORTANT: Ensure both keys exist to prevent "undefined" crashes
        return {
            userCode: parsed.userCode || {},
            lastSelectedLanguage: parsed.lastSelectedLanguage || {}
        };
    } catch (err) {
        return { userCode: {}, lastSelectedLanguage: {} };
    }
};

const editorSlice = createSlice({
    name: 'editor',
    initialState: loadState(), // Uses the safe loader above
    reducers: {
        updateCode: (state, action) => {
            const { problemId, language, code } = action.payload;
            if (!state.userCode[problemId]) state.userCode[problemId] = {};
            state.userCode[problemId][language] = code;
            localStorage.setItem('editor_code', JSON.stringify(state));
        },
        setPersistedLanguage: (state, action) => {
            const { problemId, language } = action.payload;
            if (!state.lastSelectedLanguage) state.lastSelectedLanguage = {};
            state.lastSelectedLanguage[problemId] = language;
            localStorage.setItem('editor_code', JSON.stringify(state));
        }
    },
});

export const { updateCode, setPersistedLanguage } = editorSlice.actions;
export default editorSlice.reducer;