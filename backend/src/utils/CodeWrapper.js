/**
 * Wraps LeetCode-style class methods with a complete main() function
 * Handles input parsing and output formatting automatically
 */

const wrapCode = (code, language, functionSignature, inputFormat, outputFormat) => {
    // Normalize language
    const lang = language.toLowerCase();
    
    if (lang === 'c++' || lang === 'cpp') {
        return wrapCppCode(code, functionSignature);
    } else if (lang === 'java') {
        return wrapJavaCode(code, functionSignature);
    } else if (lang === 'javascript' || lang === 'js') {
        return wrapJavaScriptCode(code, functionSignature);
    }
    
    // If no wrapping needed, return as-is
    return code;
};

/**
 * Parse function signature to extract details
 * Supports both C++/Java and TypeScript formats
 */
const parseFunctionSignature = (signature) => {
    // Remove extra whitespace and normalize
    const cleaned = signature.trim().replace(/\s+/g, ' ');
    
    // Check if it's TypeScript/JavaScript format: functionName(param: type, ...): returnType
    const tsMatch = cleaned.match(/^(\w+)\((.*?)\):\s*(.+)$/);
    
    if (tsMatch) {
        // TypeScript format
        const functionName = tsMatch[1].trim();
        const paramsStr = tsMatch[2].trim();
        const returnType = tsMatch[3].trim();
        
        // Parse TypeScript parameters: "nums: number[], k: number"
        const params = [];
        if (paramsStr) {
            const paramList = paramsStr.split(',');
            for (const p of paramList) {
                const [name, type] = p.split(':').map(s => s.trim());
                if (name && type) {
                    params.push({ name, type });
                }
            }
        }
        
        return { returnType, functionName, params };
    }
    
    // C++/Java format: returnType functionName(params)
    const cppMatch = cleaned.match(/^(\S+(?:<[^>]+>)?)\s+(\w+)\((.*)\)$/);
    
    if (!cppMatch) {
        console.error('Failed to parse signature:', signature);
        throw new Error(`Invalid function signature: ${signature}. Expected format: "returnType functionName(params)" or "functionName(params): returnType"`);
    }
    
    const returnType = cppMatch[1].trim();
    const functionName = cppMatch[2].trim();
    const paramsStr = cppMatch[3].trim();
    
    // Parse C++/Java parameters
    const params = [];
    if (paramsStr) {
        const paramList = paramsStr.split(',');
        for (const p of paramList) {
            const parts = p.trim().split(/\s+/);
            const name = parts[parts.length - 1].replace(/[&*]/g, '');
            const type = parts.slice(0, -1).join(' ').replace(/&/g, '').trim();
            
            if (name) {
                params.push({ name, type });
            }
        }
    }
    
    return { returnType, functionName, params };
};

/**
 * Wraps C++ LeetCode-style code
 */
const wrapCppCode = (code, functionSignature) => {
    const { returnType, functionName, params } = parseFunctionSignature(functionSignature);
    
    // Generate input parsing code
    const inputParsing = generateCppInputParsing(params);
    
    // Generate function call
    const functionCall = generateCppFunctionCall(functionName, params, returnType);
    
    // Generate output code
    const outputCode = generateCppOutput(returnType, params);
    
    return `#include <bits/stdc++.h>
using namespace std;

${code}

int main(){
${inputParsing}
    
    Solution solution;
${functionCall}
${outputCode}
    
    return 0;
}`;
};

/**
 * Generate C++ input parsing code
 */
