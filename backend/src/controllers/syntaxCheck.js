// controllers/syntaxCheck.js
// ─── Local syntax checker — LeetCode fragment aware ──────────────────────────
// Key insight: LeetCode code is a FRAGMENT (no #include, no main).
// Strategy:
//   C++  → prepend #include<bits/stdc++.h> + using namespace std, shift line numbers back
//   JS   → node --check (works on fragments natively)
//   Java → wrap Solution inside public class Main
//   Python → py_compile (works on fragments natively)

const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);

// ─── C++ wrapper prepended to all fragment code ───────────────────────────────
// bits/stdc++.h pulls in EVERY standard header — eliminates all stdlib
// "not declared" / "not a member of std" false positives.
const CPP_WRAPPER_TOP = `#include <bits/stdc++.h>
using namespace std;
`;
const CPP_WRAPPER_LINE_OFFSET = CPP_WRAPPER_TOP.split('\n').length - 1; // = 2

// ─── Java wrapper ─────────────────────────────────────────────────────────────
const JAVA_WRAPPER_LINE_OFFSET = 1; // one "public class Main {" line before user code

// ─── Noise messages to suppress for C++ ──────────────────────────────────────
// These are ONLY triggered because the code is a bare fragment.
// After adding bits/stdc++.h most disappear, but a few edge cases remain.
const CPP_NOISE_PATTERNS = [
    // stdlib symbols the wrapper already covers
    /is not a member of 'std'/,
    // compiler "note:" lines — internal hints, not user errors
    /^\s*note:/i,
    // cascade errors from missing main()
    /expected declaration before '}'token/,
    // "candidates are" / "candidate:" suggestions
    /candidate:/,
];

const isCppNoise = (message) =>
    CPP_NOISE_PATTERNS.some(p => p.test(message));

// ─── Parse raw compiler output → [{line, col, type, message}] ─────────────────
const parseErrors = (output, language, wrapperOffset = 0) => {
    const errors = [];
    const lines  = output.split('\n').filter(Boolean);

    if (language === 'c++') {
        // g++ format: "/tmp/file.cpp:LINE:COL: error|warning|note: MESSAGE"
        const regex = /(?:[^:]+):(\d+):(\d+):\s*(error|warning|note):\s*(.+)/;
        for (const line of lines) {
            const match = line.match(regex);
            if (!match) continue;

            const rawLine = parseInt(match[1]);
            const col     = parseInt(match[2]);
            const type    = match[3];
            const message = match[4].trim();

            // Drop notes entirely
            if (type === 'note') continue;

            // Drop false positives from missing stdlib (now covered by wrapper)
            if (isCppNoise(message)) continue;

            // Adjust line number: subtract the wrapper lines we prepended
            const userLine = rawLine - wrapperOffset;

            // If error is in wrapper itself (line ≤ 0), skip
            if (userLine <= 0) continue;

            errors.push({ line: userLine, col, type, message, raw: line });
        }

    } else if (language === 'javascript') {
        // node --check: "file.js:LINE\n  code\n  ^\nSyntaxError: MESSAGE"
        const lineMatch = output.match(/:(\d+)\n/);
        const msgMatch  = output.match(/SyntaxError:\s*(.+)/);
        if (msgMatch) {
            errors.push({
                line:    lineMatch ? parseInt(lineMatch[1]) : 1,
                col:     null,
                type:    'error',
                message: msgMatch[1].trim(),
                raw:     output,
            });
        }

    } else if (language === 'java') {
        // javac: "Main.java:LINE: error: MESSAGE"
        const regex = /(?:[^:]+):(\d+):\s*(error|warning):\s*(.+)/;
        for (const line of lines) {
            const match = line.match(regex);
            if (!match) continue;
            const userLine = parseInt(match[1]) - wrapperOffset;
            if (userLine <= 0) continue;
            errors.push({
                line:    userLine,
                col:     null,
                type:    match[2],
                message: match[3].trim(),
                raw:     line,
            });
        }

    } else if (language === 'python') {
        // python3: "  File "x.py", line LINE\nSyntaxError: MESSAGE"
        const lineMatch = output.match(/line (\d+)/);
        const msgMatch  = output.match(/SyntaxError:\s*(.+)/);
        if (msgMatch) {
            errors.push({
                line:    lineMatch ? parseInt(lineMatch[1]) : 1,
                col:     null,
                type:    'error',
                message: msgMatch[1].trim(),
                raw:     output,
            });
        }
    }

    return errors;
};

