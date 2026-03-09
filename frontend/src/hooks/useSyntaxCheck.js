// hooks/useSyntaxCheck.js
// ─── Syntax checker hook ──────────────────────────────────────────────────────
// TWO modes:
//   1. Passive: debounced check as user types (background, no blocking)
//   2. Active:  checkNow() — called imperatively on Run click, returns result
//
// Usage in ProblemPage.jsx:
//
//   const { syntaxErrors, isChecking, checkNow } = useSyntaxCheck(code, language);
//
//   const handleRun = async () => {
//       const result = await checkNow();           // instant, no debounce
//       if (result.hasErrors) return;              // stop — console already shows errors
//       // ... call Judge0
//   };

import { useState, useEffect, useRef, useCallback } from 'react';
import axiosClient from '../utils/axiosClient'; // adjust import path if needed

// ─── Core API call ────────────────────────────────────────────────────────────
const runSyntaxCheck = async (code, language, signal) => {
    const res = await axiosClient.post(
        '/submission/syntax-check',
        { code, language },
        { signal }
    );
    return res.data; // { supported, hasErrors, errors, rawOutput }
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useSyntaxCheck = (code, language, debounceMs = 800) => {
    const [syntaxErrors, setSyntaxErrors] = useState([]);
    const [isChecking,   setIsChecking]   = useState(false);
    const [supported,    setSupported]    = useState(true);
    const debounceRef   = useRef(null);
    const abortRef      = useRef(null);
    const lastKeyRef    = useRef('');

    // ── Internal check runner ─────────────────────────────────────────────────
    const _doCheck = useCallback(async (c, l, signal) => {
        if (!c?.trim() || !l) return { supported: false, hasErrors: false, errors: [] };
        try {
            const data = await runSyntaxCheck(c, l, signal);
            if (!data.supported) {
                setSupported(false);
                setSyntaxErrors([]);
                return data;
            }
            setSupported(true);
            setSyntaxErrors(data.errors || []);
            return data;
        } catch (err) {
            if (err.name === 'CanceledError' || err.name === 'AbortError') {
                return { supported: true, hasErrors: false, errors: [], aborted: true };
            }
            // Network/server error — don't block user
            setSyntaxErrors([]);
            return { supported: false, hasErrors: false, errors: [] };
        }
    }, []);

    // ── Passive: debounced background check as user types ─────────────────────
    useEffect(() => {
        const key = `${language}::${code}`;
        if (key === lastKeyRef.current) return;

        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (abortRef.current) abortRef.current.abort();

        debounceRef.current = setTimeout(async () => {
            abortRef.current = new AbortController();
            lastKeyRef.current = key;
            setIsChecking(true);
            await _doCheck(code, language, abortRef.current.signal);
            setIsChecking(false);
        }, debounceMs);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [code, language, debounceMs, _doCheck]);

    // ── Active: called imperatively on Run click ───────────────────────────────
    // Returns { hasErrors, errors } synchronously after awaiting
    // Cancels any in-flight debounced check first
    const checkNow = useCallback(async () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (abortRef.current) abortRef.current.abort();

        if (!code?.trim() || !language) {
            return { supported: false, hasErrors: false, errors: [] };
        }

        abortRef.current = new AbortController();
        lastKeyRef.current = `${language}::${code}`;

        setIsChecking(true);
        const result = await _doCheck(code, language, abortRef.current.signal);
        setIsChecking(false);

        return result;
    }, [code, language, _doCheck]);

    return {
        syntaxErrors,                                        // [{line, col, type, message}]
        isChecking,
        supported,
        hasSyntaxErrors: syntaxErrors.some(e => e.type === 'error'),
        errorCount:      syntaxErrors.filter(e => e.type === 'error').length,
        warningCount:    syntaxErrors.filter(e => e.type === 'warning').length,
        checkNow,                                            // ← call this on Run click
        clearErrors: () => setSyntaxErrors([]),
    };
};