const generateCppInputParsing = (params) => {
    let code = '';
    
    for (const param of params) {
        const { name, type } = param;
        
        if (type.includes('vector<int>')) {
            code += `    int n_${name};\n`;
            code += `    cin >> n_${name};\n`;
            code += `    vector<int> ${name}(n_${name});\n`;
            code += `    for(int i = 0; i < n_${name}; i++)\n`;
            code += `        cin >> ${name}[i];\n`;
        } else if (type.includes('vector<vector<int>>')) {
            code += `    int rows_${name}, cols_${name};\n`;
            code += `    cin >> rows_${name};\n`;
            code += `    vector<vector<int>> ${name}(rows_${name});\n`;
            code += `    for(int i = 0; i < rows_${name}; i++){\n`;
            code += `        cin >> cols_${name};\n`;
            code += `        ${name}[i].resize(cols_${name});\n`;
            code += `        for(int j = 0; j < cols_${name}; j++)\n`;
            code += `            cin >> ${name}[i][j];\n`;
            code += `    }\n`;
        } else if (type.includes('string')) {
            code += `    string ${name};\n`;
            code += `    cin >> ${name};\n`;
        } else if (type.includes('int') || type.includes('long')) {
            code += `    ${type} ${name};\n`;
            code += `    cin >> ${name};\n`;
        } else if (type.includes('double') || type.includes('float')) {
            code += `    ${type} ${name};\n`;
            code += `    cin >> ${name};\n`;
        } else if (type.includes('bool')) {
            code += `    bool ${name};\n`;
            code += `    cin >> ${name};\n`;
        } else {
            // Default: simple input
            code += `    ${type} ${name};\n`;
            code += `    cin >> ${name};\n`;
        }
    }
    
    return code;
};

/**
 * Generate C++ function call
 */
const generateCppFunctionCall = (functionName, params, returnType) => {
    const paramNames = params.map(p => p.name).join(', ');
    
    if (returnType === 'void') {
        return `    solution.${functionName}(${paramNames});`;
    } else {
        return `    auto result = solution.${functionName}(${paramNames});`;
    }
};

/**
 * Generate C++ output code
 */
const generateCppOutput = (returnType, params) => {
    if (returnType === 'void') {
        // For void functions, output the first modified parameter (usually vector)
        const firstVectorParam = params.find(p => p.type.includes('vector'));
        if (firstVectorParam) {
            const name = firstVectorParam.name;
            if (firstVectorParam.type.includes('vector<vector')) {
                // 2D array output
                return `    for(int i = 0; i < ${name}.size(); i++){\n` +
                       `        for(int j = 0; j < ${name}[i].size(); j++){\n` +
                       `            if(j > 0) cout << " ";\n` +
                       `            cout << ${name}[i][j];\n` +
                       `        }\n` +
                       `        if(i < ${name}.size() - 1) cout << "\\n";\n` +
                       `    }`;
            } else {
                // 1D array output
                return `    for(int i = 0; i < ${name}.size(); i++){\n` +
                       `        if(i > 0) cout << " ";\n` +
                       `        cout << ${name}[i];\n` +
                       `    }`;
            }
        }
        return '';
    }
    
    if (returnType.includes('vector<int>')) {
        return `    for(int i = 0; i < result.size(); i++){\n` +
               `        if(i > 0) cout << " ";\n` +
               `        cout << result[i];\n` +
               `    }`;
    } else if (returnType.includes('vector<vector<int>>')) {
        return `    for(int i = 0; i < result.size(); i++){\n` +
               `        for(int j = 0; j < result[i].size(); j++){\n` +
               `            if(j > 0) cout << " ";\n` +
               `            cout << result[i][j];\n` +
               `        }\n` +
               `        if(i < result.size() - 1) cout << "\\n";\n` +
               `    }`;
    } else if (returnType.includes('bool')) {
        return `    cout << (result ? "true" : "false");`;
    } else {
        return `    cout << result;`;
    }
};

/**
 * Wraps Java LeetCode-style code
 */
const wrapJavaCode = (code, functionSignature) => {
    const { returnType, functionName, params } = parseFunctionSignature(functionSignature);
    
    const inputParsing = generateJavaInputParsing(params);
    const functionCall = generateJavaFunctionCall(functionName, params, returnType);
    const outputCode = generateJavaOutput(returnType, params);
    
    return `import java.util.*;
import java.io.*;

${code}

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
${inputParsing}
        
        Solution solution = new Solution();
${functionCall}
${outputCode}
        
        scanner.close();
    }
}`;
};

