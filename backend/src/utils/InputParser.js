// const preprocessInput = (input) => {
//     const lines = input.trim().split('\n');
    
//     const processedLines = lines.map(line => {
//         let cleaned = line.trim();
        
//         // Handle multiple variable assignments on the same line
//         // Example: "nums = [-1,2,1,-4], target = 1"
//         if (cleaned.includes('=')) {
//             // Split by comma that's NOT inside brackets
//             const parts = splitByCommaOutsideBrackets(cleaned);
            
//             const processedParts = parts.map(part => {
//                 const trimmedPart = part.trim();
                
//                 // Extract value after '='
//                 if (trimmedPart.includes('=')) {
//                     const value = trimmedPart.split('=')[1].trim();
                    
//                     // Check if it's an array
//                     if (value.includes('[')) {
//                         try {
//                             const parsed = JSON.parse(value);
//                             return convertToStdin(parsed);
//                         } catch (e) {
//                             return value;
//                         }
//                     }
                    
//                     return value;
//                 }
                
//                 return trimmedPart;
//             });
            
//             return processedParts.join('\n');
//         }
        
//         // If no '=', check if it's just an array
//         const noSpaces = cleaned.replace(/\s+/g, '');
//         if (noSpaces.includes('[')) {
//             try {
//                 const parsed = JSON.parse(noSpaces);
//                 return convertToStdin(parsed);
//             } catch (e) {
//                 return cleaned;
//             }
//         }
        
//         return cleaned;
//     });
    
//     return processedLines.join('\n');
// };

// // Helper function to split by comma outside brackets
// const splitByCommaOutsideBrackets = (str) => {
//     const parts = [];
//     let current = '';
//     let bracketDepth = 0;
    
//     for (let i = 0; i < str.length; i++) {
//         const char = str[i];
        
//         if (char === '[') {
//             bracketDepth++;
//             current += char;
//         } else if (char === ']') {
//             bracketDepth--;
//             current += char;
//         } else if (char === ',' && bracketDepth === 0) {
//             // Comma outside brackets - split here
//             parts.push(current);
//             current = '';
//         } else {
//             current += char;
//         }
//     }
    
//     // Add the last part
//     if (current) {
//         parts.push(current);
//     }
    
//     return parts;
// };

// const convertToStdin = (arr) => {
//     if (!Array.isArray(arr)) {
//         return String(arr);
//     }
    
//     // For 1D array: [1,2,3] → "3\n1 2 3"
//     if (!Array.isArray(arr[0])) {
//         return `${arr.length}\n${arr.join(' ')}`;
//     }
    
//     // For 2D array: [[1,2],[3,4]] → "2\n2\n1 2\n2\n3 4"
//     const rows = arr.length;
//     const result = [rows];
    
//     arr.forEach(row => {
//         result.push(row.length);
//         result.push(row.join(' '));
//     });
    
//     return result.join('\n');
// };

// module.exports = { preprocessInput };
/**
 * Enhanced input preprocessor that handles multiple formats:
 * 1. Simple values: "5" → "5"
 * 2. Arrays with assignment: "nums = [1,2,3]" → "3\n1 2 3"
 * 3. Multiple assignments: "nums = [1,2,3], target = 5" → "3\n1 2 3\n5"
 * 4. Direct arrays: "[1,2,3]" → "3\n1 2 3"
 * 5. Already formatted: "3\n1 2 3" → "3\n1 2 3"
 */
const preprocessInput = (input) => {
    if (!input) return '';
    
    const trimmed = input.trim();
    
    // Check if input is already in proper stdin format (contains newlines with numbers)
    if (trimmed.includes('\n')) {
        const lines = trimmed.split('\n');
        // If first line is a number and second line exists, it's likely already formatted
        if (lines.length > 1 && !isNaN(parseInt(lines[0]))) {
            return trimmed;
        }
    }
    
    const lines = trimmed.split('\n');
    const processedLines = lines.map(line => {
        let cleaned = line.trim();
        
        // Handle multiple variable assignments on the same line
        // Example: "nums = [-1,2,1,-4], target = 1"
        if (cleaned.includes('=')) {
            // Split by comma that's NOT inside brackets
            const parts = splitByCommaOutsideBrackets(cleaned);
            
            const processedParts = parts.map(part => {
                const trimmedPart = part.trim();
                
                // Extract value after '='
                if (trimmedPart.includes('=')) {
                    const value = trimmedPart.split('=')[1].trim();
                    
                    // Check if it's an array
                    if (value.includes('[')) {
                        try {
                            const parsed = JSON.parse(value);
                            return convertToStdin(parsed);
                        } catch (e) {
                            console.error('Failed to parse array:', value);
                            return value;
                        }
                    }
                    
                    // Simple value
                    return value;
                }
                
                return trimmedPart;
            });
            
            return processedParts.join('\n');
        }
        
        // If no '=', check if it's just an array
        const noSpaces = cleaned.replace(/\s+/g, '');
        if (noSpaces.includes('[')) {
            try {
                const parsed = JSON.parse(noSpaces);
                return convertToStdin(parsed);
            } catch (e) {
                console.error('Failed to parse direct array:', noSpaces);
                return cleaned;
            }
        }
        
        // Simple value (number, string, etc.)
        return cleaned;
    });
    
    return processedLines.join('\n');
};

// Helper function to split by comma outside brackets
const splitByCommaOutsideBrackets = (str) => {
    const parts = [];
    let current = '';
    let bracketDepth = 0;
    
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        
        if (char === '[') {
            bracketDepth++;
            current += char;
        } else if (char === ']') {
            bracketDepth--;
            current += char;
        } else if (char === ',' && bracketDepth === 0) {
            // Comma outside brackets - split here
            parts.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    // Add the last part
    if (current.trim()) {
        parts.push(current);
    }
    
    return parts;
};

/**
 * Converts array to stdin format
 * 1D: [1,2,3] → "3\n1 2 3"
 * 2D: [[1,2],[3,4]] → "2\n2\n1 2\n2\n3 4"
 */
const convertToStdin = (arr) => {
    if (!Array.isArray(arr)) {
        return String(arr);
    }
    
    // For 1D array: [1,2,3] → "3\n1 2 3"
    if (!Array.isArray(arr[0])) {
        return `${arr.length}\n${arr.join(' ')}`;
    }
    
    // For 2D array: [[1,2],[3,4]] → "2\n2\n1 2\n2\n3 4"
    const rows = arr.length;
    const result = [rows];
    
    arr.forEach(row => {
        result.push(row.length);
        result.push(row.join(' '));
    });
    
    return result.join('\n');
};

module.exports = { preprocessInput };