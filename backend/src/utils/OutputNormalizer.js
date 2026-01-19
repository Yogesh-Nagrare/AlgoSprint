/**
 * Detects if output is an array-like format and normalizes it
 * Handles various formats:
 * - Space-separated: "1 2 3" → [1,2,3]
 * - Bracket format: "[1,2,3]" → [1,2,3]
 * - Newline separated: "1\n2\n3" → [1,2,3]
 */
const formatArrayOutput = (output, isArrayExpected = true) => {
    if (!output) return '';
    
    const trimmed = output.trim();
    
    // If it already has brackets, just normalize whitespace
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        return trimmed.replace(/\s+/g, '');
    }
    
    // If array is expected but output doesn't have brackets, add them
    if (isArrayExpected) {
        // Split by whitespace or newlines
        const elements = trimmed.split(/[\s\n]+/).filter(e => e.length > 0);
        return '[' + elements.join(',') + ']';
    }
    
    return trimmed;
};

/**
 * Normalizes output for comparison
 * Removes all whitespace for flexible matching
 */
const normalizeOutput = (output) => {
    if (!output) return '';
    return output.trim().replace(/\s+/g, '').toLowerCase();
};

/**
 * Smart comparison that handles both array and non-array outputs
 */
const compareOutputs = (actual, expected) => {
    // Check if expected output looks like an array
    const isArrayExpected = expected.trim().startsWith('[');
    
    // Format the actual output
    const formattedActual = formatArrayOutput(actual, isArrayExpected);
    const formattedExpected = formatArrayOutput(expected, isArrayExpected);
    
    // Normalize and compare
    return {
        match: normalizeOutput(formattedActual) === normalizeOutput(formattedExpected),
        formattedActual,
        formattedExpected,
        normalizedActual: normalizeOutput(formattedActual),
        normalizedExpected: normalizeOutput(formattedExpected)
    };
};
const convertExpectedOutputForJudge0 = (expectedOutput) => {
    if (!expectedOutput) return '';
    
    const trimmed = expectedOutput.trim();
    
    // If it's in bracket format [1,2,3], convert to space-separated
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        // Remove brackets and parse
        const withoutBrackets = trimmed.slice(1, -1);
        
        // Split by comma and rejoin with spaces
        const elements = withoutBrackets.split(',').map(e => e.trim());
        return elements.join(' ');
    }
    
    // If already space-separated or other format, return as-is
    return trimmed;
};
module.exports = { formatArrayOutput, normalizeOutput, compareOutputs, convertExpectedOutputForJudge0 };