const generateJavaInputParsing = (params) => {
    let code = '';
    
    for (const param of params) {
        const { name, type } = param;
        
        if (type.includes('int[]')) {
            code += `        int n_${name} = scanner.nextInt();\n`;
            code += `        int[] ${name} = new int[n_${name}];\n`;
            code += `        for(int i = 0; i < n_${name}; i++)\n`;
            code += `            ${name}[i] = scanner.nextInt();\n`;
        } else if (type.includes('String')) {
            code += `        String ${name} = scanner.next();\n`;
        } else if (type.includes('int')) {
            code += `        int ${name} = scanner.nextInt();\n`;
        } else if (type.includes('long')) {
            code += `        long ${name} = scanner.nextLong();\n`;
        } else if (type.includes('double')) {
            code += `        double ${name} = scanner.nextDouble();\n`;
        } else if (type.includes('boolean')) {
            code += `        boolean ${name} = scanner.nextBoolean();\n`;
        }
    }
    
    return code;
};

const generateJavaFunctionCall = (functionName, params, returnType) => {
    const paramNames = params.map(p => p.name).join(', ');
    
    if (returnType === 'void') {
        return `        solution.${functionName}(${paramNames});`;
    } else {
        return `        var result = solution.${functionName}(${paramNames});`;
    }
};

const generateJavaOutput = (returnType, params) => {
    if (returnType === 'void') {
        const firstArrayParam = params.find(p => p.type.includes('[]'));
        if (firstArrayParam) {
            const name = firstArrayParam.name;
            return `        for(int i = 0; i < ${name}.length; i++){\n` +
                   `            if(i > 0) System.out.print(" ");\n` +
                   `            System.out.print(${name}[i]);\n` +
                   `        }`;
        }
        return '';
    }
    
    if (returnType.includes('int[]')) {
        return `        for(int i = 0; i < result.length; i++){\n` +
               `            if(i > 0) System.out.print(" ");\n` +
               `            System.out.print(result[i]);\n` +
               `        }`;
    } else if (returnType.includes('boolean')) {
        return `        System.out.print(result);`;
    } else {
        return `        System.out.print(result);`;
    }
};

/**
 * Wraps JavaScript LeetCode-style code
 */
const wrapJavaScriptCode = (code, functionSignature) => {
    const { returnType, functionName, params } = parseFunctionSignature(functionSignature);
    
    const inputParsing = generateJSInputParsing(params);
    const functionCall = generateJSFunctionCall(functionName, params, returnType);
    const outputCode = generateJSOutput(returnType, params);
    
    return `const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

${code}

let lines = [];
rl.on('line', (line) => {
    lines.push(line);
}).on('close', () => {
    let idx = 0;
${inputParsing}
    
    const solution = new Solution();
${functionCall}
${outputCode}
});`;
};

const generateJSInputParsing = (params) => {
    let code = '';
    
    for (const param of params) {
        const { name, type } = param;
        
        if (type.includes('number[]') || type.includes('int[]')) {
            code += `    const n_${name} = parseInt(lines[idx++]);\n`;
            code += `    const ${name} = lines[idx++].split(' ').map(Number);\n`;
        } else if (type.includes('string')) {
            code += `    const ${name} = lines[idx++];\n`;
        } else if (type.includes('number') || type.includes('int')) {
            code += `    const ${name} = parseInt(lines[idx++]);\n`;
        } else if (type.includes('boolean')) {
            code += `    const ${name} = lines[idx++] === 'true';\n`;
        }
    }
    
    return code;
};

const generateJSFunctionCall = (functionName, params, returnType) => {
    const paramNames = params.map(p => p.name).join(', ');
    
    if (returnType === 'void') {
        return `    solution.${functionName}(${paramNames});`;
    } else {
        return `    const result = solution.${functionName}(${paramNames});`;
    }
};

const generateJSOutput = (returnType, params) => {
    if (returnType === 'void') {
        const firstArrayParam = params.find(p => p.type.includes('[]'));
        if (firstArrayParam) {
            return `    console.log(${firstArrayParam.name}.join(' '));`;
        }
        return '';
    }
    
    if (returnType.includes('[]')) {
        return `    console.log(result.join(' '));`;
    } else if (returnType.includes('boolean')) {
        return `    console.log(result);`;
    } else {
        return `    console.log(result);`;
    }
};

module.exports = { wrapCode, parseFunctionSignature };