// ─── Detect LeetCode fragments ────────────────────────────────────────────────
const isCppFragment  = (code) => !/#include/.test(code) || !/int\s+main\s*\(/.test(code);
const isJavaFragment = (code) => /class\s+Solution/.test(code) || !/public\s+static\s+void\s+main/.test(code);

// ─── Main controller ──────────────────────────────────────────────────────────
const syntaxCheck = async (req, res) => {
    let tempFile = null;

    try {
        let { code, language } = req.body;

        if (!code || !language) {
            return res.status(400).json({ error: 'Missing code or language' });
        }

        language = language.toLowerCase();
        if (language === 'cpp') language = 'c++';

        const tmpDir  = os.tmpdir();
        const tmpName = `sc_${Date.now()}_${Math.random().toString(36).slice(2)}`;

        let codeToWrite   = code;
        let wrapperOffset = 0;
        let cmd           = '';

        // ── Build per-language config ──────────────────────────────────────────
        if (language === 'c++') {
            tempFile = path.join(tmpDir, `${tmpName}.cpp`);

            if (isCppFragment(code)) {
                // Prepend universal headers — kills all stdlib false positives
                codeToWrite   = CPP_WRAPPER_TOP + code;
                wrapperOffset = CPP_WRAPPER_LINE_OFFSET; // 2
            }

            // -Wno-unused-* avoids spammy warnings on LeetCode boilerplate
            cmd = `g++ -fsyntax-only -std=c++17 -Wall -Wno-unused-variable -Wno-unused-but-set-variable -Wno-unused-parameter "${tempFile}" 2>&1`;

        } else if (language === 'javascript') {
            tempFile = path.join(tmpDir, `${tmpName}.js`);
            cmd      = `node --check "${tempFile}" 2>&1`;
            // No wrapper needed — node --check handles fragments fine

        } else if (language === 'java') {
            tempFile = path.join(tmpDir, 'Main.java');

            if (isJavaFragment(code)) {
                // Javac needs a public class matching filename.
                // Remove public from Solution so it can live inside Main.
                const inner = code.replace(/public\s+class\s+Solution/, 'class Solution');
                codeToWrite   = `public class Main {\n${inner}\n}`;
                wrapperOffset = JAVA_WRAPPER_LINE_OFFSET;
            } else {
                codeToWrite = code.replace(/public\s+class\s+\w+/, 'public class Main');
            }

            cmd = `javac "${tempFile}" 2>&1`;

        } else if (language === 'python' || language === 'python3') {
            tempFile = path.join(tmpDir, `${tmpName}.py`);
            cmd      = `python3 -m py_compile "${tempFile}" 2>&1`;
            // py_compile handles fragments fine

        } else {
            return res.status(200).json({
                supported: false,
                message:   `Syntax check not available for ${language}`,
            });
        }

        // ── Write temp file ────────────────────────────────────────────────────
        fs.writeFileSync(tempFile, codeToWrite, 'utf8');

        // ── Run compiler ───────────────────────────────────────────────────────
        let output    = '';
        let hasErrors = false;

        try {
            const { stdout, stderr } = await execAsync(cmd, {
                timeout:   8000,
                maxBuffer: 1024 * 64,
            });
            output    = ((stdout || '') + (stderr || '')).trim();
            hasErrors = false; // exit 0 = no errors
        } catch (execErr) {
            output    = ((execErr.stdout || '') + (execErr.stderr || '')).trim();
            hasErrors = true;
        }

        // ── Parse & filter ─────────────────────────────────────────────────────
        const errors = hasErrors ? parseErrors(output, language, wrapperOffset) : [];

        // After filtering noise, re-evaluate: do any real errors remain?
        const finalHasErrors = errors.some(e => e.type === 'error');

        // ── Java: clean up .class files ────────────────────────────────────────
        if (language === 'java') {
            ['Main.class', 'Solution.class'].forEach(f => {
                const fp = path.join(tmpDir, f);
                if (fs.existsSync(fp)) try { fs.unlinkSync(fp); } catch {}
            });
        }

        return res.status(200).json({
            supported:  true,
            hasErrors:  finalHasErrors,  // true only if real user errors remain
            errors,                       // cleaned, line-adjusted [{line,col,type,message}]
            rawOutput:  output,
        });

    } catch (err) {
        console.error('Syntax check error:', err.message);
        return res.status(200).json({
            supported: false,
            message:   `Syntax check failed: ${err.message}`,
        });
    } finally {
        if (tempFile && fs.existsSync(tempFile)) {
            try { fs.unlinkSync(tempFile); } catch {}
        }
    }
};

module.exports = { syntaxCheck };